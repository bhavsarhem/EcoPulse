"use client";

import { useState } from "react";

export function useScan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const startScan = async (
    imageSrc: string | File,
    scanType: "meal" | "receipt" | "product_label",
    token: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("scan_type", scanType);
      
      if (typeof imageSrc === "string") {
        // Convert base64 DataURL to blob
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        formData.append("file", blob, "capture.jpg");
      } else {
        formData.append("file", imageSrc);
      }

      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || errData.error || "Failed to analyze image");
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err: any) {
      console.error("Scanning request failed:", err);
      setError(err.message || "An error occurred during carbon analysis");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    loading,
    error,
    result,
    startScan,
    clearResult,
  };
}
