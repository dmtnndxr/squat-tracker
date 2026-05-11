import { X } from "lucide-react";
import type { RefObject } from "react";
import type { Messages } from "../i18n/translations";

type CameraViewProps = {
  t: Messages;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  isVideoFileLoaded: boolean;
  videoFileName: string | null;
  cameraError: string | null;
  poseError: string | null;
  onLoadVideoFile: (file: File) => void;
  onClearVideoFile: () => void;
};

export function CameraView({
  t,
  videoRef,
  canvasRef,
  isCameraActive,
  isVideoFileLoaded,
  videoFileName,
  cameraError,
  poseError,
  onClearVideoFile,
}: CameraViewProps) {
  const hasSource = isCameraActive || isVideoFileLoaded;

  return (
    <section className="absolute inset-0 bg-[#131314]" aria-label={t.cameraPreview}>
      <div className="relative h-full w-full overflow-hidden">
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover ${isCameraActive ? "-scale-x-100" : ""}`}
          playsInline
          muted={isCameraActive}
          controls={isVideoFileLoaded}
        />
        <canvas
          ref={canvasRef}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${isCameraActive ? "-scale-x-100" : ""}`}
          aria-hidden="true"
        />

        {!hasSource && (
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,19,20,0.14),rgba(19,19,20,0.22)_45%,rgba(19,19,20,0.86)),url('/figma-assets/gym-main.png')] bg-cover bg-center opacity-75 grayscale"
            aria-label={t.cameraPreview}
          />
        )}
      </div>

      {(cameraError || poseError) && (
        <p
          className="absolute left-4 right-4 top-20 z-30 rounded-xl border border-[#c3f400]/60 bg-[#c3f400]/95 px-4 py-3 text-sm font-bold text-[#161e00] shadow-2xl sm:left-6 sm:right-auto sm:max-w-xl"
          role="alert"
        >
          {cameraError ?? poseError}
        </p>
      )}

      {isVideoFileLoaded && (
        <div className="absolute right-4 top-20 z-30 inline-flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-[#444933] bg-[#131314]/85 px-3 py-2 text-xs text-white backdrop-blur sm:right-6">
          <span className="truncate">{videoFileName}</span>
          <button
            type="button"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#c4c9ac] transition hover:bg-white/10 hover:text-white"
            onClick={onClearVideoFile}
            aria-label="Clear test video"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
