import { useCallback, useEffect, useRef, useState } from "react";

type UseCameraMessages = {
  unableToStartCamera: string;
  cameraSecureContextRequired: string;
  cameraPermissionDenied: string;
};

export type CameraDevice = {
  deviceId: string;
  label: string;
};

type UseCameraOptions = UseCameraMessages & {
  selectedCameraId: string | null;
  onCameraSelectionChange: (cameraId: string | null) => void;
};

export function useCamera({
  unableToStartCamera,
  cameraSecureContextRequired,
  cameraPermissionDenied,
  selectedCameraId,
  onCameraSelectionChange,
}: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoFileLoaded, setIsVideoFileLoaded] = useState(false);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([]);

  const refreshCameraDevices = useCallback(async () => {
    const enumerateDevices = globalThis.navigator?.mediaDevices?.enumerateDevices;

    if (!enumerateDevices) {
      setCameraDevices([]);
      return [];
    }

    try {
      const devices = await enumerateDevices.call(globalThis.navigator.mediaDevices);
      const videoDevices = devices
        .filter((device) => device.kind === "videoinput" && device.deviceId)
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label,
        }));

      setCameraDevices(videoDevices);
      return videoDevices;
    } catch {
      setCameraDevices([]);
      return [];
    }
  }, []);

  const revokeVideoFile = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setIsVideoFileLoaded(false);
    setVideoFileName(null);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }, []);

  const clearVideoFile = useCallback(() => {
    revokeVideoFile();

    if (videoRef.current && !streamRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, [revokeVideoFile]);

  const cameraErrorMessage = useCallback(
    (error: unknown) => {
      if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
        return cameraPermissionDenied;
      }

      return error instanceof Error && error.message ? error.message : unableToStartCamera;
    },
    [cameraPermissionDenied, unableToStartCamera],
  );

  const shouldFallbackToDefaultCamera = useCallback(
    (error: unknown) =>
      error instanceof DOMException &&
      (error.name === "OverconstrainedError" || error.name === "NotFoundError" || error.name === "NotReadableError"),
    [],
  );

  const startCamera = useCallback(async (cameraId = selectedCameraId) => {
    setCameraError(null);
    clearVideoFile();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    try {
      const getUserMedia = globalThis.navigator?.mediaDevices?.getUserMedia;

      if (!getUserMedia) {
        setCameraError(cameraSecureContextRequired);
        setIsCameraActive(false);
        return;
      }

      const videoConstraints: MediaTrackConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        ...(cameraId ? { deviceId: { exact: cameraId } } : { facingMode: "user" }),
      };

      let stream: MediaStream;

      try {
        stream = await getUserMedia.call(globalThis.navigator.mediaDevices, {
          video: videoConstraints,
          audio: false,
        });
      } catch (error) {
        if (!cameraId || !shouldFallbackToDefaultCamera(error)) {
          throw error;
        }

        stream = await getUserMedia.call(globalThis.navigator.mediaDevices, {
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        onCameraSelectionChange(null);
      }

      void refreshCameraDevices();

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
    } catch (error) {
      setCameraError(cameraErrorMessage(error));
      setIsCameraActive(false);
    }
  }, [
    cameraSecureContextRequired,
    cameraErrorMessage,
    clearVideoFile,
    onCameraSelectionChange,
    refreshCameraDevices,
    selectedCameraId,
    shouldFallbackToDefaultCamera,
  ]);

  const loadVideoFile = useCallback(
    async (file: File) => {
      setCameraError(null);
      stopCamera();
      revokeVideoFile();

      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = objectUrl;
        videoRef.current.currentTime = 0;
        videoRef.current.loop = true;

        try {
          await videoRef.current.play();
        } catch {
          // Browsers may require the explicit play button after file selection.
        }
      }

      setVideoFileName(file.name);
      setIsVideoFileLoaded(true);
    },
    [revokeVideoFile, stopCamera],
  );

  useEffect(
    () => () => {
      stopCamera();
      revokeVideoFile();
    },
    [revokeVideoFile, stopCamera],
  );

  useEffect(() => {
    void refreshCameraDevices();

    const mediaDevices = globalThis.navigator?.mediaDevices;
    mediaDevices?.addEventListener?.("devicechange", refreshCameraDevices);

    return () => {
      mediaDevices?.removeEventListener?.("devicechange", refreshCameraDevices);
    };
  }, [refreshCameraDevices]);

  return {
    videoRef,
    cameraDevices,
    isCameraActive,
    isVideoFileLoaded,
    isVideoSourceActive: isCameraActive || isVideoFileLoaded,
    videoFileName,
    cameraError,
    startCamera,
    stopCamera,
    loadVideoFile,
    clearVideoFile,
  };
}
