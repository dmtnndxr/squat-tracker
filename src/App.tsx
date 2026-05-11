import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Activity,
  Camera,
  CameraOff,
  ChevronDown,
  ChevronRight,
  Download,
  Info,
  Menu,
  RotateCcw,
  Settings,
  Volume2,
  X,
} from "lucide-react";
import { AppMenu, type AppSection } from "./components/AppMenu";
import { CameraView } from "./components/CameraView";
import { CounterPanel } from "./components/CounterPanel";
import { ExerciseSelector } from "./components/ExerciseSelector";
import { useCamera } from "./hooks/useCamera";
import { useExerciseCounter, type SessionCounts } from "./hooks/useExerciseCounter";
import { useLocale } from "./hooks/useLocale";
import { useLocalExerciseTotals } from "./hooks/useLocalExerciseTotals";
import { usePoseDetection } from "./hooks/usePoseDetection";
import { useRepHistory } from "./hooks/useRepHistory";
import type { Locale } from "./i18n/translations";
import type { ExerciseTotals, ExerciseType } from "./types/exercise";

const SETTINGS_STORAGE_KEY = "exercise_counter_settings_v1";

type AppSettings = {
  debugEnabled: boolean;
  soundEnabled: boolean;
};

type HistorySession = {
  sessionId: string;
  start: Date;
  end: Date;
  counts: SessionCounts;
};

type HistoryDay = {
  key: string;
  label: string;
  totals: SessionCounts;
  sessions: HistorySession[];
};

const DEFAULT_SETTINGS: AppSettings = {
  debugEnabled: false,
  soundEnabled: true,
};

function loadSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!raw) {
    return DEFAULT_SETTINGS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      debugEnabled: typeof parsed.debugEnabled === "boolean" ? parsed.debugEnabled : DEFAULT_SETTINGS.debugEnabled,
      soundEnabled: typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function formatExerciseName(exercise: ExerciseType, locale: Locale): string {
  if (locale === "ru") {
    return exercise === "pushup" ? "отжимания" : "приседания";
  }

  return exercise === "pushup" ? "push-ups" : "squats";
}

function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDay(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    weekday: "short",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function exerciseTotal(totals: ExerciseTotals, exercise: ExerciseType): number {
  return exercise === "pushup" ? totals.pushups : totals.squats;
}

function summarizeCounts(counts: SessionCounts, locale: Locale): string {
  const parts = [];

  if (counts.pushups > 0) {
    parts.push(`${counts.pushups} ${formatExerciseName("pushup", locale)}`);
  }

  if (counts.squats > 0) {
    parts.push(`${counts.squats} ${formatExerciseName("squat", locale)}`);
  }

  return parts.length > 0 ? parts.join(", ") : "0 reps";
}

function buildHistoryDays(history: ReturnType<typeof useRepHistory>["history"], locale: Locale): HistoryDay[] {
  const sessions = new Map<string, HistorySession>();

  for (const entry of history) {
    const timestamp = new Date(entry.timestamp);
    const existing = sessions.get(entry.sessionId);
    const countKey = entry.exercise === "pushup" ? "pushups" : "squats";

    if (!existing) {
      sessions.set(entry.sessionId, {
        sessionId: entry.sessionId,
        start: timestamp,
        end: timestamp,
        counts: {
          pushups: countKey === "pushups" ? 1 : 0,
          squats: countKey === "squats" ? 1 : 0,
        },
      });
      continue;
    }

    existing.counts[countKey] += 1;
    if (timestamp < existing.start) {
      existing.start = timestamp;
    }
    if (timestamp > existing.end) {
      existing.end = timestamp;
    }
  }

  const days = new Map<string, HistoryDay>();

  for (const session of sessions.values()) {
    const key = session.start.toISOString().slice(0, 10);
    const existing = days.get(key);

    if (!existing) {
      days.set(key, {
        key,
        label: formatDay(session.start, locale),
        totals: { pushups: 0, squats: 0 },
        sessions: [],
      });
    }

    const day = days.get(key)!;
    day.totals.pushups += session.counts.pushups;
    day.totals.squats += session.counts.squats;
    day.sessions.push(session);
  }

  return [...days.values()]
    .map((day) => ({
      ...day,
      sessions: day.sessions.sort((left, right) => left.start.getTime() - right.start.getTime()),
    }))
    .sort((left, right) => right.key.localeCompare(left.key));
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>("squat");
  const [activeSection, setActiveSection] = useState<AppSection>("main");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(() => new Set());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
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
  const { history, recordRep, resetLocalHistory, exportCsv, startNewSession } = useRepHistory();

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

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isCameraActive) {
        stopCamera();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isCameraActive, stopCamera]);

  const activeSessionCount = selectedExercise === "pushup" ? sessionCounts.pushups : sessionCounts.squats;
  const selectedExerciseLabel = selectedExercise === "pushup" ? t.pushups : t.squats;
  const selectedExerciseTotal = exerciseTotal(totals, selectedExercise);
  const totalReps = totals.pushups + totals.squats;
  const historyDays = useMemo(() => buildHistoryDays(history, locale), [history, locale]);
  const selectedExerciseText = formatExerciseName(selectedExercise, locale);

  const handleSelectExercise = useCallback(
    (exercise: ExerciseType) => {
      setSelectedExercise(exercise);
      resetTransition();
    },
    [resetTransition],
  );

  const handleCameraToggle = useCallback(() => {
    resetTransition();

    if (isCameraActive) {
      stopCamera();
      return;
    }

    startNewSession();
    void startCamera();
  }, [isCameraActive, resetTransition, startCamera, startNewSession, stopCamera]);

  const handleLoadVideoFile = useCallback(
    (file: File) => {
      resetTransition();
      startNewSession();
      void loadVideoFile(file);
    },
    [loadVideoFile, resetTransition, startNewSession],
  );

  const handleClearVideoFile = useCallback(() => {
    clearVideoFile();
    resetTransition();
  }, [clearVideoFile, resetTransition]);

  const handleNavigate = useCallback((section: AppSection) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  }, []);

  const toggleDay = useCallback((dayKey: string) => {
    setExpandedDays((current) => {
      const next = new Set(current);
      if (next.has(dayKey)) {
        next.delete(dayKey);
      } else {
        next.add(dayKey);
      }
      return next;
    });
  }, []);

  return (
    <main className="min-h-dvh overflow-hidden bg-[#131314] font-mono text-white">
      {activeSection === "main" ? (
        <MainScreen
          t={t}
          selectedExercise={selectedExercise}
          selectedExerciseLabel={selectedExerciseLabel}
          selectedExerciseText={selectedExerciseText}
          sessionCounts={sessionCounts}
          activeSessionCount={activeSessionCount}
          selectedExerciseTotal={selectedExerciseTotal}
          totals={totals}
          isCameraActive={isCameraActive}
          isVideoFileLoaded={isVideoFileLoaded}
          videoFileName={videoFileName}
          cameraError={cameraError}
          poseError={poseError}
          videoRef={videoRef}
          canvasRef={canvasRef}
          isMenuOpen={isMenuOpen}
          debugEnabled={settings.debugEnabled}
          isModelReady={isModelReady}
          currentPoseState={currentPoseState}
          latestEvaluation={latestEvaluation}
          angleRange={angleRange}
          activeThresholds={activeThresholds}
          onToggleMenu={() => setIsMenuOpen((current) => !current)}
          onNavigate={handleNavigate}
          onCameraToggle={handleCameraToggle}
          onSelectExercise={handleSelectExercise}
          onLoadVideoFile={handleLoadVideoFile}
          onClearVideoFile={handleClearVideoFile}
          onResetSession={resetSession}
          onResetTotals={resetLocalTotals}
        />
      ) : (
        <ContentScreen title={sectionTitle(activeSection)} onBack={() => setActiveSection("main")}>
          {activeSection === "overview" && (
            <OverviewScreen
              locale={locale}
              totals={totals}
              totalReps={totalReps}
              historyDays={historyDays}
              expandedDays={expandedDays}
              onToggleDay={toggleDay}
              onExportCsv={() => exportCsv(t.csvFileName)}
              onResetHistory={resetLocalHistory}
            />
          )}

          {activeSection === "settings" && (
            <SettingsScreen
              locale={locale}
              debugEnabled={settings.debugEnabled}
              soundEnabled={settings.soundEnabled}
              onLocaleChange={setLocale}
              onDebugChange={(debugEnabled) => setSettings((current) => ({ ...current, debugEnabled }))}
              onSoundChange={(soundEnabled) => setSettings((current) => ({ ...current, soundEnabled }))}
            />
          )}

          {activeSection === "about" && <AboutScreen />}
        </ContentScreen>
      )}
    </main>
  );
}

