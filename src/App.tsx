import { useCallback, useRef, useState } from "react";
import { CameraView } from "./components/CameraView";
import { CounterPanel } from "./components/CounterPanel";
import { ExerciseSelector } from "./components/ExerciseSelector";
import { useCamera } from "./hooks/useCamera";
import { useExerciseCounter } from "./hooks/useExerciseCounter";
import { useLocalExerciseTotals } from "./hooks/useLocalExerciseTotals";
import { usePoseDetection } from "./hooks/usePoseDetection";
import type { ExerciseType } from "./types/exercise";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>("pushup");
  const {
    videoRef,
    isCameraActive,
    isVideoFileLoaded,
    isVideoSourceActive,
    videoFileName,
    cameraError,
    startCamera,
    stopCamera,
    loadVideoFile,
    clearVideoFile,
  } = useCamera();
  const { totals, incrementTotal, resetLocalTotals } = useLocalExerciseTotals();
  const { sessionCounts, currentPoseState, processPose, resetSession, resetTransition } =
    useExerciseCounter(incrementTotal);
  const { isModelReady, poseError, latestEvaluation, angleRange, activeThresholds } = usePoseDetection({
    videoRef,
    canvasRef,
    exercise: selectedExercise,
    isVideoSourceActive,
    onPose: processPose,
  });

  const handleSelectExercise = useCallback(
    (exercise: ExerciseType) => {
      setSelectedExercise(exercise);
      resetTransition();
    },
    [resetTransition],
  );

  const handleStartCamera = useCallback(() => {
    resetTransition();
    void startCamera();
  }, [resetTransition, startCamera]);

  const handleStopCamera = useCallback(() => {
    stopCamera();
    resetTransition();
  }, [resetTransition, stopCamera]);

  const handleLoadVideoFile = useCallback(
    (file: File) => {
      resetTransition();
      void loadVideoFile(file);
    },
    [loadVideoFile, resetTransition],
  );

  const handleClearVideoFile = useCallback(() => {
    clearVideoFile();
    resetTransition();
  }, [clearVideoFile, resetTransition]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Browser MVP</p>
          <h1>Exercise Counter</h1>
        </div>
        <ExerciseSelector selectedExercise={selectedExercise} onSelectExercise={handleSelectExercise} />
      </header>

      <div className="workspace">
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraActive={isCameraActive}
          isVideoFileLoaded={isVideoFileLoaded}
          videoFileName={videoFileName}
          cameraError={cameraError}
          poseError={poseError}
          onStartCamera={handleStartCamera}
          onStopCamera={handleStopCamera}
          onLoadVideoFile={handleLoadVideoFile}
          onClearVideoFile={handleClearVideoFile}
        />
        <CounterPanel
          selectedExercise={selectedExercise}
          sessionCounts={sessionCounts}
          totals={totals}
          currentPoseState={currentPoseState}
          isCameraActive={isCameraActive}
          isVideoFileLoaded={isVideoFileLoaded}
          isModelReady={isModelReady}
          isPersonDetected={latestEvaluation.isPersonDetected}
          status={latestEvaluation.status}
          angle={latestEvaluation.angle}
          angleRange={angleRange}
          activeThresholds={activeThresholds}
          onResetSession={resetSession}
          onResetTotals={resetLocalTotals}
        />
      </div>
    </main>
  );
}

export default App;
