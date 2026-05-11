import { useCallback, useEffect, useRef, useState } from "react";
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import type { AngleRange, ExerciseType, Point, PoseEvaluation, PoseThresholds } from "../types/exercise";
import { evaluateExercisePose, getAdaptiveThresholds, getDefaultThresholds, getExerciseAngle } from "../utils/landmarks";
import { startVisibilityAwareFrameLoop, type FrameLoop } from "../utils/frameScheduler";
import { appendWindowValue, averageWindow } from "../utils/smoothing";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm";
const SMOOTHING_WINDOW = 5;

type UsePoseDetectionArgs = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  exercise: ExerciseType;
  isVideoSourceActive: boolean;
  messages: {
    unableToLoadPoseModel: string;
  };
  onPose: (exercise: ExerciseType, evaluation: PoseEvaluation) => void;
};

export function usePoseDetection({
  videoRef,
  canvasRef,
  exercise,
  isVideoSourceActive,
  messages,
  onPose,
}: UsePoseDetectionArgs) {
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const frameLoopRef = useRef<FrameLoop | null>(null);
  const angleWindowRef = useRef<number[]>([]);
  const angleRangeRef = useRef<AngleRange>({ min: null, max: null });
  const onPoseRef = useRef(onPose);
  const messagesRef = useRef(messages);
  const exerciseRef = useRef(exercise);
  const [isModelReady, setIsModelReady] = useState(false);
  const [poseError, setPoseError] = useState<string | null>(null);
  const [latestEvaluation, setLatestEvaluation] = useState<PoseEvaluation>({
    poseState: "unknown",
    isPersonDetected: false,
    status: "No person detected",
    angle: null,
    hasObservedUp: false,
  });
  const [angleRange, setAngleRange] = useState<AngleRange>({ min: null, max: null });
  const [activeThresholds, setActiveThresholds] = useState<PoseThresholds>(getDefaultThresholds(exercise));

  useEffect(() => {
    onPoseRef.current = onPose;
  }, [onPose]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    exerciseRef.current = exercise;
    angleWindowRef.current = [];
    angleRangeRef.current = { min: null, max: null };
    setAngleRange({ min: null, max: null });
    setActiveThresholds(getDefaultThresholds(exercise));
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
        setPoseError(error instanceof Error ? error.message : messagesRef.current.unableToLoadPoseModel);
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
    if (!isVideoSourceActive || !isModelReady) {
      clearCanvas();
      angleRangeRef.current = { min: null, max: null };
      setAngleRange({ min: null, max: null });
      setLatestEvaluation({
        poseState: "unknown",
        isPersonDetected: false,
        status: "No person detected",
        angle: null,
        hasObservedUp: false,
      });
      return;
    }

    function detectFrame() {
      const video = videoRef.current;
      const poseLandmarker = poseLandmarkerRef.current;

      if (!video || !poseLandmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
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
          hasObservedUp: false,
        };
        setLatestEvaluation(evaluation);
        onPoseRef.current(exerciseRef.current, evaluation);
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
      if (smoothedAngle !== null) {
        angleRangeRef.current = {
          min:
            angleRangeRef.current.min === null
              ? smoothedAngle
              : Math.min(angleRangeRef.current.min, smoothedAngle),
          max:
            angleRangeRef.current.max === null
              ? smoothedAngle
              : Math.max(angleRangeRef.current.max, smoothedAngle),
        };
        setAngleRange(angleRangeRef.current);
      }

      const thresholds = getAdaptiveThresholds(exerciseRef.current, angleRangeRef.current);
      const evaluation = evaluateExercisePose(
        exerciseRef.current,
        smoothedAngle,
        thresholds,
        angleRangeRef.current,
      );
      setActiveThresholds(thresholds);
      setLatestEvaluation(evaluation);
      onPoseRef.current(exerciseRef.current, evaluation);
    }

    frameLoopRef.current = startVisibilityAwareFrameLoop(detectFrame);

    return () => {
      frameLoopRef.current?.cancel();
      frameLoopRef.current = null;
    };
  }, [clearCanvas, drawLandmarks, isModelReady, isVideoSourceActive, videoRef]);

  return {
    isModelReady,
    poseError,
    latestEvaluation,
    angleRange,
    activeThresholds,
  };
}
