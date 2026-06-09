"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCamera } from "@/hooks/useCamera";
import { useScan } from "@/hooks/useScan";
import {
  Camera,
  UploadCloud,
  FileText,
  Utensils,
  Package,
  RefreshCw,
  Leaf,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

export default function ScanPage() {
  const { data: session } = useSession();
  const token = (session?.user as any)?.id || "dev-user";
  
  const [scanType, setScanType] = useState<"meal" | "receipt" | "product_label">("meal");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const {
    stream,
    error: cameraError,
    permissionState,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto
  } = useCamera();

  const {
    loading: scanLoading,
    error: scanError,
    result,
    startScan,
    clearResult
  } = useScan();

  // Handle stream assignment to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStartCamera = async () => {
    setUploadFile(null);
    setImagePreview(null);
    clearResult();
    const activeStream = await startCamera();
    if (activeStream) {
      setCameraActive(true);
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setCameraActive(false);
  };

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      setImagePreview(photo);
      handleStopCamera();
      // Auto run scan
      startScan(photo, scanType, token);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleStopCamera();
      setUploadFile(file);
      clearResult();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Trigger scan
        startScan(file, scanType, token);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleStopCamera();
      setUploadFile(file);
      clearResult();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        startScan(file, scanType, token);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setUploadFile(null);
    clearResult();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">AI Carbon Scanner</h1>
        <p className="text-text-secondary text-sm font-body mt-1">
          Select scan mode, then take a photo or drag-and-drop a file to extract CO₂e metrics.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 p-1.5 bg-bg-secondary border border-border rounded-2xl w-full sm:w-fit font-body">
        <button
          onClick={() => { setScanType("meal"); handleReset(); }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto ${
            scanType === "meal"
              ? "bg-accent-primary text-white"
              : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Utensils className="w-4 h-4" />
          Meal Analysis
        </button>
        <button
          onClick={() => { setScanType("receipt"); handleReset(); }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto ${
            scanType === "receipt"
              ? "bg-accent-primary text-white"
              : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          }`}
        >
          <FileText className="w-4 h-4" />
          Receipt / Bill
        </button>
        <button
          onClick={() => { setScanType("product_label"); handleReset(); }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full sm:w-auto ${
            scanType === "product_label"
              ? "bg-accent-primary text-white"
              : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
          }`}
        >
          <Package className="w-4 h-4" />
          Product Label
        </button>
      </div>

      {/* Primary Capture Area */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left pane: Camera stream or File Upload viewport */}
        <div className="md:col-span-3 flex flex-col items-center">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="relative w-full aspect-[4/3] bg-bg-secondary border-2 border-dashed border-border/80 rounded-3xl overflow-hidden flex flex-col items-center justify-center shadow-inner"
          >
            {cameraActive ? (
              // Live camera view
              <div className="absolute inset-0 flex flex-col justify-between">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
                
                {/* Control elements */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 z-10 px-4">
                  <button
                    onClick={handleStopCamera}
                    className="px-5 py-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCapture}
                    aria-label="Capture photo"
                    className="w-16 h-16 rounded-full border-4 border-white bg-accent-primary hover:bg-accent-primary/95 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/30" />
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              // Image preview
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <img
                  src={imagePreview}
                  alt="Scanned Preview"
                  className="w-full h-full object-cover"
                />
                
                {/* Scanner pulse overlay when processing */}
                {scanLoading && (
                  <div className="absolute inset-0 bg-accent-primary/20 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-white font-semibold text-sm drop-shadow font-mono">
                      Gemini Analyzing emissions...
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Empty Upload Dropzone
              <div className="p-6 text-center flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-accent-primary/10 text-accent-primary rounded-full">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold">Drag and drop your image here</p>
                  <p className="text-xs text-text-secondary mt-1">Supports JPG, PNG, and WEBP up to 10MB</p>
                </div>
                
                <div className="flex gap-3 mt-2 font-body">
                  <label className="cursor-pointer px-5 py-2 rounded-full border border-border bg-bg-primary hover:bg-bg-tertiary text-xs font-semibold shadow-sm transition-all">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleStartCamera}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent-primary text-white text-xs font-semibold shadow-sm hover:bg-accent-primary/95 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Open Camera
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {cameraError && (
            <div className="w-full mt-4 p-3.5 bg-danger/10 border border-danger/20 text-danger rounded-2xl flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* Right pane: Analysis Results details */}
        <div className="md:col-span-2">
          {result ? (
            // Analysis Display Card
            <div className="glass-card p-6 rounded-3xl space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-xl">Analysis Complete</h3>
                <span className={`text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border ${
                  result.carbon_tier === "low" ? "bg-green-500/10 border-green-500/20 text-green-500" :
                  result.carbon_tier === "medium" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                  "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                  {result.carbon_tier} Impact
                </span>
              </div>

              {/* Total CO2 */}
              <div className="p-4 bg-bg-primary/50 border border-border rounded-2xl flex items-center justify-between">
                <span className="text-xs text-text-secondary font-semibold font-body">Total Carbon</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-extrabold text-accent-primary dark:text-accent-secondary">
                    {result.total_co2e_kg}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary">kg CO₂e</span>
                </div>
              </div>

              {/* Explanation */}
              <p className="text-xs text-text-secondary leading-relaxed font-body">
                {result.explanation}
              </p>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest font-mono text-text-secondary font-semibold">
                  Items breakdown
                </span>
                
                <div className="space-y-2 font-body">
                  {result.items.map((item: any, idx: number) => {
                    const maxItemVal = Math.max(...result.items.map((i: any) => i.co2e_kg), 1);
                    const pctWidth = Math.min((item.co2e_kg / maxItemVal) * 100, 100);
                    
                    return (
                      <div key={idx} className="p-3 border border-border/50 rounded-2xl bg-bg-secondary">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{item.name} ({item.estimated_quantity})</span>
                          <span className="font-mono text-text-secondary">{item.co2e_kg} kg</span>
                        </div>
                        {/* Bar */}
                        <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden mt-2">
                          <div 
                            className="h-full bg-accent-secondary rounded-full"
                            style={{ width: `${pctWidth}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-text-secondary mt-1 font-mono">
                          <span>Confidence: {item.confidence}</span>
                          <span>Source: {item.data_source}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Swaps Suggestions */}
              {result.green_alternatives.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase tracking-widest font-mono text-text-secondary font-semibold flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5 text-accent-secondary" />
                    Recommended Eco Swaps
                  </span>
                  
                  <div className="space-y-2 font-body">
                    {result.green_alternatives.map((alt: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-2xl border border-success/20 bg-success/5 space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-success">
                          <span>{alt.swap}</span>
                          <span className="font-mono">Save -{alt.savings_co2e_kg} kg</span>
                        </div>
                        <p className="text-[10px] text-text-secondary leading-normal">
                          {alt.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan another photo
              </button>
            </div>
          ) : scanLoading ? (
            // Skeleton / Loader
            <div className="glass-card p-6 rounded-3xl space-y-6 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-10 h-10 border-4 border-accent-secondary/30 border-t-accent-primary rounded-full animate-spin mb-2" />
              <div>
                <h4 className="font-display font-bold">Scanning in Progress</h4>
                <p className="text-xs text-text-secondary mt-1 max-w-[200px] leading-relaxed font-body">
                  Vertex AI Gemini is extracting food ingredients and checking IPCC databases...
                </p>
              </div>
            </div>
          ) : scanError ? (
            // Error panel
            <div className="glass-card p-6 rounded-3xl space-y-6 border-danger/20">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-display font-bold">Scanning Failed</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed font-body">
                {scanError}
              </p>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-2xl bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary text-xs font-semibold transition-all"
              >
                Reset Scanner
              </button>
            </div>
          ) : (
            // Instructions placeholder card
            <div className="glass-card p-6 rounded-3xl py-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="p-3.5 bg-bg-tertiary text-text-secondary rounded-2xl">
                <Sparkles className="w-6 h-6 text-accent-secondary animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm">Waiting for Photo</h4>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-body max-w-[220px] mx-auto">
                  Take a photo or choose an image to view detailed emissions and green alternatives.
                </p>
              </div>
              
              <div className="pt-4 border-t border-border/50 w-full flex items-center justify-center gap-1.5 text-[10px] text-text-secondary font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-success" />
                Privacy Guard: Photos deleted after 30 days
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
