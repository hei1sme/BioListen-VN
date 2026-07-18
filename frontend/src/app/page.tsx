"use client";

import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ScenarioDeck from "@/components/ScenarioDeck";
import DashboardMonitor from "@/components/DashboardMonitor";
import DashboardHistory from "@/components/DashboardHistory";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import DashboardCatalog from "@/components/DashboardCatalog";
import DashboardDevices from "@/components/DashboardDevices";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { HistoricalRecord, AudioPredictionResponse } from "@/lib/api";

// ── Mock Initial Data ────────────────────────────────────────────────────────
const MOCK_HISTORY: HistoricalRecord[] = [
  {
    id: "hist-1",
    sensor_id: "demo-sensor-1",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    species: [
      { species_id: "pycnonotus_jocosus", common_name: "Chào mào (Red-whiskered Bulbul)", confidence: 0.92, uncertainty: 0.03, time_window: { start_sec: 1.2, end_sec: 3.8 }, is_confident: true }
    ],
    threats: [],
    shannon_index: 1.22,
    is_alert: false,
    llm_report: "Ghi nhận hoạt động sinh học bình thường của loài Chào mào tại khu vực Suối Lớn. Tần số ổn định.",
    processing_time_ms: 124
  },
  {
    id: "hist-2",
    sensor_id: "demo-sensor-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    species: [
      { species_id: "copsychus_saularis", common_name: "Chích chòe (Oriental Magpie-Robin)", confidence: 0.88, uncertainty: 0.04, time_window: { start_sec: 0.5, end_sec: 4.2 }, is_confident: true }
    ],
    threats: [],
    shannon_index: 1.34,
    is_alert: false,
    llm_report: "Phát hiện tiếng hót đặc trưng của Chích chòe lửa tại Đỉnh Mây. Không phát hiện tiếng động cơ hay súng săn.",
    processing_time_ms: 135
  },
  {
    id: "hist-3",
    sensor_id: "demo-sensor-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    species: [],
    threats: [
      { threat_type: "chainsaw", confidence: 0.87, uncertainty: 0.05, is_alert: true }
    ],
    shannon_index: 0.35,
    is_alert: true,
    llm_report: "CẢNH BÁO: Phát hiện tiếng cưa máy hoạt động tại phân khu Rừng Già. Cần đội kiểm lâm kiểm tra khẩn cấp.",
    processing_time_ms: 148
  }
];

const MOCK_TREND = [
  { timestamp: "08:00", shannon_index: 1.45, species_richness: 4 },
  { timestamp: "10:00", shannon_index: 1.58, species_richness: 5 },
  { timestamp: "12:00", shannon_index: 1.12, species_richness: 3 },
  { timestamp: "14:00", shannon_index: 1.62, species_richness: 6 },
  { timestamp: "16:00", shannon_index: 1.35, species_richness: 4 },
  { timestamp: "18:00", shannon_index: 1.42, species_richness: 5 },
  { timestamp: "20:00", shannon_index: 0.95, species_richness: 2 }
];

