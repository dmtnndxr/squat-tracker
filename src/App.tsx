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
  const { videoRef, isCameraActive, cameraError, startCamera, stopCamera } = useCamera();
  const { totals, incrementTotal, resetLocalTotals } = useLocalExerciseTotals();
  const { sessionCounts, currentPoseState, processPose, resetSession, resetTransition } =
    useExerciseCounter(incrementTotal);
  const { isModelReady, poseError, latestEvaluation } = usePoseDetection({
    videoRef,
    canvasRef,
    exercise: selectedExercise,
    isCameraActive,
    onPose: processPose,
  });

  const handleSelectExercise = useCallback(
    (exercise: ExerciseType) => {
      setSelectedExercise(exercise);
      resetTransition();
    },
    [resetTransition],
  );

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
          cameraError={cameraError}
          poseError={poseError}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
        />
        <CounterPanel
          selectedExercise={selectedExercise}
          sessionCounts={sessionCounts}
          totals={totals}
          currentPoseState={currentPoseState}
          isCameraActive={isCameraActive}
          isModelReady={isModelReady}
          isPersonDetected={latestEvaluation.isPersonDetected}
          status={latestEvaluation.status}
          angle={latestEvaluation.angle}
          onResetSession={resetSession}
          onResetTotals={resetLocalTotals}
        />
      </div>
    </main>
  );
}

export default App;