function MainScreen({
  t,
  selectedExercise,
  selectedExerciseLabel,
  selectedExerciseText,
  sessionCounts,
  activeSessionCount,
  selectedExerciseTotal,
  totals,
  isCameraActive,
  isVideoFileLoaded,
  videoFileName,
  cameraError,
  poseError,
  videoRef,
  canvasRef,
  isMenuOpen,
  debugEnabled,
  isModelReady,
  currentPoseState,
  latestEvaluation,
  angleRange,
  activeThresholds,
  onToggleMenu,
  onNavigate,
  onCameraToggle,
  onSelectExercise,
  onLoadVideoFile,
  onClearVideoFile,
  onResetSession,
  onResetTotals,
}: {
  t: ReturnType<typeof useLocale>["t"];
  selectedExercise: ExerciseType;
  selectedExerciseLabel: string;
  selectedExerciseText: string;
  sessionCounts: SessionCounts;
  activeSessionCount: number;
  selectedExerciseTotal: number;
  totals: ExerciseTotals;
  isCameraActive: boolean;
  isVideoFileLoaded: boolean;
  videoFileName: string | null;
  cameraError: string | null;
  poseError: string | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isMenuOpen: boolean;
  debugEnabled: boolean;
  isModelReady: boolean;
  currentPoseState: string;
  latestEvaluation: {
    isPersonDetected: boolean;
    status: string;
    angle: number | null;
  };
  angleRange: {
    min: number | null;
    max: number | null;
  };
  activeThresholds: {
    up: number;
    down: number;
    source: string;
  };
  onToggleMenu: () => void;
  onNavigate: (section: AppSection) => void;
  onCameraToggle: () => void;
  onSelectExercise: (exercise: ExerciseType) => void;
  onLoadVideoFile: (file: File) => void;
  onClearVideoFile: () => void;
  onResetSession: () => void;
  onResetTotals: () => void;
}) {
  return (
    <section className="relative min-h-dvh overflow-hidden">
      <CameraView
        t={t}
        videoRef={videoRef}
        canvasRef={canvasRef}
        isCameraActive={isCameraActive}
        isVideoFileLoaded={isVideoFileLoaded}
        videoFileName={videoFileName}
        cameraError={cameraError}
        poseError={poseError}
        onLoadVideoFile={onLoadVideoFile}
        onClearVideoFile={onClearVideoFile}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.34),rgba(0,0,0,0.05)_32%,rgba(0,0,0,0.78)),linear-gradient(90deg,rgba(0,0,0,0.5),transparent_24%,transparent_76%,rgba(0,0,0,0.35))]" />

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between p-4 sm:p-6">
        <div className="pointer-events-auto relative">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-md border border-[#444933]/70 bg-[#131314]/75 text-white shadow-2xl backdrop-blur transition hover:border-[#c3f400] hover:text-[#c3f400]"
            onClick={onToggleMenu}
            aria-label={t.menu}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          {isMenuOpen && <AppMenu onNavigate={onNavigate} />}
        </div>

        <div className="rounded-md border border-[#444933]/60 bg-[#131314]/65 px-4 py-2 text-right text-[10px] uppercase tracking-[0.18em] text-[#c4c9ac] backdrop-blur">
          <span className="block text-[#c3f400]">{isCameraActive || isVideoFileLoaded ? "Tracking active" : "Camera ready"}</span>
          <span>{selectedExerciseLabel}</span>
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 text-center">
        <div className="mx-auto max-w-md rounded-md border border-white/10 bg-[#131314]/35 px-6 py-7 shadow-2xl backdrop-blur-sm">
          {isCameraActive && activeSessionCount > 0 ? (
            <>
              <p className="text-sm uppercase tracking-[0.28em] text-[#c3f400]">{selectedExerciseLabel}</p>
              <p className="mt-2 text-7xl font-black leading-none text-white sm:text-8xl">{activeSessionCount}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#c4c9ac]">Current session</p>
            </>
          ) : isCameraActive ? (
            <>
              <p className="text-2xl font-black leading-tight text-white sm:text-4xl">
                Start doing {selectedExerciseText} to see the count here.
              </p>
              <p className="mt-4 text-sm text-[#c4c9ac]">The counter updates as a valid rep is completed.</p>
            </>
          ) : (
            <>
              <p className="text-sm uppercase tracking-[0.28em] text-[#c4c9ac]">Total local reps</p>
              <p className="mt-2 text-7xl font-black leading-none text-[#c3f400] sm:text-8xl">{selectedExerciseTotal}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-white">{selectedExerciseLabel}</p>
            </>
          )}
        </div>
      </div>

      {debugEnabled && (
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
          onResetSession={onResetSession}
          onResetTotals={onResetTotals}
          onLoadVideoFile={onLoadVideoFile}
          onClearVideoFile={onClearVideoFile}
          videoFileName={videoFileName}
        />
      )}

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          className="inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-3 rounded-md bg-[#c3f400] px-6 text-sm font-black uppercase tracking-[0.1em] text-[#161e00] shadow-[0_18px_50px_rgba(195,244,0,0.22)] transition hover:bg-[#d8ff33] active:scale-[0.99]"
          onClick={onCameraToggle}
        >
          {isCameraActive ? <CameraOff size={20} aria-hidden="true" /> : <Camera size={20} aria-hidden="true" />}
          {isCameraActive ? "Turn off camera" : "Turn on camera"}
        </button>
        <ExerciseSelector selectedExercise={selectedExercise} t={t} onSelectExercise={onSelectExercise} />
      </div>
    </section>
  );
}

