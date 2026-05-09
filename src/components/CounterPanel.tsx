import { RotateCcw, Trash2 } from "lucide-react";
import type { Messages } from "../i18n/translations";
import type { AngleRange, ExerciseTotals, ExerciseType, PoseState, PoseThresholds } from "../types/exercise";
import type { SessionCounts } from "../hooks/useExerciseCounter";

const SHOW_DEBUG_TOOLS = import.meta.env.DEV;

type CounterPanelProps = {
  t: Messages;
  selectedExercise: ExerciseType;
  sessionCounts: SessionCounts;
  totals: ExerciseTotals;
  currentPoseState: PoseState;
  isCameraActive: boolean;
  isVideoFileLoaded: boolean;
  isModelReady: boolean;
  isPersonDetected: boolean;
  status: string;
  angle: number | null;
  angleRange: AngleRange;
  activeThresholds: PoseThresholds;
  onResetSession: () => void;
  onResetTotals: () => void;
};

function labelExercise(exercise: ExerciseType, t: Messages): string {
  return exercise === "pushup" ? t.pushups : t.squats;
}

export function CounterPanel({
  t,
  selectedExercise,
  sessionCounts,
  totals,
  currentPoseState,
  isCameraActive,
  isVideoFileLoaded,
  isModelReady,
  isPersonDetected,
  status,
  angle,
  angleRange,
  activeThresholds,
  onResetSession,
  onResetTotals,
}: CounterPanelProps) {
  const activeSessionCount = selectedExercise === "pushup" ? sessionCounts.pushups : sessionCounts.squats;
  const sourceLabel = isCameraActive ? t.cameraOn : SHOW_DEBUG_TOOLS && isVideoFileLoaded ? "Video test" : t.noSource;
  const hasVideoSource = isCameraActive || isVideoFileLoaded;

  return (
    <section className="panel" aria-label="Exercise counters">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{t.currentExercise}</p>
          <h2>{labelExercise(selectedExercise, t)}</h2>
        </div>
        <span className={hasVideoSource ? "status-pill is-on" : "status-pill"}>
          {sourceLabel}
        </span>
      </div>

      <div className="metric-grid">
        <div className="metric primary">
          <span>{t.session}</span>
          <strong>{activeSessionCount}</strong>
        </div>
        <div className="metric">
          <span>{t.totalPushups}</span>
          <strong>{totals.pushups}</strong>
        </div>
        <div className="metric">
          <span>{t.totalSquats}</span>
          <strong>{totals.squats}</strong>
        </div>
      </div>

      {SHOW_DEBUG_TOOLS && (
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
            <dd>{angle === null ? t.unknown : `${Math.round(angle)} deg`}</dd>
          </div>
          <div>
            <dt>Angle range</dt>
            <dd>
              {angleRange.min === null || angleRange.max === null
                ? t.unknown
                : `${Math.round(angleRange.min)}-${Math.round(angleRange.max)} deg`}
            </dd>
          </div>
          <div>
            <dt>Thresholds</dt>
            <dd>
              {`${Math.round(activeThresholds.down)}/${Math.round(activeThresholds.up)} deg ${activeThresholds.source}`}
            </dd>
          </div>
        </dl>
      )}

      <div className="action-row">
        <button type="button" className="secondary-button" onClick={onResetSession}>
          <RotateCcw size={18} aria-hidden="true" />
          {t.resetSession}
        </button>
        <button type="button" className="danger-button" onClick={onResetTotals}>
          <Trash2 size={18} aria-hidden="true" />
          {t.resetTotals}
        </button>
      </div>
    </section>
  );
}
