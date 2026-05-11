import { ChevronDown, ChevronUp, FileVideo, GripHorizontal, RotateCcw, Trash2, Upload } from "lucide-react";
import { useCallback, useRef } from "react";
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
  isCollapsed: boolean;
  position: { x: number; y: number } | null;
  videoFileName: string | null;
  onCollapsedChange: (isCollapsed: boolean) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onResetSession: () => void;
  onResetTotals: () => void;
  onLoadVideoFile: (file: File) => void;
  onClearVideoFile: () => void;
};

function displayStatus(t: Messages, isPersonDetected: boolean, status: string): string {
  if (!isPersonDetected) {
    return t.statusNoPersonDetected;
  }

  if (/bad/i.test(status)) {
    return t.statusBadAngle;
  }

  if (/down/i.test(status)) {
    return t.statusDown;
  }

  if (/up/i.test(status)) {
    return t.statusUp;
  }

  if (/detected/i.test(status)) {
    return t.statusDetected;
  }

  return status || t.statusTracking;
}

function displayPoseState(t: Messages, poseState: PoseState | string): string {
  switch (poseState) {
    case "up":
      return t.statusUp;
    case "down":
      return t.statusDown;
    case "middle":
      return t.poseMiddle;
    case "unknown":
      return t.poseUnknown;
    default:
      return poseState || t.unknown;
  }
}

function displayThresholdSource(t: Messages, source: string): string {
  if (source === "adaptive") {
    return t.sourceAdaptive;
  }

  if (source === "default") {
    return t.sourceDefault;
  }

  return source;
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
  isCollapsed,
  position,
  videoFileName,
  onCollapsedChange,
  onPositionChange,
  onResetSession,
  onResetTotals,
  onLoadVideoFile,
  onClearVideoFile,
}: CounterPanelProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const activeSessionCount = selectedExercise === "pushup" ? sessionCounts.pushups : sessionCounts.squats;
  const sourceLabel = isCameraActive ? t.cameraOn : isVideoFileLoaded ? t.testVideo : t.noSource;
  const panelStatus = displayStatus(t, isPersonDetected, status);

  const movePanel = useCallback((clientX: number, clientY: number) => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const rect = panel.getBoundingClientRect();
    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
    const maxY = Math.max(margin, window.innerHeight - rect.height - margin);

    onPositionChange({
      x: Math.min(Math.max(clientX - dragOffsetRef.current.x, margin), maxX),
      y: Math.min(Math.max(clientY - dragOffsetRef.current.y, margin), maxY),
    });
  }, [onPositionChange]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      const panel = panelRef.current;

      if (!panel) {
        return;
      }

      const rect = panel.getBoundingClientRect();
      dragOffsetRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      movePanel(event.clientX, event.clientY);
    },
    [movePanel],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        return;
      }

      movePanel(event.clientX, event.clientY);
    },
    [movePanel],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <aside
      ref={panelRef}
      className={`pointer-events-auto fixed z-30 w-[min(24rem,calc(100vw-2rem))] rounded-md border border-[#444933]/80 bg-[#131314]/90 text-xs text-[#c4c9ac] shadow-2xl backdrop-blur-xl ${
        position ? "" : "bottom-4 right-4"
      }`}
      style={position ? { left: position.x, top: position.y } : undefined}
    >
      <div
        className="flex touch-none select-none items-center justify-between gap-3 border-b border-[#444933]/70 p-3"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00dbe9]">
            <GripHorizontal size={14} aria-hidden="true" />
            {t.debugPanel}
          </p>
          <h2 className="mt-1 truncate text-base font-black uppercase tracking-[0.08em] text-white">{panelStatus}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-sm border border-[#444933] px-2 py-1 text-[10px] uppercase text-[#c3f400]">
            {sourceLabel}
          </span>
          <button
            type="button"
            className="grid h-8 w-8 place-items-center rounded-sm bg-white/5 text-white transition hover:bg-white/10"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onCollapsedChange(!isCollapsed)}
            aria-label={isCollapsed ? t.expandDebugPanel : t.collapseDebugPanel}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="max-h-[42dvh] resize overflow-auto p-4">
          <dl className="grid gap-2">
            <DebugRow label={t.model} value={isModelReady ? t.ready : t.loading} />
            <DebugRow label={t.session} value={`${activeSessionCount} ${t.reps}`} />
            <DebugRow label={t.totalPushups} value={String(totals.pushups)} />
            <DebugRow label={t.totalSquats} value={String(totals.squats)} />
            <DebugRow label={t.position} value={displayPoseState(t, currentPoseState)} />
            <DebugRow label={t.rawStatus} value={displayStatus(t, isPersonDetected, status)} />
            <DebugRow label={t.angle} value={angle === null ? t.unknown : `${Math.round(angle)} ${t.degreesShort}`} />
            <DebugRow
              label={t.angleRange}
              value={
                angleRange.min === null || angleRange.max === null
                  ? t.unknown
                  : `${Math.round(angleRange.min)}-${Math.round(angleRange.max)} ${t.degreesShort}`
              }
            />
            <DebugRow
              label={t.thresholds}
              value={`${Math.round(activeThresholds.down)}/${Math.round(activeThresholds.up)} ${t.degreesShort} ${displayThresholdSource(t, activeThresholds.source)}`}
            />
          </dl>

          {isVideoFileLoaded && videoFileName && (
            <div className="mt-4 flex items-center justify-between gap-2 rounded-sm bg-white/5 px-3 py-2">
              <span className="inline-flex min-w-0 items-center gap-2">
                <FileVideo size={15} aria-hidden="true" />
                <span className="truncate">{videoFileName}</span>
              </span>
              <button type="button" className="text-[#c3f400] hover:text-white" onClick={onClearVideoFile}>
                {t.clearTestVideo}
              </button>
            </div>
          )}

          <div className="mt-4 grid gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-[#c3f400] px-3 text-xs font-black uppercase tracking-[0.08em] text-[#c3f400] transition hover:bg-[#c3f400] hover:text-[#161e00]">
              <Upload size={15} aria-hidden="true" />
              {t.loadTestVideo}
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
                {t.session}
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[#ca0a0f]/20 px-3 font-bold text-[#ff7f83] hover:bg-[#ca0a0f]/30"
                onClick={onResetTotals}
              >
                <Trash2 size={15} aria-hidden="true" />
                {t.resetTotals}
              </button>
            </div>
          </div>
        </div>
      )}
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
