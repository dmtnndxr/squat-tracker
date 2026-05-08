import { Camera, CameraOff, Upload, X } from "lucide-react";

type CameraViewProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  isVideoFileLoaded: boolean;
  videoFileName: string | null;
  cameraError: string | null;
  poseError: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onLoadVideoFile: (file: File) => void;
  onClearVideoFile: () => void;
};

export function CameraView({
  videoRef,
  canvasRef,
  isCameraActive,
  isVideoFileLoaded,
  videoFileName,
  cameraError,
  poseError,
  onStartCamera,
  onStopCamera,
  onLoadVideoFile,
  onClearVideoFile,
}: CameraViewProps) {
  const hasSource = isCameraActive || isVideoFileLoaded;

  return (
    <section className="camera-section" aria-label="Camera preview">
      <div className={isCameraActive ? "camera-frame is-mirrored" : "camera-frame"}>
        <video ref={videoRef} playsInline muted={isCameraActive} controls={isVideoFileLoaded} />
        <canvas ref={canvasRef} aria-hidden="true" />
        {!hasSource && <div className="camera-placeholder">Camera preview</div>}
      </div>

      {(cameraError || poseError) && (
        <p className="error-message" role="alert">
          {cameraError ?? poseError}
        </p>
      )}

      {isVideoFileLoaded && (
        <div className="file-status">
          <span>{videoFileName}</span>
          <button type="button" className="icon-button" onClick={onClearVideoFile} aria-label="Clear test video">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="camera-actions">
        <button type="button" className="primary-button" onClick={onStartCamera} disabled={isCameraActive}>
          <Camera size={18} aria-hidden="true" />
          Start camera
        </button>
        <button type="button" className="secondary-button" onClick={onStopCamera} disabled={!isCameraActive}>
          <CameraOff size={18} aria-hidden="true" />
          Stop camera
        </button>
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
      </div>
    </section>
  );
}
