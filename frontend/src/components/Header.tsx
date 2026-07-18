"use client";

import React from "react";
import { Activity, Volume2, VolumeX } from "lucide-react";
import { AudioPredictionResponse } from "@/lib/api";

interface HeaderProps {
  prediction: AudioPredictionResponse | null;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export function Header({ prediction, isMuted, setIsMuted }: HeaderProps) {
  const hasAlert = prediction?.threat_detections?.some((t) => t.is_alert);

  return (
    <header className="border-b border-border-deep bg-panel-bg/95 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full animate-ping" />
        </div>
        <div>
          <h1 className="text-xs font-bold tracking-widest font-mono text-foreground flex items-center gap-2">
            BIOLISTEN VN{" "}
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 border border-primary/20 rounded-[2px] font-semibold">
              FOREST OPERATIONS
            </span>
          </h1>
          <p className="text-[9px] text-primary-dark/80 font-mono tracking-wider font-semibold">
            CÚC PHƯƠNG NATIONAL PARK • COMMAND CENTER
          </p>
        </div>
      </div>

      {/* Live Metrics strip */}
      <div className="hidden lg:flex items-center gap-6 font-mono text-[10px] border-l border-border-deep pl-6 text-foreground/60">
        <div>
          <span>STATIONS ONLINE:</span> <span className="text-primary font-bold">3 / 3</span>
        </div>
        <div>
          <span>ECOSYSTEM HEALTH (SHANNON):</span>{" "}
          <span className="text-primary font-bold">
            {prediction ? prediction.ecosystem_health.shannon_index.toFixed(2) : "1.42"}
          </span>
        </div>
        <div>
          <span>STREAM LATENCY:</span>{" "}
          <span className="text-foreground/80">
            {prediction ? `${prediction.processing_time_ms}ms` : "124ms"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mute Alert toggle for demonstration safety */}
        {hasAlert && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono border rounded-[2px] font-bold tracking-wider transition-all duration-200 cursor-pointer active:scale-[0.98] ${
              isMuted
                ? "bg-surface-hover border-border-light text-foreground/60 hover:bg-border-deep"
                : "bg-alert-crimson/10 border-alert-crimson text-alert-crimson hover:bg-alert-crimson/20 animate-bounce"
            }`}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 animate-pulse" />}
            {isMuted ? "ĐÃ TẮT CÒI" : "TẮT CÒI BÁO ĐỘNG"}
          </button>
        )}

        <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 border border-primary/20 text-[9px] font-mono text-primary rounded-[2px] font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          LIVE TELEMETRY
        </div>
      </div>
    </header>
  );
}
export default Header;
