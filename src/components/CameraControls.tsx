import { ChevronDown, Video, VideoOff } from "lucide-react";
import type { CameraDevice } from "../hooks/useCamera";
import type { Messages } from "../i18n/translations";

type CameraControlsProps = {
  t: Messages;
  isCameraActive: boolean;
  cameraDevices: CameraDevice[];
  selectedCameraId: string | null;
  onCameraToggle: () => void;
  onSelectCamera: (cameraId: string | null) => void;
};

export function CameraControls({
  t,
  isCameraActive,
  cameraDevices,
  selectedCameraId,
  onCameraToggle,
  onSelectCamera,
}: CameraControlsProps) {
  const canSwitchCamera = isCameraActive && cameraDevices.length > 1;
  const buttonLabel = isCameraActive ? t.turnOffCamera : t.turnOnCamera;

  return (
    <div className="flex w-full max-w-sm items-stretch rounded-md shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <button
        type="button"
        className={`inline-flex min-h-12 min-w-0 flex-1 items-center justify-center gap-2 px-4 text-xs font-black uppercase tracking-[0.08em] transition active:scale-[0.99] sm:min-h-14 sm:gap-3 sm:px-6 sm:text-sm sm:tracking-[0.1em] ${
          canSwitchCamera ? "rounded-l-md rounded-r-none" : "rounded-md"
        } ${
          isCameraActive
            ? "bg-[#ff6b35] text-[#1f0700] hover:bg-[#ff855c]"
            : "bg-[#c3f400] text-[#161e00] shadow-[0_18px_50px_rgba(195,244,0,0.22)] hover:bg-[#d8ff33]"
        }`}
        onClick={onCameraToggle}
        aria-label={buttonLabel}
      >
        {isCameraActive ? <VideoOff size={20} aria-hidden="true" /> : <Video size={20} aria-hidden="true" />}
        <span className="truncate">{buttonLabel}</span>
      </button>

      {canSwitchCamera && (
        <div className="relative min-h-12 w-12 shrink-0 overflow-hidden rounded-r-md border-l border-[#1f0700]/25 bg-[#ff6b35] text-[#1f0700] transition hover:bg-[#ff855c] sm:min-h-14 sm:w-14">
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <ChevronDown size={22} strokeWidth={2.6} aria-hidden="true" />
          </span>
          <select
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={selectedCameraId ?? ""}
            onChange={(event) => onSelectCamera(event.target.value || null)}
            aria-label={t.cameraSource}
            title={t.cameraSource}
          >
            <option value="">{t.defaultCamera}</option>
            {cameraDevices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || t.cameraLabel.replace("{index}", String(index + 1))}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
