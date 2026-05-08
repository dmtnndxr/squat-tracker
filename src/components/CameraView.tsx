import { Camera, CameraOff } from "lucide-react";

type CameraViewProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  cameraError: string | null;
  poseError: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
};

export function CameraView({
  videoRef,
  canvasRef,
  isCameraActive,
  cameraError,
  poseError,
  onStartCamera,
  onStopCamera,
}: CameraViewProps) {
  return (
    <section className="camera-section" aria-label="Camera preview">
      <div className="camera-frame">
        <video ref={videoRef} playsInline muted />
        <canvas ref={canvasRef} aria-hidden="true" />
        {!isCameraActive && <div className="camera-placeholder">Camera preview</div>}
      </div>

      {(cameraError || poseError) && (
        <p className="error-message" role="alert">
          {cameraError ?? poseError}
        </p>
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
      </div>
    </section>
  );
}
