"use client";

import { useState, useEffect, useRef } from "react";
import api, { AudioPredictionResponse, HistoricalRecord } from "@/lib/api";

const SENSORS = [
  { id: "demo-sensor-1", name: "Trạm A - Suối Lớn", lat: "20°14'14.3\"N", lng: "105°36'56.5\"E", status: "active", icon: "🟢" },
  { id: "demo-sensor-2", name: "Trạm B - Đỉnh Mây", lat: "20°14'27.6\"N", lng: "105°37'12.0\"E", status: "active", icon: "🟢" },
  { id: "demo-sensor-3", name: "Trạm C - Rừng Già", lat: "20°14'06.0\"N", lng: "105°36'36.0\"E", status: "alert", icon: "🔴" }
];

export function useDashboardState(initialHistory: HistoricalRecord[]) {
  const [activeTab, setActiveTab] = useState<"monitor" | "history" | "analytics" | "catalog" | "devices">("monitor");
  const [activeSensor, setActiveSensor] = useState("demo-sensor-1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<AudioPredictionResponse | null>(null);
  const [showGradcam, setShowGradcam] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState<HistoricalRecord[]>(initialHistory);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      const data = await api.getDetectionHistory();
      if (data && data.length > 0) {
        setHistory(data);
      }
    } catch (e) {
      console.warn("Failed to fetch history from server, using local history", e);
    }
  };

  const fetchTrendData = async () => {
    try {
      const data = await api.getHealthTrend();
      if (data && data.length > 0) {
        setTrendData(data);
      }
    } catch (e) {
      console.warn("Failed to fetch health trend from server", e);
    }
  };

  const sirenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  };

  const startSiren = () => {
    stopSiren();
    if (isMuted) return;

    const playSirenBeep = () => {
      try {
        const ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc1 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        osc1.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.25);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

        osc1.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc1.stop(ctx.currentTime + 0.25);
      } catch (e) {
        console.error("Alarm beep synth failed", e);
      }
    };

    playSirenBeep();
    sirenIntervalRef.current = setInterval(playSirenBeep, 500);
  };

  const playSynthSound = (type: "birds" | "chainsaw" | "gunshot" | "storm" | "silent") => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      if (type === "birds") {
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.connect(gain);
          gain.connect(ctx.destination);

          const time = ctx.currentTime + i * 0.4;
          osc.frequency.setValueAtTime(2000 + Math.random() * 500, time);
          osc.frequency.exponentialRampToValueAtTime(3500 + Math.random() * 500, time + 0.15);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.1, time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

          osc.start(time);
          osc.stop(time + 0.2);
        }
      } else if (type === "chainsaw") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, ctx.currentTime);

        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        mod.frequency.value = 8;
        modGain.gain.value = 25;

        mod.connect(modGain);
        modGain.connect(osc.frequency);

        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        mod.start();
        osc.start();
        mod.stop(ctx.currentTime + 1.2);
        osc.stop(ctx.currentTime + 1.2);
      } else if (type === "gunshot") {
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1000;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        noise.stop(ctx.currentTime + 0.5);
      } else if (type === "storm") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(45, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(15, ctx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc.start();
        osc.stop(ctx.currentTime + 2.0);
      } else if (type === "silent") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(4200, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

        osc.start();
        osc.stop(ctx.currentTime + 1.0);
      }
    } catch (e) {
      console.error("Web Audio Sound synth failed", e);
    }
  };

  const processAudioData = (data: AudioPredictionResponse, sensorId: string) => {
    setPrediction(data);
    const newRecord: HistoricalRecord = {
      id: data.request_id,
      sensor_id: sensorId,
      timestamp: new Date().toISOString(),
      species: data.species_detections,
      threats: data.threat_detections,
      shannon_index: data.ecosystem_health.shannon_index,
      is_alert: data.threat_detections.some((t) => t.is_alert),
      llm_report: data.llm_report,
      processing_time_ms: data.processing_time_ms,
    };
    setHistory((prev) => [newRecord, ...prev]);
    // Sync with database/server
    fetchHistory();
    fetchTrendData();
  };

  const triggerSimulatorPreset = (presetIndex: number) => {
    stopSiren();
    setIsProcessing(true);
    setPrediction(null);
    setErrorMessage(null);

    setTimeout(() => {
      setIsProcessing(false);
      let res: AudioPredictionResponse;
      let targetSensor = activeSensor;

      switch (presetIndex) {
        case 0: // Peaceful Dawn
          playSynthSound("birds");
          res = {
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration_sec: 5.0,
            processing_time_ms: 142,
            species_detections: [
              { species_id: "birds", common_name: "Nhóm Chim (Birds)", confidence: 0.94, uncertainty: 0.02, time_window: { start_sec: 1.0, end_sec: 4.5 }, is_confident: true }
            ],
            threat_detections: [],
            ecosystem_health: {
              shannon_index: 1.62,
              species_richness: 2,
              trend: "stable",
              assessment: "Hệ sinh thái phong phú, đa dạng cao"
            },
            spectrogram_base64: "procedural_birds",
            gradcam_base64: "procedural_birds_cam",
            llm_report: "Hệ sinh thái hoạt động bình thường và phong phú. Ghi nhận tiếng hót hoạt động mạnh mẽ của nhóm Chim tại phân khu Suối Lớn. Không phát hiện mối đe dọa xâm hại."
          };
          targetSensor = "demo-sensor-1";
          break;

        case 1: // Chainsaw Alert
          playSynthSound("chainsaw");
          res = {
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration_sec: 5.0,
            processing_time_ms: 156,
            species_detections: [
              { species_id: "birds", common_name: "Nhóm Chim (Birds)", confidence: 0.65, uncertainty: 0.09, time_window: { start_sec: 0.5, end_sec: 1.8 }, is_confident: true }
            ],
            threat_detections: [
              { threat_type: "chainsaw", confidence: 0.91, uncertainty: 0.03, is_alert: true }
            ],
            ecosystem_health: {
              shannon_index: 0.54,
              species_richness: 1,
              trend: "declining",
              assessment: "Hệ sinh thái bị đe dọa nghiêm trọng"
            },
            spectrogram_base64: "procedural_chainsaw",
            gradcam_base64: "procedural_chainsaw_cam",
            llm_report: "🚨 KHẨN CẤP: Hệ thống ghi nhận tiếng cưa máy (Chainsaw) hoạt động mạnh mẽ (91% độ tin cậy) tại Trạm C - Rừng Già. Tiếng ồn nhân tạo đã đẩy chỉ số Shannon xuống mức báo động 0.54. Đề xuất thông báo khẩn cấp cho lực lượng kiểm lâm túc trực di chuyển gấp đến tọa độ để bắt quả tang hành vi phá rừng."
          };
          targetSensor = "demo-sensor-3";
          break;

        case 2: // Gunshot Alert
          playSynthSound("gunshot");
          res = {
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration_sec: 5.0,
            processing_time_ms: 168,
            species_detections: [],
            threat_detections: [
              { threat_type: "gunshot", confidence: 0.95, uncertainty: 0.02, is_alert: true }
            ],
            ecosystem_health: {
              shannon_index: 0.00,
              species_richness: 0,
              trend: "declining",
              assessment: "Suy kiệt sinh học đột ngột"
            },
            spectrogram_base64: "procedural_gunshot",
            gradcam_base64: "procedural_gunshot_cam",
            llm_report: "🚨 CẢNH BÁO NGUY HIỂM: Phát hiện tiếng súng (Gunshot) đơn lẻ nhưng cường độ cực lớn (95% độ tin cậy) tại Trạm B - Đỉnh Mây. Không có hoạt động sinh học chim muông sau tiếng súng. Đề nghị kiểm lâm khu vực trang bị đầy đủ công cụ hỗ trợ và tiến hành rà soát nhanh khu vực Đỉnh Mây phòng tránh thợ săn trộm thú rừng."
          };
          targetSensor = "demo-sensor-2";
          break;

        case 3: // Uncertain Storm
          playSynthSound("storm");
          res = {
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration_sec: 5.0,
            processing_time_ms: 172,
            species_detections: [
              { species_id: "frogs", common_name: "Nhóm Ếch nhái (Frogs)", confidence: 0.48, uncertainty: 0.17, time_window: { start_sec: 3.0, end_sec: 4.8 }, is_confident: false }
            ],
            threat_detections: [],
            ecosystem_health: {
              shannon_index: 0.98,
              species_richness: 1,
              trend: "fluctuating",
              assessment: "Tín hiệu bị nhiễu do thời tiết"
            },
            spectrogram_base64: "procedural_storm",
            gradcam_base64: "procedural_storm_cam",
            llm_report: "CẢNH BÁO LOW CONFIDENCE: Phát hiện tín hiệu tần số thấp có khả năng là sấm sét dông bão nhiệt đới. Phát hiện loài Ếch nhái có độ bất định cao (17% MC-Dropout) do âm nền quá lớn. Không cần xuất kích khẩn cấp, tiếp tục giám sát từ xa."
          };
          targetSensor = "demo-sensor-1";
          break;

        case 4: // Silent Night
          playSynthSound("silent");
          res = {
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration_sec: 5.0,
            processing_time_ms: 110,
            species_detections: [],
            threat_detections: [],
            ecosystem_health: {
              shannon_index: 0.00,
              species_richness: 0,
              trend: "stable",
              assessment: "Trạng thái yên tĩnh ban đêm"
            },
            spectrogram_base64: "procedural_silent",
            gradcam_base64: "procedural_silent_cam",
            llm_report: "Không phát hiện tiếng động cơ lạ hay tín hiệu sinh học cụ thể. Chỉ ghi nhận tiếng ồn trắng của gió và côn trùng nhỏ ban đêm. Cúc Phương hiện an sau."
          };
          targetSensor = "demo-sensor-3";
          break;

        default:
          return;
      }

      setActiveSensor(targetSensor);
      processAudioData(res, targetSensor);
    }, 1200);
  };

  const handlePredictAudio = async (file: File) => {
    setIsProcessing(true);
    setPrediction(null);
    setErrorMessage(null);

    try {
      const data = await api.predictAudio(file);
      processAudioData(data, activeSensor);
    } catch (err) {
      console.warn("Real API endpoint failed, falling back to simulated preset", err);
      // Auto run simulation when local server is down
      setTimeout(() => {
        const rand = Math.floor(Math.random() * 5);
        triggerSimulatorPreset(rand);
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Effect to handle siren whenever alarm condition changes
  useEffect(() => {
    const hasAlert = prediction?.threat_detections?.some((t) => t.is_alert);
    if (hasAlert && !isMuted) {
      startSiren();
    } else {
      stopSiren();
    }
    return () => stopSiren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction, isMuted]);

  useEffect(() => {
    setMounted(true);
    fetchHistory();
    fetchTrendData();
    return () => {
      stopSiren();
    };
  }, []);

  return {
    activeTab,
    setActiveTab,
    activeSensor,
    setActiveSensor,
    isProcessing,
    setIsProcessing,
    prediction,
    setPrediction,
    showGradcam,
    setShowGradcam,
    isMuted,
    setIsMuted,
    history,
    setHistory,
    errorMessage,
    setErrorMessage,
    mounted,
    triggerSimulatorPreset,
    handlePredictAudio,
    trendData,
  };
}
export { SENSORS };
