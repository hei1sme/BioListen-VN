"use client";

import React, { useRef, useEffect } from "react";
import { Activity } from "lucide-react";
import { AudioPredictionResponse } from "@/lib/api";

interface SpectrogramViewerProps {
  prediction: AudioPredictionResponse | null;
  showGradcam: boolean;
  setShowGradcam: (show: boolean) => void;
}

export function SpectrogramViewer({
  prediction,
  showGradcam,
  setShowGradcam,
}: SpectrogramViewerProps) {
  const specCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawProceduralSpectrogram = (canvas: HTMLCanvasElement | null, type: string, heat: boolean) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0c1310"; // dark background matching panel-bg
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines
    ctx.strokeStyle = "rgba(0, 255, 143, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (type === "procedural_birds") {
      ctx.lineWidth = 3;
      const grad1 = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad1.addColorStop(0, "transparent");
      grad1.addColorStop(0.2, heat ? "#f43f5e" : "#00ff8f");
      grad1.addColorStop(0.3, heat ? "#f59e0b" : "#10b981");
      grad1.addColorStop(0.4, "transparent");
      ctx.strokeStyle = grad1;
      ctx.beginPath();
      for (let x = 50; x < 200; x++) {
        const y = 80 - Math.sin((x - 50) * 0.04) * 30;
        if (x === 50) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      const grad2 = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad2.addColorStop(0.4, "transparent");
      grad2.addColorStop(0.6, heat ? "#f43f5e" : "#00ff8f");
      grad2.addColorStop(0.7, heat ? "#f59e0b" : "#10b981");
      grad2.addColorStop(0.8, "transparent");
      ctx.strokeStyle = grad2;
      ctx.beginPath();
      for (let x = 200; x < 350; x++) {
        const y = 60 - Math.sin((x - 200) * 0.04) * 20;
        if (x === 200) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    } else if (type === "procedural_chainsaw") {
      ctx.lineWidth = 1;
      ctx.strokeStyle = heat ? "rgba(244, 63, 94, 0.4)" : "rgba(0, 255, 143, 0.3)";

      for (let y = canvas.height - 40; y < canvas.height - 10; y += 4) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(canvas.width - 10, y + Math.sin(y) * 3);
        ctx.stroke();
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = heat ? "#f43f5e" : "#00ff8f";
      ctx.beginPath();
      for (let x = 20; x < canvas.width - 20; x += 6) {
        const y = 140 + (x % 12 === 0 ? 15 : -15) + Math.random() * 5;
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (heat) {
        ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
        ctx.fillRect(80, 110, 240, 60);
        ctx.strokeStyle = "#f59e0b";
        ctx.strokeRect(80, 110, 240, 60);
      }
    } else if (type === "procedural_gunshot") {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.3, heat ? "#f43f5e" : "#00ff8f");
      grad.addColorStop(0.5, heat ? "#f59e0b" : "#10b981");
      grad.addColorStop(0.9, heat ? "rgba(244, 63, 94, 0.1)" : "rgba(0, 255, 143, 0.1)");

      ctx.fillStyle = grad;
      ctx.fillRect(150, 20, 25, canvas.height - 30);

      if (heat) {
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.strokeRect(145, 15, 35, canvas.height - 25);
      }
    } else if (type === "procedural_storm") {
      const grad = ctx.createRadialGradient(200, 160, 10, 200, 160, 90);
      grad.addColorStop(0, heat ? "rgba(245, 158, 11, 0.6)" : "rgba(0, 255, 143, 0.4)");
      grad.addColorStop(0.8, heat ? "rgba(244, 63, 94, 0.1)" : "rgba(5, 150, 105, 0.1)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(200, 160, 95, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(0, 255, 143, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 30);
      for (let x = 0; x < canvas.width; x += 10) {
        ctx.lineTo(x, canvas.height - 30 + Math.random() * 4);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (specCanvasRef.current) {
      const specSrc = prediction?.spectrogram_base64 || "procedural_silent";

      // Check if base64 contains real image sources from backend
      if (specSrc.startsWith("data:image/") || specSrc.startsWith("http")) {
        const canvas = specCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Overlay Gradcam heatmap image on top if active
            if (showGradcam && prediction?.gradcam_base64?.startsWith("data:image/")) {
              const camImg = new Image();
              camImg.onload = () => {
                ctx.globalAlpha = 0.55;
                ctx.drawImage(camImg, 0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1.0;
              };
              camImg.src = prediction.gradcam_base64;
            }
          };
          img.src = specSrc;
        }
      } else {
        // Fallback to procedurally generated spectrogram curves
        drawProceduralSpectrogram(specCanvasRef.current, specSrc, showGradcam);
      }
    }
  }, [prediction, showGradcam]);

  return (
    <div className="border border-border-deep bg-panel-bg p-5 rounded-[2px] relative shadow-lg">
      <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-border-deep text-[8px] font-mono text-foreground/40 border-l border-b border-border-deep rounded-bl-[2px]">
        SPECTRAL ANALYSIS
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xs font-bold font-mono tracking-widest text-foreground/80 flex items-center gap-2 uppercase">
          <Activity className="h-4 w-4 text-primary" /> Phổ âm tần (Spectrogram) & Bản đồ nhiệt AI
        </h2>

        {/* Grad-CAM toggle switch */}
        <button
          onClick={() => setShowGradcam(!showGradcam)}
          disabled={!prediction}
          className={`px-3 py-1.5 text-[10px] font-mono border rounded-[2px] font-bold transition-all duration-200 active:scale-[0.98] ${
            !prediction
              ? "opacity-30 cursor-not-allowed border-border-deep text-foreground/40 bg-transparent"
              : showGradcam
              ? "bg-warning-amber/10 border-warning-amber text-warning-amber shadow-md cursor-pointer hover:bg-warning-amber/20"
              : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 cursor-pointer"
          }`}
        >
          {showGradcam ? "ẨN ĐỘ TẬP TRUNG GRAD-CAM" : "XEM ĐỘ TẬP TRUNG GRAD-CAM (XAI)"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        {/* Mel Spectrogram display canvas */}
        <div className="flex-1 bg-background p-3 border border-border-deep rounded-[2px] flex flex-col justify-center relative min-h-[210px]">
          <div className="absolute top-2 left-2 bg-[#090d0b] border border-border-deep px-2.5 py-0.5 text-[8px] font-mono text-primary z-10 flex items-center gap-1.5 rounded-[2px] font-semibold">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                showGradcam ? "bg-warning-amber animate-pulse" : "bg-primary animate-pulse"
              }`}
            />
            {showGradcam ? "BẢN ĐỒ NHIỆT GIẢI THÍCH GRAD-CAM XAI" : "PHỔ LOG FREQUENCY SPECTROGRAM (5.0s)"}
          </div>

          {/* Display Canvas */}
          <canvas
            ref={specCanvasRef}
            className="w-full h-44 bg-[#0c1310] rounded-[2px] border border-border-deep"
            width={450}
            height={176}
          />

          {/* Canvas legend labels */}
          <div className="flex justify-between items-center text-[8px] text-foreground/30 font-mono mt-1 px-1">
            <span>0.0 Giây (Khởi đầu)</span>
            <span>Độ dài khung cửa sổ: 5.0 Giây</span>
            <span>5.0 Giây (Kết thúc)</span>
          </div>
        </div>

        {/* Spectrogram Y-Axis legend block */}
        <div className="w-full md:w-48 bg-background p-4 border border-border-deep flex flex-col justify-between font-mono text-[9px] rounded-[2px]">
          <div>
            <div className="text-primary font-bold mb-2 uppercase border-b border-border-deep pb-1 tracking-wider">
              Trục Tần số (Hz)
            </div>
            <div className="flex flex-col gap-1.5 text-foreground/60 font-mono">
              <div className="flex justify-between">
                <span>Max:</span> <span className="text-primary font-bold">11,025 Hz</span>
              </div>
              <div className="flex justify-between">
                <span>Mid:</span> <span>5,500 Hz</span>
              </div>
              <div className="flex justify-between">
                <span>Min:</span> <span>50 Hz</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border-deep">
            <div className="text-primary font-bold mb-2 uppercase pb-1 tracking-wider">
              Cường độ âm (dB)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-20 bg-gradient-to-t from-border-deep via-primary-dark to-primary border border-border-light rounded-[2px]" />
              <div className="flex flex-col justify-between h-20 text-[8px] text-foreground/30 font-mono">
                <span>-10 dB (Lớn)</span>
                <span>-50 dB (Trung)</span>
                <span>-90 dB (Nhỏ)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SpectrogramViewer;
