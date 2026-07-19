"use client";

import React from "react";
import { Play } from "lucide-react";

interface ScenarioDeckProps {
  triggerSimulatorPreset: (index: number) => void;
}

export function ScenarioDeck({ triggerSimulatorPreset }: ScenarioDeckProps) {
  return (
    <footer className="border-t border-border-deep bg-panel-bg p-4 flex flex-col lg:flex-row items-center justify-between gap-4 font-mono z-30 shadow-lg">
      <div className="flex items-center gap-2.5 shrink-0">
        <Play className="h-4 w-4 text-primary animate-pulse" />
        <div>
          <div className="text-xs font-bold text-foreground tracking-wider">
            BỘ THỬ NGHIỆM GIẢ LẬP KỊCH BẢN (DEMO FEEDS)
          </div>
          <div className="text-[8px] text-foreground/40 uppercase font-semibold">
            Tái dựng 5 kịch bản rừng để đánh giá phản hồi hệ thống
          </div>
        </div>
      </div>

      {/* 5 Scenario Deck */}
      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
        <button
          onClick={() => triggerSimulatorPreset(0)}
          className="px-3.5 py-2 text-[9px] font-bold border border-primary/20 bg-primary/5 text-primary hover:bg-primary/25 transition-all duration-150 cursor-pointer rounded-[2px] active:scale-[0.98]"
        >
          🐦 BÌNH MINH BÌNH YÊN
        </button>

        <button
          onClick={() => triggerSimulatorPreset(1)}
          className="px-3.5 py-2 text-[9px] font-bold border border-alert-crimson/20 bg-alert-crimson/5 text-alert-crimson hover:bg-alert-crimson/25 transition-all duration-150 cursor-pointer rounded-[2px] active:scale-[0.98]"
        >
          🪓 PHÁT HIỆN TIẾNG CƯA MÁY
        </button>

        <button
          onClick={() => triggerSimulatorPreset(2)}
          className="px-3.5 py-2 text-[9px] font-bold border border-alert-crimson/20 bg-alert-crimson/5 text-alert-crimson hover:bg-alert-crimson/25 transition-all duration-150 cursor-pointer rounded-[2px] active:scale-[0.98]"
        >
          💥 BÁO ĐỘNG TIẾNG SÚNG SĂN
        </button>

        <button
          onClick={() => triggerSimulatorPreset(3)}
          className="px-3.5 py-2 text-[9px] font-bold border border-warning-amber/20 bg-warning-amber/5 text-warning-amber hover:bg-warning-amber/25 transition-all duration-150 cursor-pointer rounded-[2px] active:scale-[0.98]"
        >
          ⛈️ NHIỄU GIÓ BÃO (NHEO SÓNG)
        </button>

        <button
          onClick={() => triggerSimulatorPreset(4)}
          className="px-3.5 py-2 text-[9px] font-bold border border-border-light bg-border-deep text-foreground/75 hover:bg-surface-hover transition-all duration-150 cursor-pointer rounded-[2px] active:scale-[0.98]"
        >
          🌙 KHÔNG GIAN ĐÊM TĨNH
        </button>
      </div>
    </footer>
  );
}
export default ScenarioDeck;
