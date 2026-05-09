import { useCallback, useRef, useState } from "react";
import { Camera, CameraOff, CircleStop, Menu, RotateCcw, Settings, History, Download } from "lucide-react";
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

const SHOW_DEBUG_TOOLS = false;

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

      <aside className="side-nav" aria-label="Operator navigation">
        <div>
          <strong>OPERATOR_01</strong>
          <span>STATUS: READY</span>
        </div>
        <nav>
          <a href="#history">
            <History size={18} aria-hidden="true" />
            SESSION HISTORY
          </a>
          <a href="#settings">
            <Settings size={20} aria-hidden="true" />
            SETTINGS
          </a>
        </nav>
        <button type="button" className="export-button" onClick={() => exportCsv(t.csvFileName)}>
          EXPORT DATA
        </button>
      </aside>

      <section className="hud" aria-label={t.appTitle}>
        <header className="hud-topbar">
          <div className="brand-lockup">
            <button type="button" className="chrome-icon" aria-label={t.menu}>
              <Menu size={18} aria-hidden="true" />
            </button>
            <div>
              <h1>REP TRACKER</h1>
              <p className="eyebrow">// VERSION 4.1.0</p>
            </div>
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

        <div className="tracking-alert" role="status">
          <Camera size={16} aria-hidden="true" />
          <span>AI POSE TRACKING ACTIVE</span>
          <i aria-hidden="true" />
        </div>

        <div className="hud-counter" aria-live="polite">
          <span>{selectedExerciseLabel}</span>
          <strong>{activeSessionCount} REPS</strong>
        </div>

        <div className="hud-bottom">
          <ExerciseSelector selectedExercise={selectedExercise} t={t} onSelectExercise={handleSelectExercise} />
          <div className="hud-actions">
            <button
              type="button"
              className="stop-session-button"
              onClick={isCameraActive ? handleStopCamera : handleStartCamera}
            >
              {isCameraActive ? <CameraOff size={18} aria-hidden="true" /> : <CircleStop size={18} aria-hidden="true" />}
              {isCameraActive ? t.stopCamera : t.startCamera}
            </button>
            <button type="button" className="secondary-button compact dev-reset" onClick={resetSession}>
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
