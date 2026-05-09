import { useCallback, useRef, useState } from "react";
import { Camera, CameraOff, RotateCcw } from "lucide-react";
import { AppMenu } from "./components/AppMenu";
import { CameraView } from "./components/CameraView";
import { CounterPanel } from "./components/CounterPanel";
import { ExerciseSelector } from "./components/ExerciseSelector";
import { useCamera } from "./hooks/useCamera";
import { useExerciseCounter } from "./hooks/useExerciseCounter";
import { useLocale } from "./hooks/useLocale";
import { useLocalExerciseTotals } from "./hooks/useLocalExerciseTotals";
import { usePoseDetection } from "./hooks/usePoseDetection";
import { useRepHistory } from "./hooks/useRepHistory";
import type { ExerciseType } from "./types/exercise";

const SHOW_DEBUG_TOOLS = import.meta.env.DEV = 0

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>("squat");
  const { locale, setLocale, t } = useLocale();
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
  const { history, recordRep, resetLocalHistory, exportCsv } = useRepHistory();
  const handleRepCounted = useCallback(
    (exercise: ExerciseType, countKey: "pushups" | "squats") => {
      incrementTotal(countKey);
      recordRep(exercise);
    },
    [incrementTotal, recordRep],
  );
  const { sessionCounts, currentPoseState, processPose, resetSession, resetTransition } =
    useExerciseCounter(handleRepCounted);
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

  const activeSessionCount = selectedExercise === "pushup" ? sessionCounts.pushups : sessionCounts.squats;
  const selectedExerciseLabel = selectedExercise === "pushup" ? t.pushups : t.squats;

  return (
    <main className="app-shell">
      <CameraView
        t={t}
        videoRef={videoRef}
        canvasRef={canvasRef}
        isCameraActive={isCameraActive}
        isVideoFileLoaded={isVideoFileLoaded}
        videoFileName={videoFileName}
        cameraError={cameraError}
        poseError={poseError}
        onLoadVideoFile={handleLoadVideoFile}
        onClearVideoFile={handleClearVideoFile}
      />

      <section className="hud" aria-label={t.appTitle}>
        <header className="hud-topbar">
          <div>
            <p className="eyebrow">{t.appSubtitle}</p>
            <h1>{t.appTitle}</h1>
          </div>
          <AppMenu
            t={t}
            locale={locale}
            historyCount={history.length}
            onLocaleChange={setLocale}
            onExportCsv={() => exportCsv(t.csvFileName)}
            onResetTotals={resetLocalTotals}
            onResetHistory={resetLocalHistory}
          />
        </header>

        <div className="hud-counter" aria-live="polite">
          <span>{selectedExerciseLabel}</span>
          <strong>{activeSessionCount}</strong>
        </div>

        <div className="hud-bottom">
          <ExerciseSelector selectedExercise={selectedExercise} t={t} onSelectExercise={handleSelectExercise} />
          <div className="hud-actions">
            <button type="button" className="primary-button" onClick={handleStartCamera} disabled={isCameraActive}>
              <Camera size={18} aria-hidden="true" />
              {t.startCamera}
            </button>
            <button type="button" className="secondary-button" onClick={handleStopCamera} disabled={!isCameraActive}>
              <CameraOff size={18} aria-hidden="true" />
              {t.stopCamera}
            </button>
            <button type="button" className="secondary-button compact" onClick={resetSession}>
              <RotateCcw size={18} aria-hidden="true" />
              {t.resetSession}
            </button>
          </div>
        </div>
      </section>

      {SHOW_DEBUG_TOOLS && (
        <CounterPanel
          t={t}
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
      )}
    </main>
  );
}

export default App;