function ContentScreen({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <section className="min-h-dvh overflow-auto bg-[#131314] bg-[radial-gradient(circle_at_top_left,rgba(195,244,0,0.11),transparent_34%),linear-gradient(180deg,#1c1b1c,#131314)] px-4 py-5 text-white sm:px-8 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#444933] bg-[#1c1b1c] text-[#c4c9ac] transition hover:border-[#c3f400] hover:text-[#c3f400]"
            onClick={onBack}
            aria-label="Back to main screen"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <h1 className="text-right text-3xl font-black uppercase tracking-[0.12em] sm:text-5xl">{title}</h1>
        </header>
        {children}
      </div>
    </section>
  );
}

function OverviewScreen({
  locale,
  totals,
  totalReps,
  historyDays,
  expandedDays,
  onToggleDay,
  onExportCsv,
  onResetHistory,
}: {
  locale: Locale;
  totals: ExerciseTotals;
  totalReps: number;
  historyDays: HistoryDay[];
  expandedDays: Set<string>;
  onToggleDay: (dayKey: string) => void;
  onExportCsv: () => void;
  onResetHistory: () => void;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total Reps" value={totalReps} />
        <StatCard label="Squats" value={totals.squats} />
        <StatCard label="Push-ups" value={totals.pushups} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black uppercase tracking-[0.12em] text-white">Activity by day</h2>
          <p className="mt-1 text-sm text-[#c4c9ac]">Sessions are grouped from locally stored rep events.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#c3f400] px-4 text-sm font-bold uppercase tracking-[0.08em] text-[#c3f400] transition hover:bg-[#c3f400] hover:text-[#161e00]"
            onClick={onExportCsv}
          >
            <Download size={17} aria-hidden="true" />
            Export CSV
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#444933] px-4 text-sm font-bold uppercase tracking-[0.08em] text-[#c4c9ac] transition hover:border-white hover:text-white"
            onClick={onResetHistory}
            disabled={historyDays.length === 0}
          >
            <RotateCcw size={17} aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {historyDays.length === 0 ? (
          <div className="rounded-md border border-dashed border-[#444933] bg-[#1c1b1c]/70 p-6 text-[#c4c9ac]">
            No session history yet. Start the camera and complete reps to fill this overview.
          </div>
        ) : (
          historyDays.map((day) => {
            const isExpanded = expandedDays.has(day.key);

            return (
              <article key={day.key} className="overflow-hidden rounded-md border border-[#444933]/80 bg-[#1c1b1c]/85">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                  onClick={() => onToggleDay(day.key)}
                >
                  <div>
                    <h3 className="font-bold text-white">{day.label}</h3>
                    <p className="mt-1 text-sm text-[#c4c9ac]">{summarizeCounts(day.totals, locale)}</p>
                  </div>
                  {isExpanded ? <ChevronDown size={20} aria-hidden="true" /> : <ChevronRight size={20} aria-hidden="true" />}
                </button>

                {isExpanded && (
                  <div className="grid gap-2 border-t border-[#444933]/70 p-3 sm:p-4">
                    {day.sessions.map((session, index) => (
                      <div
                        key={session.sessionId}
                        className="grid gap-1 rounded-sm bg-[#131314]/70 p-4 text-sm sm:grid-cols-[1fr_auto] sm:items-center"
                      >
                        <span className="font-bold text-white">
                          Session {index + 1}: {summarizeCounts(session.counts, locale)}
                        </span>
                        <span className="text-[#c4c9ac]">
                          {formatTime(session.start, locale)}-{formatTime(session.end, locale)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function SettingsScreen({
  locale,
  debugEnabled,
  soundEnabled,
  onLocaleChange,
  onDebugChange,
  onSoundChange,
}: {
  locale: Locale;
  debugEnabled: boolean;
  soundEnabled: boolean;
  onLocaleChange: (locale: Locale) => void;
  onDebugChange: (enabled: boolean) => void;
  onSoundChange: (enabled: boolean) => void;
}) {
  return (
    <div className="grid gap-4">
      <SettingsRow icon={<Settings size={20} aria-hidden="true" />} label="Language">
        <select
          className="min-h-11 rounded-md border border-[#444933] bg-[#131314] px-4 text-sm font-bold text-white outline-none focus:border-[#c3f400]"
          value={locale}
          onChange={(event) => onLocaleChange(event.target.value as Locale)}
        >
          <option value="en">English</option>
          <option value="ru">Russian</option>
        </select>
      </SettingsRow>

      <SettingsRow icon={<Activity size={20} aria-hidden="true" />} label="Debug Panel">
        <ToggleButton enabled={debugEnabled} onChange={onDebugChange} />
      </SettingsRow>

      <SettingsRow icon={<Volume2 size={20} aria-hidden="true" />} label="Sound">
        <ToggleButton enabled={soundEnabled} onChange={onSoundChange} />
      </SettingsRow>
    </div>
  );
}

function AboutScreen() {
  return (
    <article className="rounded-md border border-[#444933]/80 bg-[#1c1b1c]/85 p-6 shadow-2xl sm:p-8">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md bg-[#c3f400] text-[#161e00]">
        <Info size={24} aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-[0.1em] text-white">Local exercise counter</h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-[#c4c9ac]">
        This app uses your device camera and pose detection to count exercise repetitions locally in the browser.
        Choose an exercise, start the camera, and perform reps while the app tracks your session and total progress.
      </p>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-[#8e9379]">
        Camera frames and rep data stay on this device. The overview and CSV export are built from local browser
        storage.
      </p>
    </article>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#444933]/80 bg-[#1c1b1c]/85 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c4c9ac]">{label}</p>
      <p className="mt-3 text-5xl font-black leading-none text-white">{value}</p>
    </div>
  );
}

function SettingsRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid gap-4 rounded-md border border-[#444933]/80 bg-[#1c1b1c]/85 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex items-center gap-3 text-white">
        <span className="text-[#c3f400]">{icon}</span>
        <span className="font-black uppercase tracking-[0.12em]">{label}</span>
      </div>
      {children}
    </div>
  );
}

function ToggleButton({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 min-w-32 items-center justify-between gap-3 rounded-md border px-4 text-sm font-black uppercase tracking-[0.08em] transition ${
        enabled
          ? "border-[#c3f400] bg-[#c3f400] text-[#161e00]"
          : "border-[#444933] bg-[#131314] text-[#c4c9ac]"
      }`}
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
    >
      {enabled ? "On" : "Off"}
      <span className={`h-3 w-3 rounded-sm ${enabled ? "bg-[#161e00]" : "bg-[#8e9379]"}`} />
    </button>
  );
}

function sectionTitle(section: AppSection): string {
  switch (section) {
    case "overview":
      return "Overview";
    case "settings":
      return "Settings";
    case "about":
      return "About";
    case "main":
      return "Main";
  }
}

export default App;