const SPECIES_CATALOG = [
  {
    id: "pycnonotus_jocosus",
    name: "Chào mào (Red-whiskered Bulbul)",
    scientific: "Pycnonotus jocosus",
    frequencyRange: "1.5 kHz - 4.5 kHz",
    description: "Loài chim có mào đặc trưng, giọng hót cao, lảnh lót. Thường hoạt động mạnh vào sáng sớm ở tầng tán rừng Cúc Phương.",
    icon: "🐦"
  },
  {
    id: "acridotheres_tristis",
    name: "Sáo đá (Common Myna)",
    scientific: "Acridotheres tristis",
    frequencyRange: "1.2 kHz - 3.8 kHz",
    description: "Loài chim thông minh, có tiếng hót đa dạng, đôi khi bắt chước âm thanh khác. Phổ biến ở khu vực bìa rừng và trạm quản lý.",
    icon: "🦅"
  },
  {
    id: "copsychus_saularis",
    name: "Chích chòe (Oriental Magpie-Robin)",
    scientific: "Copsychus saularis",
    frequencyRange: "2.0 kHz - 6.0 kHz",
    description: "Giọng hót réo rắt nhiều âm điệu phức tạp, tần số âm thanh trung bình-cao. Chỉ thị tốt cho tình trạng thảm thực vật rừng rậm.",
    icon: "🕊️"
  },
  {
    id: "halcyon_smyrnensis",
    name: "Bói cá trắng (White-throated Kingfisher)",
    scientific: "Halcyon smyrnensis",
    frequencyRange: "2.5 kHz - 5.0 kHz",
    description: "Tiếng kêu chói tai, rền rĩ đặc trưng khi bay dọc các khe suối trong công viên quốc gia.",
    icon: "🪶"
  },
  {
    id: "microhyla_fissipes",
    name: "Ếch nhái Ornate (Narrow-mouthed Frog)",
    scientific: "Microhyla fissipes",
    frequencyRange: "300 Hz - 1.2 kHz",
    description: "Âm thanh trầm đục, lặp đi lặp lại phát ra sát mặt đất rụng lá ẩm ướt sau các cơn mưa dông rừng nhiệt đới.",
    icon: "🐸"
  }
];

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    activeSensor,
    setActiveSensor,
    isProcessing,
    prediction,
    setPrediction,
    showGradcam,
    setShowGradcam,
    isMuted,
    setIsMuted,
    history,
    errorMessage,
    mounted,
    triggerSimulatorPreset,
    handlePredictAudio,
    trendData
  } = useDashboardState(MOCK_HISTORY);

  const {
    isRecording,
    recordingDuration,
    errorMessage: recorderError,
    startRecording,
    stopRecording,
    canvasRef
  } = useAudioRecorder();

  // Combines recorder errors with main api client errors
  const activeError = errorMessage || recorderError;

  const handlePredictAudioFromRecorder = (file: File) => {
    handlePredictAudio(file);
  };

  const handlePredictAudioFromUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handlePredictAudio(files[0]);
  };

  const handleViewHistoryDetails = (record: HistoricalRecord) => {
    const historicalPrediction: AudioPredictionResponse = {
      request_id: record.id,
      duration_sec: 5.0,
      processing_time_ms: record.processing_time_ms,
      species_detections: record.species,
      threat_detections: record.threats,
      ecosystem_health: {
        shannon_index: record.shannon_index,
        species_richness: record.species.length,
        trend: record.threats.some((t) => t.is_alert) ? "declining" : "stable",
        assessment: record.threats.some((t) => t.is_alert) ? "Báo động xâm hại" : "Ổn định"
      },
      spectrogram_base64: record.threats.some((t) => t.threat_type === "chainsaw")
        ? "procedural_chainsaw"
        : record.threats.some((t) => t.threat_type === "gunshot")
        ? "procedural_gunshot"
        : record.species.length > 0
        ? "procedural_birds"
        : "procedural_silent",
      gradcam_base64: "",
      llm_report: record.llm_report
    };

    setPrediction(historicalPrediction);
    setActiveSensor(record.sensor_id);
    setActiveTab("monitor");
  };

  const hasAlert = prediction?.threat_detections?.some((t) => t.is_alert) ?? false;

  return (
    <div className={`flex flex-col h-screen max-h-screen text-foreground font-mono antialiased overflow-hidden border-6 border-transparent transition-all duration-300 ${
      hasAlert ? "animate-screen-border" : ""
    }`}>

      {/* Header bar */}
      <Header
        prediction={prediction}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Sidebar Nav */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSensor={activeSensor}
          setActiveSensor={setActiveSensor}
          historyLength={history.length}
          catalogLength={SPECIES_CATALOG.length}
          hasAlert={hasAlert}
        />

        {/* Content Viewports */}
        <main className="flex-1 bg-background/50 p-6 overflow-y-auto">
          {activeTab === "monitor" && (
            <DashboardMonitor
              isRecording={isRecording}
              recordingDuration={recordingDuration}
              startRecording={() => startRecording(handlePredictAudioFromRecorder)}
              stopRecording={stopRecording}
              canvasRef={canvasRef}
              handleAudioUpload={handlePredictAudioFromUpload}
              prediction={prediction}
              showGradcam={showGradcam}
              setShowGradcam={setShowGradcam}
              activeSensor={activeSensor}
              setActiveSensor={setActiveSensor}
              isProcessing={isProcessing}
              errorMessage={activeError}
            />
          )}

          {activeTab === "history" && (
            <DashboardHistory
              history={history}
              onViewDetails={handleViewHistoryDetails}
            />
          )}

          {activeTab === "analytics" && (
            <DashboardAnalytics
              mounted={mounted}
              prediction={prediction}
              trendData={trendData && trendData.length > 0 ? trendData : MOCK_TREND}
            />
          )}

          {activeTab === "catalog" && (
            <DashboardCatalog
              catalog={SPECIES_CATALOG}
            />
          )}

          {activeTab === "devices" && (
            <DashboardDevices />
          )}
        </main>
      </div>

      {/* Bottom Deck Simulator scenarios */}
      <ScenarioDeck triggerSimulatorPreset={triggerSimulatorPreset} />
    </div>
  );
}
