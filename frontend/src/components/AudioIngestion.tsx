"use client";

import React, { useState } from "react";
import { Activity, Mic, Pause, UploadCloud, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface AudioIngestionProps {
  isRecording: boolean;
  recordingDuration: number;
  isProcessing: boolean;
  errorMessage: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handleAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AudioIngestion({
  isRecording,
  recordingDuration,
  isProcessing,
  errorMessage,
  startRecording,
  stopRecording,
  canvasRef,
  handleAudioUpload,
}: AudioIngestionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-border-deep bg-panel-bg p-5 rounded-[2px] relative shadow-lg">
      <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-border-deep text-[8px] font-mono text-foreground/40 border-l border-b border-border-deep rounded-bl-[2px]">
        INGESTION MODULE
      </div>

      <div className="flex items-center justify-between mb-4 border-b border-border-deep pb-2">
        <h2 className="text-xs font-bold font-mono tracking-widest text-foreground/80 flex items-center gap-2 uppercase">
          <Activity className="h-4 w-4 text-primary" /> BỘ THU NHẬN & PHÂN TÍCH ÂM THANH (DEMO ONLY)
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:text-primary-dark font-mono text-[9px] font-bold border border-primary/20 bg-primary/5 px-2.5 py-1 rounded-[2px] transition-all cursor-pointer flex items-center gap-1 active:scale-[0.98]"
        >
          {isExpanded ? (
            <>
              ẨN BỘ THU <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              HIỆN BỘ THU <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Live Mic Recorder */}
          <div className="border border-border-deep bg-background p-4 flex flex-col justify-between items-center text-center relative rounded-[2px]">
            <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[8px] font-mono text-foreground/40 uppercase">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isRecording ? "bg-alert-crimson animate-ping" : "bg-foreground/20"
                }`}
              />
              Ghi âm từ trạm
            </div>

            <div className="my-4 flex flex-col items-center gap-2">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="h-14 w-14 bg-alert-crimson border border-alert-crimson/50 text-white flex items-center justify-center rounded-full shadow-lg shadow-alert-crimson/25 hover:bg-alert-crimson/90 transition-all cursor-pointer animate-pulse active:scale-[0.95]"
                >
                  <Pause className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  className="h-14 w-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-full shadow-sm hover:bg-primary/25 disabled:opacity-50 transition-all cursor-pointer active:scale-[0.95]"
                >
                  <Mic className="h-5 w-5 animate-pulse" />
                </button>
              )}
              <span className="text-[10px] font-mono text-foreground/50 mt-2">
                {isRecording
                  ? `Đang thu âm: ${recordingDuration}s / 10s`
                  : "Ghi trực tiếp từ micro trạm"}
              </span>
            </div>

            {/* Microphone visualizer canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-14 bg-[#0c1310] border border-border-deep rounded-[2px]"
              width={300}
              height={56}
            />
          </div>

          {/* Drag and Drop Wav Upload */}
          <div className="border border-border-deep bg-background p-4 flex flex-col justify-between items-center text-center relative rounded-[2px]">
            <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] font-mono text-foreground/40 uppercase">
              <UploadCloud className="h-3.5 w-3.5 text-foreground/45" /> Tải lên tệp âm thanh
            </div>

            <div className="my-auto flex flex-col items-center p-3 w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-primary/20 hover:border-primary/50 rounded-[2px] cursor-pointer bg-panel-bg hover:bg-primary/5 transition-all p-4">
                <UploadCloud className="h-7 w-7 text-primary mb-1" />
                <span className="text-[10px] text-foreground/80 font-mono font-medium">
                  Tải tệp tin .wav (5s - 60s)
                </span>
                <span className="text-[9px] text-foreground/40 mt-0.5 font-mono">
                  Click để chọn hoặc kéo thả
                </span>
                <input
                  type="file"
                  accept="audio/wav"
                  className="hidden"
                  onChange={handleAudioUpload}
                  disabled={isProcessing || isRecording}
                />
              </label>
            </div>

            {errorMessage && (
              <div className="mt-2 text-[9px] font-mono text-alert-crimson flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing / Classification Loading overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-[#090d0b]/95 z-10 flex flex-col items-center justify-center text-center p-6 rounded-[2px] border border-primary/25">
          <div className="relative w-12 h-12 mb-3">
            <div className="absolute inset-0 border-3 border-dashed border-primary rounded-full animate-spin" />
            <Activity className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="text-[10px] font-mono text-primary animate-pulse tracking-wide font-bold">
            Đang phân tích phổ tần & chạy nhận dạng PyTorch...
          </div>
          <div className="text-[9px] text-foreground/45 font-mono mt-0.5">
            Executing inference heads on CPU edge node
          </div>
        </div>
      )}
    </div>
  );
}
export default AudioIngestion;
