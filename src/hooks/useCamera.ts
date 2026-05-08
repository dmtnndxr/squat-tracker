import { useCallback, useEffect, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVideoFileLoaded, setIsVideoFileLoaded] = useState(false);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

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

  const startCamera = useCallback(async () => {
    setCameraError(null);
    clearVideoFile();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Unable to start camera");
      setIsCameraActive(false);
    }
  }, [clearVideoFile]);

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

  return {
    videoRef,
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
