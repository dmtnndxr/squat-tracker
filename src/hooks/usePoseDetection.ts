import { useCallback, useEffect, useRef, useState } from "react";
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import type { ExerciseType, Point, PoseEvaluation } from "../types/exercise";
import { evaluateExercisePose, getExerciseAngle } from "../utils/landmarks";
import { appendWindowValue, averageWindow } from "../utils/smoothing";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm";
const SMOOTHING_WINDOW = 5;

type UsePoseDetectionArgs = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  exercise: ExerciseType;
  isCameraActive: boolean;
  onPose: (exercise: ExerciseType, evaluation: PoseEvaluation) => void;
};

export function usePoseDetection({
  videoRef,
  canvasRef,
  exercise,
  isCameraActive,
  onPose,
}: UsePoseDetectionArgs) {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const angleWindowRef = useRef<number[]>([]);
  const onPoseRef = useRef(onPose);
  const exerciseRef = useRef(exercise);
  const [isModelReady, setIsModelReady] = useState(false);
  const [poseError, setPoseError] = useState<string | null>(null);
  const [latestEvaluation, setLatestEvaluation] = useState<PoseEvaluation>({
    poseState: "unknown",
    isPersonDetected: false,
    status: "No person detected",
    angle: null,
  });

  useEffect(() => {
    onPoseRef.current = onPose;
  }, [onPose]);

  useEffect(() => {
    exerciseRef.current = exercise;
    angleWindowRef.current = [];
  }, [exercise]);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        if (cancelled) {
          poseLandmarker.close();
          return;
        }

        poseLandmarkerRef.current = poseLandmarker;
        setIsModelReady(true);
      } catch (error) {
        setPoseError(error instanceof Error ? error.message : "Unable to load pose model");
      }
    }

    void loadModel();

    return () => {
      cancelled = true;
      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  const drawLandmarks = useCallback(
    (landmarks: NormalizedLandmark[]) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) {
        return;
      }

      const width = video.videoWidth || video.clientWidth;
      const height = video.videoHeight || video.clientHeight;

      if (!width || !height) {
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.clearRect(0, 0, width, height);

      const drawingUtils = new DrawingUtils(context);
      drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
        color: "#23c483",
        lineWidth: 4,
      });
      drawingUtils.drawLandmarks(landmarks, {
        color: "#f8f9fb",
        fillColor: "#23c483",
        lineWidth: 2,
        radius: 3,
      });
    },
    [canvasRef, videoRef],
  );

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (!isCameraActive || !isModelReady) {
      clearCanvas();
      return;
    }

    function detectFrame() {
      const video = videoRef.current;
      const poseLandmarker = poseLandmarkerRef.current;

      if (!video || !poseLandmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        animationFrameRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      const result = poseLandmarker.detectForVideo(video, performance.now());
      const landmarks = result.landmarks[0] as Point[] | undefined;

      if (!landmarks) {
        angleWindowRef.current = [];
        clearCanvas();
        const evaluation: PoseEvaluation = {
          poseState: "unknown",
          isPersonDetected: false,
          status: "No person detected",
          angle: null,
        };
        setLatestEvaluation(evaluation);
        onPoseRef.current(exerciseRef.current, evaluation);
        animationFrameRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      drawLandmarks(result.landmarks[0]);

      const rawAngle = getExerciseAngle(exerciseRef.current, landmarks);
      if (rawAngle === null) {
        angleWindowRef.current = [];
      } else {
        angleWindowRef.current = appendWindowValue(angleWindowRef.current, rawAngle, SMOOTHING_WINDOW);
      }

      const smoothedAngle = averageWindow(angleWindowRef.current);
      const evaluation = evaluateExercisePose(exerciseRef.current, smoothedAngle);
      setLatestEvaluation(evaluation);
      onPoseRef.current(exerciseRef.current, evaluation);

      animationFrameRef.current = requestAnimationFrame(detectFrame);
    }

    animationFrameRef.current = requestAnimationFrame(detectFrame);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [clearCanvas, drawLandmarks, isCameraActive, isModelReady, videoRef]);

  return {
    isModelReady,
    poseError,
    latestEvaluation,
  };
}
