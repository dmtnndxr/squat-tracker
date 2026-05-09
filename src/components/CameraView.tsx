import { Upload, X } from "lucide-react";
import type { Messages } from "../i18n/translations";

const SHOW_DEBUG_TOOLS = import.meta.env.DEV = false;

type CameraViewProps = {
  t: Messages;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
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
  onLoadVideoFile,
  onClearVideoFile,
}: CameraViewProps) {
  const hasSource = isCameraActive || isVideoFileLoaded;

  return (
    <section className="camera-section" aria-label={t.cameraPreview}>
      <div className={isCameraActive ? "camera-frame is-mirrored" : "camera-frame"}>
        <video ref={videoRef} playsInline muted={isCameraActive} controls={SHOW_DEBUG_TOOLS && isVideoFileLoaded} />
        <canvas ref={canvasRef} aria-hidden="true" />
        {!hasSource && <div className="camera-placeholder" aria-label={t.cameraPreview} />}
      </div>

      {(cameraError || poseError) && (
        <p className="error-message" role="alert">
          {cameraError ?? poseError}
        </p>
      )}

      {SHOW_DEBUG_TOOLS && isVideoFileLoaded && (
        <div className="file-status">
          <span>{videoFileName}</span>
          <button type="button" className="icon-button" onClick={onClearVideoFile} aria-label="Clear test video">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="camera-actions dev-only">
        {SHOW_DEBUG_TOOLS && (
          <label className="upload-button">
            <Upload size={18} aria-hidden="true" />
            Load test video
            <input
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
        )}
      </div>
    </section>
  );
}
