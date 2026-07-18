"use client";

import React from "react";
import AudioIngestion from "./AudioIngestion";
import SpectrogramViewer from "./SpectrogramViewer";
import GeoMap from "./GeoMap";
import AlertControl from "./AlertControl";
import { AudioPredictionResponse } from "@/lib/api";

interface DashboardMonitorProps {
  // Recorder states
  isRecording: boolean;
  recordingDuration: number;
  startRecording: () => void;
  stopRecording: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  handleAudioUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  // Dashboard state variables
  prediction: AudioPredictionResponse | null;
  showGradcam: boolean;
  setShowGradcam: (show: boolean) => void;
  activeSensor: string;
  setActiveSensor: (sensorId: string) => void;
  isProcessing: boolean;
  errorMessage: string | null;
}

export function DashboardMonitor({
  isRecording,
  recordingDuration,
  startRecording,
  stopRecording,
  canvasRef,
  handleAudioUpload,
  prediction,
  showGradcam,
  setShowGradcam,
  activeSensor,
  setActiveSensor,
  isProcessing,
  errorMessage,
}: DashboardMonitorProps) {
  const hasAlert = prediction?.threat_detections?.some((t) => t.is_alert) ?? false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Audio Ingestion & Spectrogram Visualizer */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <AudioIngestion
          isRecording={isRecording}
          recordingDuration={recordingDuration}
          isProcessing={isProcessing}
          errorMessage={errorMessage}
          startRecording={startRecording}
          stopRecording={stopRecording}
          canvasRef={canvasRef}
          handleAudioUpload={handleAudioUpload}
        />
        <SpectrogramViewer
          prediction={prediction}
          showGradcam={showGradcam}
          setShowGradcam={setShowGradcam}
        />
      </div>

      {/* Right Column: GIS Map & Warning Alerts Telemetry */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <GeoMap
          activeSensor={activeSensor}
          setActiveSensor={setActiveSensor}
          hasAlert={hasAlert}
        />
        <AlertControl
          prediction={prediction}
          activeSensor={activeSensor}
        />
      </div>
    </div>
  );
}
export default DashboardMonitor;
