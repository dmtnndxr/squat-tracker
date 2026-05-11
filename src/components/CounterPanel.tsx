import { FileVideo, RotateCcw, Trash2, Upload } from "lucide-react";
import type { SessionCounts } from "../hooks/useExerciseCounter";
import type { Messages } from "../i18n/translations";
import type { AngleRange, ExerciseTotals, ExerciseType, PoseState, PoseThresholds } from "../types/exercise";

type CounterPanelProps = {
  t: Messages;
  selectedExercise: ExerciseType;
  sessionCounts: SessionCounts;
  totals: ExerciseTotals;
  currentPoseState: PoseState | string;
  isCameraActive: boolean;
  isVideoFileLoaded: boolean;
  isModelReady: boolean;
  isPersonDetected: boolean;
  status: string;
  angle: number | null;
  angleRange: AngleRange;
  activeThresholds: PoseThresholds | { up: number; down: number; source: string };
  videoFileName: string | null;
  onResetSession: () => void;
  onResetTotals: () => void;
  onLoadVideoFile: (file: File) => void;
  onClearVideoFile: () => void;
};

function displayStatus(isPersonDetected: boolean, status: string): string {
  if (!isPersonDetected) {
    return "No person detected";
  }

  if (/bad/i.test(status)) {
    return "Bad angle";
  }

  if (/down/i.test(status)) {
    return "Down";
  }

  if (/up/i.test(status)) {
    return "Up";
  }

  return status || "Tracking";
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
  videoFileName,
  onResetSession,
  onResetTotals,
  onLoadVideoFile,
  onClearVideoFile,
}: CounterPanelProps) {
  const activeSessionCount = selectedExercise === "pushup" ? sessionCounts.pushups : sessionCounts.squats;
  const sourceLabel = isCameraActive ? t.cameraOn : isVideoFileLoaded ? "Test video" : t.noSource;

  return (
    <aside className="pointer-events-auto absolute bottom-36 left-4 z-30 max-h-[42dvh] w-[min(24rem,calc(100vw-2rem))] resize overflow-auto rounded-md border border-[#444933]/80 bg-[#131314]/90 p-4 text-xs text-[#c4c9ac] shadow-2xl backdrop-blur-xl sm:bottom-auto sm:top-24">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00dbe9]">Debug panel</p>
          <h2 className="mt-1 text-lg font-black uppercase tracking-[0.08em] text-white">
            {displayStatus(isPersonDetected, status)}
          </h2>
        </div>
        <span className="rounded-sm border border-[#444933] px-2 py-1 text-[10px] uppercase text-[#c3f400]">
          {sourceLabel}
        </span>
      </div>

      <dl className="grid gap-2">
        <DebugRow label="Model" value={isModelReady ? "Ready" : "Loading"} />
        <DebugRow label="Session" value={`${activeSessionCount} reps`} />
        <DebugRow label="Push-ups total" value={String(totals.pushups)} />
        <DebugRow label="Squats total" value={String(totals.squats)} />
        <DebugRow label="Position" value={String(currentPoseState)} />
        <DebugRow label="Raw status" value={status || t.unknown} />
        <DebugRow label="Angle" value={angle === null ? t.unknown : `${Math.round(angle)} deg`} />
        <DebugRow
          label="Angle range"
          value={
            angleRange.min === null || angleRange.max === null
              ? t.unknown
              : `${Math.round(angleRange.min)}-${Math.round(angleRange.max)} deg`
          }
        />
        <DebugRow
          label="Thresholds"
          value={`${Math.round(activeThresholds.down)}/${Math.round(activeThresholds.up)} deg ${activeThresholds.source}`}
        />
      </dl>

      {isVideoFileLoaded && videoFileName && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-sm bg-white/5 px-3 py-2">
          <span className="inline-flex min-w-0 items-center gap-2">
            <FileVideo size={15} aria-hidden="true" />
            <span className="truncate">{videoFileName}</span>
          </span>
          <button type="button" className="text-[#c3f400] hover:text-white" onClick={onClearVideoFile}>
            Clear
          </button>
        </div>
      )}

      <div className="mt-4 grid gap-2">
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#c3f400] px-3 text-xs font-black uppercase tracking-[0.08em] text-[#c3f400] transition hover:bg-[#c3f400] hover:text-[#161e00]">
          <Upload size={15} aria-hidden="true" />
          Load test video
          <input
            className="hidden"
            type="file"
            accept="video/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onLoadVideoFile(file);
              }
              event.target.value = "";
            }}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white/5 px-3 font-bold text-white hover:bg-white/10"
            onClick={onResetSession}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Session
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#ca0a0f]/20 px-3 font-bold text-[#ff7f83] hover:bg-[#ca0a0f]/30"
            onClick={onResetTotals}
          >
            <Trash2 size={15} aria-hidden="true" />
            Totals
          </button>
        </div>
      </div>
    </aside>
  );
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-[#444933]/50 pb-2">
      <dt className="uppercase tracking-[0.12em] text-[#8e9379]">{label}</dt>
      <dd className="min-w-0 truncate text-right text-white">{value}</dd>
    </div>
  );
}
