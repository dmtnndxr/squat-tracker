import { RotateCcw, Trash2 } from "lucide-react";
import type { ExerciseTotals, ExerciseType, PoseState } from "../types/exercise";
import type { SessionCounts } from "../hooks/useExerciseCounter";

type CounterPanelProps = {
  selectedExercise: ExerciseType;
  sessionCounts: SessionCounts;
  totals: ExerciseTotals;
  currentPoseState: PoseState;
  isCameraActive: boolean;
  isModelReady: boolean;
  isPersonDetected: boolean;
  status: string;
  angle: number | null;
  onResetSession: () => void;
  onResetTotals: () => void;
};

function labelExercise(exercise: ExerciseType): string {
  return exercise === "pushup" ? "Push-ups" : "Squats";
}

export function CounterPanel({
  selectedExercise,
  sessionCounts,
  totals,
  currentPoseState,
  isCameraActive,
  isModelReady,
  isPersonDetected,
  status,
  angle,
  onResetSession,
  onResetTotals,
}: CounterPanelProps) {
  const activeSessionCount = selectedExercise === "pushup" ? sessionCounts.pushups : sessionCounts.squats;

  return (
    <section className="panel" aria-label="Exercise counters">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Current exercise</p>
          <h2>{labelExercise(selectedExercise)}</h2>
        </div>
        <span className={isCameraActive ? "status-pill is-on" : "status-pill"}>
          {isCameraActive ? "Camera on" : "Camera off"}
        </span>
      </div>

      <div className="metric-grid">
        <div className="metric primary">
          <span>Session</span>
          <strong>{activeSessionCount}</strong>
        </div>
        <div className="metric">
          <span>Total push-ups</span>
          <strong>{totals.pushups}</strong>
        </div>
        <div className="metric">
          <span>Total squats</span>
          <strong>{totals.squats}</strong>
        </div>
      </div>

      <dl className="status-list">
        <div>
          <dt>Model</dt>
          <dd>{isModelReady ? "Ready" : "Loading"}</dd>
        </div>
        <div>
          <dt>Detection</dt>
          <dd>{isPersonDetected ? status : "Not detected"}</dd>
        </div>
        <div>
          <dt>Position</dt>
          <dd>{currentPoseState}</dd>
        </div>
        <div>
          <dt>Angle</dt>
          <dd>{angle === null ? "Unknown" : `${Math.round(angle)} deg`}</dd>
        </div>
      </dl>

      <div className="action-row">
        <button type="button" className="secondary-button" onClick={onResetSession}>
          <RotateCcw size={18} aria-hidden="true" />
          Reset session
        </button>
        <button type="button" className="danger-button" onClick={onResetTotals}>
          <Trash2 size={18} aria-hidden="true" />
          Reset totals
        </button>
      </div>
    </section>
  );
}
