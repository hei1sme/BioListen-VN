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
      { species_id: "birds", common_name: "Nhóm Chim (Birds)", confidence: 0.92, uncertainty: 0.03, time_window: { start_sec: 1.2, end_sec: 3.8 }, is_confident: true }
    ],
    threats: [],
    shannon_index: 1.22,
    is_alert: false,
    llm_report: "Ghi nhận hoạt động sinh học bình thường của nhóm Chim tại khu vực Suối Lớn. Tần số ổn định.",
    processing_time_ms: 124
  },
  {
    id: "hist-2",
    sensor_id: "demo-sensor-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    species: [
      { species_id: "birds", common_name: "Nhóm Chim (Birds)", confidence: 0.88, uncertainty: 0.04, time_window: { start_sec: 0.5, end_sec: 4.2 }, is_confident: true },
      { species_id: "insects", common_name: "Nhóm Côn trùng (Insects)", confidence: 0.76, uncertainty: 0.06, time_window: { start_sec: 2.0, end_sec: 4.5 }, is_confident: true }
    ],
    threats: [],
    shannon_index: 1.34,
    is_alert: false,
    llm_report: "Phát hiện tiếng hót đặc trưng của nhóm Chim rừng và nhóm Côn trùng tại Đỉnh Mây. Không phát hiện tiếng động cơ hay súng săn.",
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
  { timestamp: "08:00", shannon_index: 1.45, species_richness: 2 },
  { timestamp: "10:00", shannon_index: 1.58, species_richness: 3 },
  { timestamp: "12:00", shannon_index: 1.12, species_richness: 1 },
  { timestamp: "14:00", shannon_index: 1.62, species_richness: 3 },
  { timestamp: "16:00", shannon_index: 1.35, species_richness: 2 },
  { timestamp: "18:00", shannon_index: 1.42, species_richness: 2 },
  { timestamp: "20:00", shannon_index: 0.95, species_richness: 1 }
];

const SPECIES_CATALOG = [
  {
    id: "birds",
    name: "Nhóm Chim (Birds)",
    scientific: "Aves",
    frequencyRange: "1.0 kHz - 8.0 kHz",
    description: "Nhóm chim rừng hoang dã bao gồm các loài chim hót đặc trưng (Chào mào, Chích chòe, Khướu) phân bố rộng khắp các tầng tán cây, là chỉ thị quan trọng cho sự đa dạng sinh học tầng cao.",
    icon: "🐦"
  },
  {
    id: "frogs",
    name: "Nhóm Ếch nhái (Frogs/Amphibians)",
    scientific: "Anura",
    frequencyRange: "200 Hz - 2.0 kHz",
    description: "Các loài lưỡng cư sinh sống ở các khe suối, vũng nước rụng lá ẩm ướt. Tiếng kêu phát ra đặc trưng sau cơn mưa, là chỉ thị nhạy cảm cho độ ẩm sinh cảnh và thay đổi khí hậu tầng sát đất.",
    icon: "🐸"
  },
  {
    id: "insects",
    name: "Nhóm Côn trùng (Insects/Cicadas)",
    scientific: "Insecta",
    frequencyRange: "3.0 kHz - 12.0 kHz",
    description: "Bao gồm ve sầu (Cicadidae), dế và các loài côn trùng kêu cánh phát tần số cao liên tục, chỉ thị tình trạng nhiệt độ rừng mùa hè.",
    icon: "🦗"
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
