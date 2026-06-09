"use client";

import { useState, useCallback, useRef } from "react";

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState | "unknown">("unknown");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permission = await navigator.permissions.query({ name: "camera" as any });
          setPermissionState(permission.state);
          if (permission.state === "denied") {
            setError("Camera permission denied. Please reset browser permission settings.");
            return null;
          }
        } catch (e) {
          // Ignored
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      setStream(mediaStream);
      setPermissionState("granted");
      return mediaStream;
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError("Failed to access camera: " + (err.message || err));
      return null;
    }
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Return base64 image data
    return canvas.toDataURL("image/jpeg", 0.85);
  }, []);

  return {
    stream,
    error,
    permissionState,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
  };
}
