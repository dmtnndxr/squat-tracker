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

  return (
    <div className="flex w-full max-w-sm items-stretch gap-2">
      {canSwitchCamera && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-[#444933]/80 bg-[#131314]/85 text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur transition hover:border-[#c3f400] hover:text-[#c3f400]">
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="relative">
              <Video size={20} aria-hidden="true" />
              <ChevronDown
                className="absolute -bottom-2 -right-3 rounded-sm bg-[#131314]"
                size={13}
                aria-hidden="true"
              />
            </span>
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

      <button
        type="button"
        className={`inline-flex min-h-14 min-w-0 flex-1 items-center justify-center gap-3 rounded-md px-6 text-sm font-black uppercase tracking-[0.1em] shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition active:scale-[0.99] ${
          isCameraActive
            ? "bg-[#ff6b35] text-[#1f0700] hover:bg-[#ff855c]"
            : "bg-[#c3f400] text-[#161e00] shadow-[0_18px_50px_rgba(195,244,0,0.22)] hover:bg-[#d8ff33]"
        }`}
        onClick={onCameraToggle}
      >
        {isCameraActive ? <VideoOff size={20} aria-hidden="true" /> : <Video size={20} aria-hidden="true" />}
        <span className="truncate">{isCameraActive ? t.turnOffCamera : t.turnOnCamera}</span>
      </button>
    </div>
  );
}
