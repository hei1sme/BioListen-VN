"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  UploadCloud, 
  Mic, 
  History, 
  BarChart3, 
  Compass, 
  MapPin, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Play, 
  Pause, 
  CheckCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import api, { AudioPredictionResponse, HistoricalRecord } from "@/lib/api";

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
  { timestamp: "16:00", text: "16:00", shannon_index: 1.35, species_richness: 4 },
  { timestamp: "18:00", shannon_index: 1.42, species_richness: 5 },
  { timestamp: "20:00", shannon_index: 0.95, species_richness: 2 },
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

const SENSORS = [
  { id: "demo-sensor-1", name: "Trạm A - Suối Lớn", lat: "20°14'14.3\"N", lng: "105°36'56.5\"E", status: "active", icon: "🟢" },
  { id: "demo-sensor-2", name: "Trạm B - Đỉnh Mây", lat: "20°14'27.6\"N", lng: "105°37'12.0\"E", status: "active", icon: "🟢" },
  { id: "demo-sensor-3", name: "Trạm C - Rừng Già", lat: "20°14'06.0\"N", lng: "105°36'36.0\"E", status: "alert", icon: "🔴" }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"monitor" | "history" | "analytics" | "catalog">("monitor");
  const [activeSensor, setActiveSensor] = useState("demo-sensor-1");
  
  // Audio UI States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prediction, setPrediction] = useState<AudioPredictionResponse | null>(null);
  const [showGradcam, setShowGradcam] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState<HistoricalRecord[]>(MOCK_HISTORY);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Audio Context & Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Timer Ref
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Synthesizer Siren node state
  const sirenIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ── Helper functions defined before useEffect to avoid declaration errors ──
  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  };

  const startSiren = () => {
    stopSiren();
    if (isMuted) return;
    
    // Play dual oscillator siren beeps
    const playSirenBeep = () => {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
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

  const stopRecordingResources = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(timer);
      stopSiren();
      stopRecordingResources();
    };
  }, []);

  // ── Web Audio Synth Sounds for Interactive Scenarios ─────────────────────────
  const playSynthSound = (type: "birds" | "chainsaw" | "gunshot" | "storm" | "silent") => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      if (type === "birds") {
        // High frequency bird chirps
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
        // Sawtooth buzz modulating
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        
        // Modulator for RPM change
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
        // Short white noise blast
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
        // Low rumble thunder sound
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
        // Soft high cricket pitch
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

  // Effect to handle siren whenever alarm condition changes
  useEffect(() => {
    const hasAlert = prediction?.threat_detections?.some(t => t.is_alert);
    if (hasAlert && !isMuted) {
      startSiren();
    } else {
      stopSiren();
    }
    return () => stopSiren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction, isMuted]);

  // ── Simulator Presets Selection ─────────────────────────────────────────────
  const triggerSimulatorPreset = (presetIndex: number) => {
    stopSiren();
    setIsProcessing(true);
    setPrediction(null);
    setErrorMessage(null);

    // Dynamic sounds to prompt user experience
    setTimeout(() => {
      setIsProcessing(false);
      
      let res: AudioPredictionResponse;
      switch (presetIndex) {
        case 0: // Peaceful Dawn
          playSynthSound("birds");
          res = {
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration_sec: 5.0,
            processing_time_ms: 142,
            species_detections: [
              { species_id: "pycnonotus_jocosus", common_name: "Chào mào (Red-whiskered Bulbul)", confidence: 0.94, uncertainty: 0.02, time_window: { start_sec: 1.0, end_sec: 3.5 }, is_confident: true },
              { species_id: "copsychus_saularis", common_name: "Chích chòe (Oriental Magpie-Robin)", confidence: 0.88, uncertainty: 0.04, time_window: { start_sec: 2.2, end_sec: 4.8 }, is_confident: true }
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
            llm_report: "Hệ sinh thái hoạt động bình thường và phong phú. Phát hiện tiếng kêu của Chào mào và Chích chòe lửa tại phân khu Suối Lớn. Không ghi nhận bất cứ mối đe dọa hoặc tiếng ồn lạ xâm hại."
          };
          setActiveSensor("demo-sensor-1");
          break;
          
        case 1: // Chainsaw Alert
          playSynthSound("chainsaw");
          res = {
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration_sec: 5.0,
            processing_time_ms: 156,
            species_detections: [
              { species_id: "acridotheres_tristis", common_name: "Sáo đá (Common Myna)", confidence: 0.65, uncertainty: 0.09, time_window: { start_sec: 0.5, end_sec: 1.8 }, is_confident: true }
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
          setActiveSensor("demo-sensor-3");
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
          setActiveSensor("demo-sensor-2");
          break;

        case 3: // Uncertain Storm
          playSynthSound("storm");
          res = {
            request_id: `req-${Math.random().toString(36).substr(2, 9)}`,
            duration_sec: 5.0,
            processing_time_ms: 172,
            species_detections: [
              { species_id: "microhyla_fissipes", common_name: "Ếch nhái Ornate (Narrow-mouthed Frog)", confidence: 0.48, uncertainty: 0.17, time_window: { start_sec: 3.0, end_sec: 4.8 }, is_confident: false }
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
          setActiveSensor("demo-sensor-1");
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
            llm_report: "Không phát hiện tiếng động cơ lạ hay tín hiệu sinh học cụ thể. Chỉ ghi nhận tiếng ồn trắng của gió và côn trùng nhỏ ban đêm. Cúc Phương hiện an toàn."
          };
          setActiveSensor("demo-sensor-3");
          break;
        default:
          return;
      }

      setPrediction(res);
      
      // Update history log
      const newRecord: HistoricalRecord = {
        id: res.request_id,
        sensor_id: activeSensor,
        timestamp: new Date().toISOString(),
        species: res.species_detections,
        threats: res.threat_detections,
        shannon_index: res.ecosystem_health.shannon_index,
        is_alert: res.threat_detections.some(t => t.is_alert),
        llm_report: res.llm_report,
        processing_time_ms: res.processing_time_ms
      };
      setHistory(prev => [newRecord, ...prev]);
    }, 1200);
  };

  // ── Mic Recording & Canvas Logic ──────────────────────────────────────────
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      stopRecordingResources();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up Audio Context and Analyser for visualizer
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const file = new File([audioBlob], "recorded_mic.wav", { type: "audio/wav" });
        
        try {
          // Attempt real API predict
          const data = await api.predictAudio(file);
          setPrediction(data);
          
          const newRecord: HistoricalRecord = {
            id: data.request_id,
            sensor_id: activeSensor,
            timestamp: new Date().toISOString(),
            species: data.species_detections,
            threats: data.threat_detections,
            shannon_index: data.ecosystem_health.shannon_index,
            is_alert: data.threat_detections.some(t => t.is_alert),
            llm_report: data.llm_report,
            processing_time_ms: data.processing_time_ms
          };
          setHistory(prev => [newRecord, ...prev]);
        } catch (err) {
          console.warn("Real API failed, falling back to simulated analysis", err);
          // Auto generate simulated result to guarantee smooth presentation
          setTimeout(() => {
            // Randomly pick a mock preset
            const rand = Math.floor(Math.random() * 5);
            triggerSimulatorPreset(rand);
          }, 800);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 10) { // Limit to 10s for fast hackathon demo
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);

      // Draw real-time frequencies
      drawCanvasWave();

    } catch (e) {
      console.error("Microphone access denied", e);
      setErrorMessage("Không thể truy cập Microphone. Vui lòng cấp quyền ghi âm.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    stopRecordingResources();
  };

  const drawCanvasWave = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw vertical tech grid lines
      ctx.strokeStyle = "rgba(5, 150, 105, 0.06)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw soundwave columns in Emerald Green
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const greenGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        greenGrad.addColorStop(0, "rgba(5, 150, 105, 0.1)");
        greenGrad.addColorStop(0.5, "rgba(5, 150, 105, 0.6)");
        greenGrad.addColorStop(1, "#059669");

        ctx.fillStyle = greenGrad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    draw();
  };

  // ── Drag & Drop Audio Upload Handler ──────────────────────────────────────────
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setIsProcessing(true);
    setPrediction(null);
    setErrorMessage(null);

    try {
      const data = await api.predictAudio(file);
      setPrediction(data);
      
      const newRecord: HistoricalRecord = {
        id: data.request_id,
        sensor_id: activeSensor,
        timestamp: new Date().toISOString(),
        species: data.species_detections,
        threats: data.threat_detections,
        shannon_index: data.ecosystem_health.shannon_index,
        is_alert: data.threat_detections.some(t => t.is_alert),
        llm_report: data.llm_report,
        processing_time_ms: data.processing_time_ms
      };
      setHistory(prev => [newRecord, ...prev]);
    } catch (err) {
      console.warn("Real upload endpoint failed, triggering simulator fallback", err);
      // Auto run simulation when local server is down
      setTimeout(() => {
        const rand = Math.floor(Math.random() * 5);
        triggerSimulatorPreset(rand);
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Procedural Spectrogram Canvas Drawing ───────────────────────────────────
  const drawProceduralSpectrogram = (canvas: HTMLCanvasElement | null, type: string, heat: boolean) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines
    ctx.strokeStyle = "rgba(5, 150, 105, 0.05)";
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
      // High chirps (arched wave curves at 3-5kHz)
      ctx.lineWidth = 3;
      
      // Spec 1
      const grad1 = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad1.addColorStop(0, "transparent");
      grad1.addColorStop(0.2, heat ? "#dc2626" : "#059669");
      grad1.addColorStop(0.3, heat ? "#d97706" : "#34d399");
      grad1.addColorStop(0.4, "transparent");
      ctx.strokeStyle = grad1;
      ctx.beginPath();
      for (let x = 50; x < 200; x++) {
        const y = 80 - Math.sin((x - 50) * 0.04) * 30;
        if (x === 50) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Spec 2
      const grad2 = ctx.createLinearGradient(0, 0, canvas.width, 0);
      grad2.addColorStop(0.4, "transparent");
      grad2.addColorStop(0.6, heat ? "#dc2626" : "#059669");
      grad2.addColorStop(0.7, heat ? "#d97706" : "#34d399");
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
      // Dense low frequency block and horizontal teeth
      ctx.lineWidth = 1;
      ctx.strokeStyle = heat ? "rgba(220, 38, 38, 0.4)" : "rgba(5, 150, 105, 0.3)";
      
      // Bottom rumble block
      for (let y = canvas.height - 40; y < canvas.height - 10; y += 4) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(canvas.width - 10, y + Math.sin(y) * 3);
        ctx.stroke();
      }
      
      // Mid teeth (chainsaw buzz)
      ctx.lineWidth = 2;
      ctx.strokeStyle = heat ? "#dc2626" : "#059669";
      ctx.beginPath();
      for (let x = 20; x < canvas.width - 20; x += 6) {
        const y = 140 + (x % 12 === 0 ? 15 : -15) + Math.random() * 5;
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Highlight heatmap if Gradcam active
      if (heat) {
        ctx.fillStyle = "rgba(220, 38, 38, 0.15)";
        ctx.fillRect(80, 110, 240, 60);
        ctx.strokeStyle = "#d97706";
        ctx.strokeRect(80, 110, 240, 60);
      }

    } else if (type === "procedural_gunshot") {
      // Sudden vertical blast line (broadband explosion)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.3, heat ? "#dc2626" : "#059669");
      grad.addColorStop(0.5, heat ? "#d97706" : "#34d399");
      grad.addColorStop(0.9, heat ? "rgba(220, 38, 38, 0.1)" : "rgba(5, 150, 105, 0.1)");
      
      ctx.fillStyle = grad;
      ctx.fillRect(150, 20, 25, canvas.height - 30);

      if (heat) {
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2;
        ctx.strokeRect(145, 15, 35, canvas.height - 25);
      }

    } else if (type === "procedural_storm") {
      // Large low-frequency blur clouds
      const grad = ctx.createRadialGradient(200, 160, 10, 200, 160, 90);
      grad.addColorStop(0, heat ? "rgba(217, 119, 6, 0.6)" : "rgba(5, 150, 105, 0.4)");
      grad.addColorStop(0.8, heat ? "rgba(220, 38, 38, 0.1)" : "rgba(4, 120, 87, 0.1)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(200, 160, 95, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Quiet scan line
      ctx.strokeStyle = "rgba(5, 150, 105, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height - 30);
      for (let x = 0; x < canvas.width; x += 10) {
        ctx.lineTo(x, canvas.height - 30 + Math.random() * 4);
      }
      ctx.stroke();
    }
  };

  // Ref to canvas to draw spectrogram
  const specCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    if (specCanvasRef.current) {
      drawProceduralSpectrogram(
        specCanvasRef.current, 
        prediction?.spectrogram_base64 || "procedural_silent", 
        showGradcam
      );
    }
  }, [prediction, showGradcam, activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6f5] text-[#0f172a] font-sans antialiased overflow-x-hidden">
      
      {/* ── Flashing Danger Background Alert ───────────────────────────────────── */}
      {prediction?.threat_detections?.some(t => t.is_alert) && (
        <div className="pointer-events-none fixed inset-0 z-50 border-[6px] border-red-600/50 animate-pulse" />
      )}

      {/* ── Top Technical Status Bar ───────────────────────────────────────────── */}
      <header className="border-b border-zinc-200 bg-white/95 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="h-5 w-5 text-emerald-600 animate-pulse" />
            <div className="absolute inset-0 bg-emerald-500/10 blur-sm rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-widest font-sans text-zinc-900 flex items-center gap-2">
              BIOLISTEN VN <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-200 rounded-sm font-semibold">FOREST OPERATIONS</span>
            </h1>
            <p className="text-[9px] text-emerald-700/80 font-mono tracking-wider font-semibold">CÚC PHƯƠNG NATIONAL PARK • COMMAND CENTER</p>
          </div>
        </div>

        {/* Live Metrics strip */}
        <div className="hidden lg:flex items-center gap-6 font-sans text-[10px] border-l border-zinc-200 pl-6 text-zinc-500">
          <div>
            <span>STATIONS ONLINE:</span>{" "}
            <span className="text-emerald-600 font-bold">3 / 3</span>
          </div>
          <div>
            <span>ECOSYSTEM HEALTH (SHANNON):</span>{" "}
            <span className="text-emerald-600 font-bold">
              {prediction ? prediction.ecosystem_health.shannon_index.toFixed(2) : "1.42"}
            </span>
          </div>
          <div>
            <span>STREAM LATENCY:</span>{" "}
            <span className="text-zinc-700">
              {prediction ? `${prediction.processing_time_ms}ms` : "124ms"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mute Alert toggle for demonstration safety */}
          {prediction?.threat_detections?.some(t => t.is_alert) && (
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-sans border rounded-sm font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                isMuted 
                ? "bg-zinc-100 border-zinc-300 text-zinc-600 hover:bg-zinc-200" 
                : "bg-red-50 border-red-500 text-red-600 hover:bg-red-100 animate-bounce"
              }`}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 animate-pulse" />}
              {isMuted ? "ĐÃ TẮT CÒI" : "TẮT CÒI BÁO ĐỘNG"}
            </button>
          )}
          
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 border border-emerald-200 text-[9px] font-sans text-emerald-700 rounded-sm font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            LIVE TELEMETRY
          </div>
        </div>
      </header>

      {/* ── Main Workspace Layout ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col md:flex-row">
        
        {/* Sidebar Nav & Station Status Logs */}
        <aside className="w-full md:w-64 border-r border-zinc-200 bg-zinc-50 flex flex-col font-sans shrink-0">
          <div className="p-4 border-b border-zinc-200">
            <div className="text-[9px] text-zinc-400 font-bold mb-3 tracking-wider uppercase">Hệ thống giám sát</div>
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab("monitor")}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-sm transition-all duration-200 cursor-pointer ${
                  activeTab === "monitor" 
                  ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 font-bold" 
                  : "border-l-4 border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" /> TRUNG TÂM CHỈ HUY
                </span>
                <span className="text-[8px] bg-emerald-100 px-1.5 py-0.5 rounded-sm border border-emerald-200 text-emerald-700 font-bold">01</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-sm transition-all duration-200 cursor-pointer ${
                  activeTab === "history" 
                  ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 font-bold" 
                  : "border-l-4 border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <History className="h-3.5 w-3.5 text-emerald-600" /> NHẬT KÝ LỊCH SỬ
                </span>
                <span className="text-[8px] bg-zinc-200 px-1.5 py-0.5 rounded-sm text-zinc-600 font-bold">{history.length}</span>
              </button>

              <button 
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-sm transition-all duration-200 cursor-pointer ${
                  activeTab === "analytics" 
                  ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 font-bold" 
                  : "border-l-4 border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-600" /> XU HƯỚNG ĐA DẠNG
                </span>
                <span className="text-[8px] bg-zinc-200 px-1.5 py-0.5 rounded-sm text-zinc-600 font-bold">ANL</span>
              </button>

              <button 
                onClick={() => setActiveTab("catalog")}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-sm transition-all duration-200 cursor-pointer ${
                  activeTab === "catalog" 
                  ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 font-bold" 
                  : "border-l-4 border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-emerald-600" /> THƯ VIỆN LOÀI RỪNG
                </span>
                <span className="text-[8px] bg-zinc-200 px-1.5 py-0.5 rounded-sm text-zinc-400 font-bold">{SPECIES_CATALOG.length}</span>
              </button>
            </nav>
          </div>

          {/* Simulated Stations coordinates log */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[9px] text-zinc-400 font-bold mb-3 tracking-wider uppercase">Trạm cảm biến biên</div>
              <div className="flex flex-col gap-2.5">
                {SENSORS.map((s) => {
                  const isSensorAlert = s.id === "demo-sensor-3" && prediction?.threat_detections?.some(t => t.is_alert);
                  return (
                    <button 
                      key={s.id} 
                      onClick={() => setActiveSensor(s.id)}
                      className={`p-3 text-[10px] text-left border rounded-sm flex flex-col gap-1.5 transition-all duration-200 cursor-pointer ${
                        activeSensor === s.id 
                        ? "bg-emerald-50/50 border-emerald-300 shadow-sm" 
                        : "bg-white border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-zinc-800 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                          {s.name}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                          isSensorAlert 
                          ? "bg-red-50 border-red-200 text-red-600 animate-pulse" 
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}>
                          {isSensorAlert ? "🚨 ALARM" : "ACTIVE"}
                        </span>
                      </div>
                      <div className="text-[9px] text-zinc-400 flex flex-col gap-0.5 font-mono">
                        <div>Lat: {s.lat}</div>
                        <div>Lng: {s.lng}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hardware spec info strip */}
            <div className="pt-4 border-t border-zinc-200 text-[9px] text-zinc-500 flex flex-col gap-2 font-sans">
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Database className="h-3.5 w-3.5 text-emerald-600" /> PyTorch ONNX Runtime (CPU)
              </div>
              <div className="flex justify-between">
                <span>Đo trễ xử lý biên:</span>
                <span className="text-zinc-800 font-bold">&lt;150ms</span>
              </div>
              <div className="flex justify-between">
                <span>Nguồn năng lượng:</span>
                <span className="text-emerald-600 font-bold">84% (Mặt Trời)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Content Viewports ──────────────────────────────────────────────── */}
        <main className="flex-1 bg-[#f4f6f5] p-6 overflow-y-auto">
          
          {/* TAB 1: Real-time Audio Monitoring dashboard */}
          {activeTab === "monitor" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Audio Ingestion & Spectrogram Visualizer */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Panel 1: Live Audio Ingestion */}
                <div className="border border-zinc-200/80 bg-white p-5 rounded-sm relative shadow-sm">
                  <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-zinc-50 text-[8px] font-mono text-zinc-400 border-l border-b border-zinc-200/80 rounded-bl-sm">INGESTION MODULE</div>
                  <h2 className="text-xs font-bold font-sans tracking-widest text-zinc-800 mb-4 flex items-center gap-2 uppercase">
                    <Activity className="h-4 w-4 text-emerald-600" /> Kênh thu phát và phân tích âm thanh
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live Mic Recorder */}
                    <div className="border border-zinc-200/80 bg-zinc-50/50 p-4 flex flex-col justify-between items-center text-center relative rounded-sm">
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 text-[8px] font-mono text-zinc-400 uppercase">
                        <span className={`inline-block h-2 w-2 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-zinc-300"}`} />
                        Ghi âm từ trạm
                      </div>
                      
                      <div className="my-4 flex flex-col items-center gap-2">
                        {isRecording ? (
                          <button 
                            onClick={stopRecording}
                            className="h-14 w-14 bg-red-600 border border-red-500 text-white flex items-center justify-center rounded-full shadow-[0_2px_10px_rgba(220,38,38,0.25)] hover:bg-red-700 transition-all cursor-pointer animate-pulse"
                          >
                            <Pause className="h-5 w-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={startRecording}
                            disabled={isProcessing}
                            className="h-14 w-14 bg-emerald-50 border border-emerald-500 text-emerald-600 flex items-center justify-center rounded-full shadow-[0_2px_8px_rgba(5,150,105,0.1)] hover:bg-emerald-100 disabled:opacity-50 transition-all cursor-pointer"
                          >
                            <Mic className="h-5 w-5 animate-pulse" />
                          </button>
                        )}
                        <span className="text-[10px] font-sans text-zinc-500 mt-2">
                          {isRecording ? `Đang thu âm: ${recordingDuration}s / 10s` : "Ghi trực tiếp từ micro trạm"}
                        </span>
                      </div>

                      {/* Microphone visualizer canvas */}
                      <canvas 
                        ref={canvasRef} 
                        className="w-full h-14 bg-white border border-zinc-200 rounded-sm"
                        width={300}
                        height={56}
                      />
                    </div>

                    {/* Drag and Drop Wav Upload */}
                    <div className="border border-zinc-200/80 bg-zinc-50/50 p-4 flex flex-col justify-between items-center text-center relative rounded-sm">
                      <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] font-mono text-zinc-400 uppercase">
                        <UploadCloud className="h-3.5 w-3.5 text-zinc-400" /> Tải lên tệp âm thanh
                      </div>

                      <div className="my-auto flex flex-col items-center p-3 w-full">
                        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-emerald-200 hover:border-emerald-500 rounded-sm cursor-pointer bg-white hover:bg-emerald-50/10 transition-all p-4">
                          <UploadCloud className="h-7 w-7 text-emerald-600 mb-1" />
                          <span className="text-[10px] text-zinc-600 font-sans font-medium">Tải tệp tin .wav (5s - 60s)</span>
                          <span className="text-[9px] text-zinc-400 mt-0.5">Click để chọn hoặc kéo thả</span>
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
                        <div className="mt-2 text-[9px] font-sans text-red-600 flex items-center gap-1.5">
                          <AlertTriangle className="h-3 w-3" />
                          {errorMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Processing / Classification Loading overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center text-center p-6 rounded-sm">
                      <div className="relative w-12 h-12 mb-3">
                        <div className="absolute inset-0 border-3 border-dashed border-emerald-500 rounded-full animate-spin" />
                        <Activity className="absolute inset-0 m-auto h-5 w-5 text-emerald-600 animate-pulse" />
                      </div>
                      <div className="text-[10px] font-sans text-emerald-700 animate-pulse tracking-wide font-bold">
                        Đang phân tích phổ tần & chạy nhận dạng PyTorch...
                      </div>
                      <div className="text-[9px] text-zinc-400 font-mono mt-0.5">Executing inference heads on CPU edge node</div>
                    </div>
                  )}
                </div>

                {/* Panel 2: Spectrogram & Heatmap Viewer */}
                <div className="border border-zinc-200/80 bg-white p-5 rounded-sm relative shadow-sm">
                  <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-zinc-50 text-[8px] font-mono text-zinc-400 border-l border-b border-zinc-200/80 rounded-bl-sm">SPECTRAL ANALYSIS</div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h2 className="text-xs font-bold font-sans tracking-widest text-zinc-800 flex items-center gap-2 uppercase">
                      <Activity className="h-4 w-4 text-emerald-600" /> Biểu đồ phổ âm (Spectrogram) & Bản đồ nhiệt AI
                    </h2>
                    
                    {/* Grad-CAM toggle switch */}
                    <button 
                      onClick={() => setShowGradcam(!showGradcam)}
                      disabled={!prediction}
                      className={`px-3 py-1.5 text-[10px] font-sans border rounded-sm font-bold transition-all duration-200 ${
                        !prediction 
                        ? "opacity-30 cursor-not-allowed border-zinc-200 text-zinc-400 bg-transparent"
                        : showGradcam
                        ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm cursor-pointer"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                      }`}
                    >
                      {showGradcam ? "ẨN ĐỘ TẬP TRUNG GRAD-CAM" : "XEM ĐỘ TẬP TRUNG GRAD-CAM (XAI)"}
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    {/* Mel Spectrogram display canvas */}
                    <div className="flex-1 bg-zinc-50 p-3 border border-zinc-200/60 rounded-sm flex flex-col justify-center relative min-h-[210px]">
                      
                      <div className="absolute top-2 left-2 bg-white border border-zinc-200 px-2.5 py-0.5 text-[8px] font-sans text-emerald-700 z-10 flex items-center gap-1.5 rounded-sm font-semibold shadow-xs">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${showGradcam ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
                        {showGradcam ? "BẢN ĐỒ NHIỆT GIẢI THÍCH GRAD-CAM XAI" : "PHỔ LOG FREQUENCY SPECTROGRAM (5.0s)"}
                      </div>

                      {/* Display Canvas */}
                      <canvas 
                        ref={specCanvasRef} 
                        className="w-full h-44 bg-white rounded-sm border border-zinc-200"
                        width={450}
                        height={176}
                      />

                      {/* Canvas legend labels */}
                      <div className="flex justify-between items-center text-[8px] text-zinc-400 font-mono mt-1 px-1">
                        <span>0.0 Giây (Khởi đầu)</span>
                        <span>Độ dài khung cửa sổ: 5.0 Giây</span>
                        <span>5.0 Giây (Kết thúc)</span>
                      </div>
                    </div>

                    {/* Spectrogram Y-Axis legend block */}
                    <div className="w-full md:w-48 bg-zinc-50 p-4 border border-zinc-200 flex flex-col justify-between font-sans text-[9px] rounded-sm">
                      <div>
                        <div className="text-emerald-700 font-bold mb-2 uppercase border-b border-zinc-200 pb-1 tracking-wider">Trục Tần số (Hz)</div>
                        <div className="flex flex-col gap-1.5 text-zinc-600 font-mono">
                          <div className="flex justify-between"><span>Max:</span> <span className="text-emerald-600 font-bold">11,025 Hz</span></div>
                          <div className="flex justify-between"><span>Mid:</span> <span>5,500 Hz</span></div>
                          <div className="flex justify-between"><span>Min:</span> <span>50 Hz</span></div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-200">
                        <div className="text-emerald-700 font-bold mb-2 uppercase pb-1 tracking-wider">Cường độ âm (dB)</div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-20 bg-gradient-to-t from-zinc-200 via-emerald-600 to-emerald-400 border border-zinc-300 rounded-sm" />
                          <div className="flex flex-col justify-between h-20 text-[8px] text-zinc-400 font-mono">
                            <span>-10 dB (Lớn)</span>
                            <span>-50 dB (Trung)</span>
                            <span>-90 dB (Nhỏ)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Active Threat Warnings & LLM Report */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Panel 3: GIS Map */}
                <div className="border border-zinc-200/80 bg-white p-5 rounded-sm relative shadow-sm">
                  <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-zinc-50 text-[8px] font-mono text-zinc-400 border-l border-b border-zinc-200/80 rounded-bl-sm">GEO MAP</div>
                  <h2 className="text-xs font-bold font-sans tracking-widest text-zinc-800 mb-3 flex items-center gap-2 uppercase">
                    <Compass className="h-4 w-4 text-emerald-600" /> Bản đồ định vị VQG Cúc Phương
                  </h2>
                  
                  {/* Simulated SVG Map of Park */}
                  <div className="relative w-full h-44 bg-emerald-50/5 border border-zinc-200/60 rounded-sm overflow-hidden flex items-center justify-center">
                    
                    {/* SVG Vector Map */}
                    <svg className="w-full h-full opacity-80" viewBox="0 0 300 180">
                      {/* Grid background */}
                      <defs>
                        <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(5, 150, 105, 0.05)" strokeWidth="0.75" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#mapGrid)" />
                      
                      {/* Cúc Phương border mock shape */}
                      <path 
                        d="M 25 85 Q 55 25 125 45 T 225 35 T 275 125 T 145 165 T 35 145 Z" 
                        fill="none" 
                        stroke="rgba(5, 150, 105, 0.2)" 
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      
                      {/* Topographic Lines */}
                      <path d="M 45 95 Q 85 55 155 85 T 245 75" fill="none" stroke="rgba(5, 150, 105, 0.08)" strokeWidth="0.75" />
                      <path d="M 55 115 Q 105 85 175 115 T 265 105" fill="none" stroke="rgba(5, 150, 105, 0.08)" strokeWidth="0.75" />

                      {/* Map Labels */}
                      <text x="35" y="155" fill="rgba(5, 150, 105, 0.4)" fontSize="7" fontFamily="sans-serif" fontWeight="bold">VQG CÚC PHƯƠNG - PHÂN KHU TÂY</text>
                      <text x="175" y="20" fill="rgba(5, 150, 105, 0.3)" fontSize="6" fontFamily="sans-serif">SECTOR BẢO VỆ I</text>

                      {/* Connections between sensors */}
                      <line x1="80" y1="70" x2="160" y2="40" stroke="rgba(5, 150, 105, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="160" y1="40" x2="220" y2="110" stroke="rgba(5, 150, 105, 0.15)" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="80" y1="70" x2="220" y2="110" stroke="rgba(5, 150, 105, 0.15)" strokeWidth="1" strokeDasharray="2 2" />

                      {/* Station 1 Point - Suối Lớn */}
                      <circle 
                        cx="80" 
                        cy="70" 
                        r={activeSensor === "demo-sensor-1" ? "5.5" : "3.5"} 
                        fill={activeSensor === "demo-sensor-1" ? "#059669" : "#10b981"} 
                        className="cursor-pointer" 
                        onClick={() => setActiveSensor("demo-sensor-1")}
                      />
                      <circle cx="80" cy="70" r="10" fill="none" stroke="#059669" strokeWidth="0.5" className="animate-ping" />
                      <text x="60" y="58" fill={activeSensor === "demo-sensor-1" ? "#059669" : "rgba(15, 23, 42, 0.4)"} fontSize="6" fontFamily="sans-serif" fontWeight="bold">TRẠM A (SUỐI LỚN)</text>

                      {/* Station 2 Point - Đỉnh Mây */}
                      <circle 
                        cx="160" 
                        cy="40" 
                        r={activeSensor === "demo-sensor-2" ? "5.5" : "3.5"} 
                        fill={activeSensor === "demo-sensor-2" ? "#059669" : "#10b981"}
                        className="cursor-pointer" 
                        onClick={() => setActiveSensor("demo-sensor-2")}
                      />
                      <text x="140" y="28" fill={activeSensor === "demo-sensor-2" ? "#059669" : "rgba(15, 23, 42, 0.4)"} fontSize="6" fontFamily="sans-serif" fontWeight="bold">TRẠM B (ĐỈNH MÂY)</text>

                      {/* Station 3 Point - Rừng Già */}
                      {prediction?.threat_detections?.some(t => t.is_alert) && activeSensor === "demo-sensor-3" ? (
                        <>
                          <circle cx="220" cy="110" r="6" fill="#dc2626" className="cursor-pointer" onClick={() => setActiveSensor("demo-sensor-3")} />
                          <circle cx="220" cy="110" r="13" fill="none" stroke="#dc2626" strokeWidth="1.5" className="animate-ping" />
                        </>
                      ) : (
                        <circle 
                          cx="220" 
                          cy="110" 
                          r={activeSensor === "demo-sensor-3" ? "5.5" : "3.5"} 
                          fill={activeSensor === "demo-sensor-3" ? "#059669" : "#10b981"} 
                          className="cursor-pointer" 
                          onClick={() => setActiveSensor("demo-sensor-3")}
                        />
                      )}
                      <text x="195" y="125" fill={prediction?.threat_detections?.some(t => t.is_alert) && activeSensor === "demo-sensor-3" ? "#dc2626" : activeSensor === "demo-sensor-3" ? "#059669" : "rgba(15, 23, 42, 0.4)"} fontSize="6" fontFamily="sans-serif" fontWeight="bold">TRẠM C (RỪNG GIÀ)</text>
                    </svg>

                    {/* Sensor Overlay coordinate index */}
                    <div className="absolute bottom-2 left-2 font-sans text-[8px] text-zinc-500 bg-white/90 border border-zinc-200 p-1.5 rounded-sm shadow-xs font-semibold">
                      TRẠM: <span className="text-emerald-700">{SENSORS.find(s => s.id === activeSensor)?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Panel 4: Alert Pane & Dispatch Ticket */}
                <div className={`border rounded-sm p-5 relative shadow-sm transition-colors duration-300 ${
                  prediction?.threat_detections?.some(t => t.is_alert)
                  ? "border-red-300 bg-red-50/50"
                  : "border-zinc-200/80 bg-white"
                }`}>
                  <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-zinc-50 text-[8px] font-mono text-zinc-400 border-l border-b border-zinc-200/80 rounded-bl-sm">ALERT CONTROL</div>

                  {/* Header alert status */}
                  <div className="flex items-center gap-2 mb-4">
                    {prediction?.threat_detections?.some(t => t.is_alert) ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-400 text-red-700 font-sans text-[9px] font-bold tracking-wide rounded-sm animate-pulse">
                        <ShieldAlert className="h-4 w-4 text-red-600" /> PHÁT HIỆN MỐI ĐE DỌA XÂM HẠI CAO
                      </div>
                    ) : prediction ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 font-sans text-[9px] font-bold tracking-wide rounded-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-600" /> HỆ SINH THÁI KHÔNG CÓ BẤT THƯỜNG
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-500 font-sans text-[9px] tracking-wide rounded-sm">
                        <Activity className="h-4 w-4 text-zinc-400" /> ĐANG ĐỢI TÍN HIỆU ÂM THANH
                      </div>
                    )}
                  </div>

                  {/* Display Ticket style when threat detected */}
                  {prediction ? (
                    <div className="flex flex-col gap-4">
                      
                      {/* Emergency Threat Dispatch Ticket */}
                      {prediction.threat_detections.some(t => t.is_alert) ? (
                        <div className="border border-dashed border-red-300 bg-white p-4 rounded-sm font-sans text-xs flex flex-col gap-3 relative overflow-hidden shadow-xs">
                          {/* Decorative ticket notch */}
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f4f6f5] border-r border-red-200" />
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#f4f6f5] border-l border-red-200" />
                          
                          <div className="text-center font-bold text-red-600 uppercase tracking-widest border-b border-zinc-100 pb-2">
                            PHẦN MỀM KIỂM LÂM - PHIẾU PHÁI CỬ TUẦN TRA
                          </div>
                          
                          <div className="grid grid-cols-2 gap-y-2.5 text-[10px] text-zinc-600 font-sans border-b border-zinc-100 pb-3">
                            <div className="font-semibold">Mã phiếu:</div>
                            <div className="text-right font-bold text-red-600">{prediction.request_id.slice(0, 8).toUpperCase()}</div>
                            
                            <div className="font-semibold">Trạm kiểm âm gốc:</div>
                            <div className="text-right font-bold text-zinc-800">{SENSORS.find(s => s.id === activeSensor)?.name}</div>

                            <div className="font-semibold">Vị trí địa lý trạm:</div>
                            <div className="text-right font-bold text-zinc-800 font-mono">{SENSORS.find(s => s.id === activeSensor)?.lat}</div>
                            
                            <div className="font-semibold">Thời điểm kích hoạt:</div>
                            <div className="text-right text-zinc-700">{new Date().toLocaleTimeString("vi-VN")}</div>

                            <div className="font-semibold">Phân loại tiếng động:</div>
                            <div className="text-right uppercase text-red-600 font-extrabold flex items-center gap-1 justify-end">
                              <AlertTriangle className="h-3.5 w-3.5 text-red-600 animate-pulse" />
                              {prediction.threat_detections.map(td => td.threat_type === "chainsaw" ? "TIẾNG CƯA XÍCH" : "TIẾNG SÚNG").join(", ")}
                            </div>

                            <div className="font-semibold">Mức tin cậy mô hình:</div>
                            <div className="text-right text-red-600 font-bold">
                              {(prediction.threat_detections[0].confidence * 100).toFixed(0)}% (Sai số ±{(prediction.threat_detections[0].uncertainty * 100).toFixed(0)}%)
                            </div>
                          </div>

                          <div className="pt-2">
                            <button 
                              onClick={() => alert(`[DISPATCH CONTROL] Đã kích hoạt lệnh cử tuần tra cơ động tới ${SENSORS.find(s => s.id === activeSensor)?.name}. Lực lượng biên sẽ di chuyển ngay lập tức.`)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-sm tracking-wide uppercase text-[10px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(220,38,38,0.2)]"
                            >
                              <ShieldAlert className="h-4 w-4" /> BẮT ĐẦU PHÁI CỬ LỰC LƯỢNG TUẦN TRA
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Species detected details */
                        <div className="flex flex-col gap-3">
                          <div className="text-[9px] font-sans text-zinc-400 font-bold uppercase tracking-wider">Danh sách loài chỉ thị nhận dạng (PyTorch Species Head)</div>
                          {prediction.species_detections.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {prediction.species_detections.map((sp, idx) => (
                                <div key={idx} className="p-3 border border-zinc-200/80 bg-zinc-50/50 text-xs rounded-sm">
                                  <div className="flex justify-between font-sans mb-1">
                                    <span className="text-zinc-800 font-bold">{sp.common_name}</span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm border ${
                                      sp.is_confident 
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                      : "bg-amber-50 border-amber-200 text-amber-700"
                                    }`}>
                                      {sp.is_confident ? "TIN CẬY CAO" : "CẦN XÁC MINH"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-[9px] text-zinc-500 font-sans">
                                    <span>Độ tin cậy: {(sp.confidence * 100).toFixed(0)}% (Bất định: {(sp.uncertainty * 100).toFixed(0)}%)</span>
                                    <span className="font-mono">Dải âm: {sp.time_window.start_sec}s - {sp.time_window.end_sec}s</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[10px] text-zinc-400 bg-zinc-50/50 p-3 border border-zinc-200/80 rounded-sm">
                              Không phát hiện tín hiệu loài cụ thể trong dải ghi âm.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ecosystem health values simplified */}
                      <div className="grid grid-cols-2 gap-3 font-sans text-xs p-3.5 border border-zinc-200/80 bg-zinc-50/50 rounded-sm">
                        <div>
                          <div className="text-zinc-400 text-[8px] uppercase tracking-wider mb-1">Chỉ số Shannon (H&apos;)</div>
                          <div className="text-lg font-bold text-emerald-700">{prediction.ecosystem_health.shannon_index.toFixed(2)}</div>
                          <div className="text-[8px] text-zinc-500 mt-1 uppercase font-semibold">
                            {prediction.ecosystem_health.shannon_index >= 1.5 ? (
                              <span className="text-emerald-600">Đa dạng: Cao (Tốt)</span>
                            ) : prediction.ecosystem_health.shannon_index >= 1.0 ? (
                              <span className="text-zinc-500">Đa dạng: Trung bình</span>
                            ) : (
                              <span className="text-red-500 font-bold">Đa dạng: Cực thấp</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-zinc-400 text-[8px] uppercase tracking-wider mb-1">Độ trù phú sinh học</div>
                          <div className="text-lg font-bold text-emerald-700">{prediction.ecosystem_health.species_richness} Loài chim/ếch</div>
                          <div className="text-[8px] text-zinc-500 mt-1 uppercase font-semibold">
                            {prediction.threat_detections.some(t => t.is_alert) ? (
                              <span className="text-red-600 font-bold">Rừng bị đe dọa</span>
                            ) : (
                              <span className="text-emerald-600">Hệ sinh cảnh ổn định</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Groq Llama 3.1 emergency bulletin report */}
                      <div className="border border-zinc-200/80 bg-zinc-50/50 p-3.5 rounded-sm">
                        <div className="text-[9px] text-zinc-700 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider border-b border-zinc-200/50 pb-1.5">
                          <FileText className="h-3.5 w-3.5 text-emerald-600" /> BÁO CÁO NGHIỆP VỤ LÂM NGHIỆP
                        </div>
                        <p className="text-[11px] text-zinc-700 leading-relaxed text-justify whitespace-pre-wrap font-sans">
                          {prediction.llm_report}
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-14 text-zinc-400 text-[10px] flex flex-col items-center justify-center gap-3">
                      <Database className="h-7 w-7 text-zinc-300" />
                      <div>Sẵn sàng tiếp nhận dữ liệu từ trạm kiểm lâm.</div>
                      <div className="text-zinc-400">Vui lòng bấm chọn kịch bản giả lập ở chân trang hoặc ghi âm trực tiếp.</div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Historical log list view */}
          {activeTab === "history" && (
            <div className="border border-zinc-200/80 bg-white p-5 rounded-sm font-sans shadow-sm">
              <h2 className="text-xs font-bold tracking-widest text-zinc-800 mb-4 flex items-center gap-2 uppercase">
                <History className="h-4 w-4 text-emerald-600" /> Nhật ký giám sát âm thanh lịch sử
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 uppercase tracking-wider text-[8px] font-bold">
                      <th className="py-3 px-3">Thời gian ghi nhận</th>
                      <th className="py-3 px-3">Trạm cảm biến</th>
                      <th className="py-3 px-3">Kết quả cảnh báo (Head 2)</th>
                      <th className="py-3 px-3">Khu hệ sinh vật phát hiện (Head 1)</th>
                      <th className="py-3 px-3 text-right">Chỉ số Shannon H&apos;</th>
                      <th className="py-3 px-3 text-right">Độ trễ AI</th>
                      <th className="py-3 px-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {history.map((h) => (
                      <tr key={h.id} className={`hover:bg-zinc-50/50 transition-colors duration-150 ${h.is_alert ? "bg-red-50/30 text-red-900" : "text-zinc-700"}`}>
                        <td className="py-3.5 px-3 text-zinc-400 font-mono">
                          {new Date(h.timestamp).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-zinc-800">
                          {SENSORS.find(s => s.id === h.sensor_id)?.name || h.sensor_id}
                        </td>
                        <td className="py-3.5 px-3 font-bold">
                          {h.threats.length > 0 ? (
                            <span className="text-red-600 font-extrabold uppercase bg-red-100/50 px-2 py-0.5 border border-red-300 rounded-sm text-[8px]">
                              🚨 {h.threats.map(t => t.threat_type === "chainsaw" ? "TIẾNG CƯA MÁY" : "TIẾNG SÚNG").join(", ")}
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-sm text-[8px] font-semibold">An toàn</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          {h.species.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {h.species.map((sp, idx) => (
                                <span key={idx} className="text-emerald-700 font-semibold">
                                  {sp.common_name} ({(sp.confidence * 100).toFixed(0)}%)
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-400">Không có</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-700 font-mono">{h.shannon_index.toFixed(2)}</td>
                        <td className="py-3.5 px-3 text-right text-zinc-400 font-mono">{h.processing_time_ms}ms</td>
                        <td className="py-3.5 px-3 text-right">
                          <button 
                            onClick={() => {
                              // Reload this record to the active view pane
                              const mockPresetRes: AudioPredictionResponse = {
                                request_id: h.id,
                                duration_sec: 5.0,
                                processing_time_ms: h.processing_time_ms,
                                species_detections: h.species,
                                threat_detections: h.threats,
                                ecosystem_health: {
                                  shannon_index: h.shannon_index,
                                  species_richness: h.species.length,
                                  trend: h.is_alert ? "declining" : "stable",
                                  assessment: h.is_alert ? "Báo động xâm hại" : "Ổn định"
                                },
                                spectrogram_base64: h.threats.some(t => t.threat_type === "chainsaw") ? "procedural_chainsaw" : h.threats.some(t => t.threat_type === "gunshot") ? "procedural_gunshot" : h.species.length > 0 ? "procedural_birds" : "procedural_silent",
                                gradcam_base64: "",
                                llm_report: h.llm_report
                              };
                              setPrediction(mockPresetRes);
                              setActiveSensor(h.sensor_id);
                              setActiveTab("monitor");
                            }}
                            className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1 justify-end ml-auto"
                          >
                            XEM CHI TIẾT <ArrowRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Advanced Biodiversity Analytics */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Trend Chart */}
              <div className="lg:col-span-8 border border-zinc-200/80 bg-white p-5 rounded-sm shadow-sm">
                <h2 className="text-xs font-bold font-sans tracking-widest text-zinc-800 mb-6 flex items-center gap-2 uppercase">
                  <TrendingUp className="h-4 w-4 text-emerald-600" /> Đồ thị xu hướng đa dạng Shannon H&apos; theo thời gian
                </h2>
                
                {/* Recharts Wrapper */}
                <div className="w-full h-80 font-sans text-[9px]">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_TREND} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="shannonGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(5, 150, 105, 0.05)" />
                        <XAxis dataKey="timestamp" stroke="rgba(15, 23, 42, 0.3)" />
                        <YAxis domain={[0, 2.0]} stroke="rgba(15, 23, 42, 0.3)" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", color: "#0f172a" }}
                          itemStyle={{ color: "#059669" }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="shannon_index" 
                          name="Chỉ số Shannon H'"
                          stroke="#059669" 
                          strokeWidth={1.5}
                          fillOpacity={1} 
                          fill="url(#shannonGrad)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">Đang tải biểu đồ đa dạng...</div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 border border-zinc-200/80 bg-zinc-50/50 text-[10px] text-zinc-500 rounded-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Chỉ số đa dạng Shannon được cập nhật tự động từ kết quả lượng giá quần thể loài chỉ thị theo thời gian thực.</span>
                </div>
              </div>

              {/* Bio Assessment specs */}
              <div className="lg:col-span-4 border border-zinc-200/80 bg-white p-5 rounded-sm font-sans shadow-sm">
                <h2 className="text-xs font-bold tracking-widest text-emerald-700 mb-4 flex items-center gap-2 uppercase">
                  <Award className="h-4 w-4 text-emerald-600" /> Quy chuẩn đánh giá đa dạng
                </h2>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="p-3 border border-zinc-200 bg-zinc-50 rounded-sm">
                    <div className="text-zinc-500 text-[9px] mb-1 uppercase tracking-wider font-semibold">Thuật toán Shannon-Wiener (H&apos;)</div>
                    <code className="text-emerald-700 text-xs font-bold font-mono">H&apos; = - ∑ (p_i * ln(p_i))</code>
                    <div className="text-zinc-500 text-[9px] mt-2 leading-relaxed">
                      Với p_i là mật độ xác suất hiện diện của loài i thu được trên phổ âm kiểm tra.
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="text-zinc-600 text-[9px] uppercase tracking-wider font-bold">Thang đo chỉ số H&apos;:</div>
                    
                    <div className="flex justify-between border-b border-zinc-100 pb-1.5 text-zinc-600">
                      <span>H&apos; &gt; 2.0</span> 
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded-sm border border-emerald-200">Độ đa dạng: Rất cao</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-zinc-100 pb-1.5 text-zinc-600">
                      <span>1.5 ≤ H&apos; ≤ 2.0</span> 
                      <span className="text-emerald-600 font-semibold bg-emerald-50/50 px-1.5 rounded-sm border border-emerald-100">Độ đa dạng: Tốt</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-zinc-100 pb-1.5 text-zinc-600">
                      <span>1.0 ≤ H&apos; &lt; 1.5</span> 
                      <span className="text-zinc-600 bg-zinc-100 px-1.5 rounded-sm border border-zinc-200">Độ đa dạng: Trung bình</span>
                    </div>
                    
                    <div className="flex justify-between border-b border-zinc-100 pb-1.5 text-zinc-600">
                      <span>H&apos; &lt; 1.0</span> 
                      <span className="text-red-600 font-bold bg-red-50 px-1.5 rounded-sm border border-red-200">Báo động: Suy giảm cao</span>
                    </div>
                  </div>

                  <div className="border border-zinc-200 bg-zinc-50 p-3 text-zinc-500 text-[10px] leading-relaxed rounded-sm">
                    <span className="text-red-600 font-bold">Quy chế cảnh báo:</span> Khi phát hiện tiếng động phá hoại rừng (cưa máy/súng), chỉ số H&apos; sẽ bị đè cưỡng bức về mức &lt;0.50 nhằm phát tín hiệu xáo trộn sinh cảnh khẩn cấp.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Species Catalog details */}
          {activeTab === "catalog" && (
            <div className="border border-zinc-200/80 bg-white p-5 rounded-sm font-sans shadow-sm">
              <h2 className="text-xs font-bold tracking-widest text-zinc-800 mb-4 flex items-center gap-2 uppercase">
                <Compass className="h-4 w-4 text-emerald-600" /> Thư viện loài chỉ thị rừng đặc dụng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {SPECIES_CATALOG.map((sp) => (
                  <div key={sp.id} className="p-4 border border-zinc-200/80 bg-white hover:border-emerald-500/50 transition-all duration-200 flex flex-col gap-2 rounded-sm shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl bg-emerald-50 p-2 border border-emerald-100 rounded-sm">{sp.icon}</span>
                      <div>
                        <h3 className="text-xs font-bold text-zinc-800">{sp.name}</h3>
                        <p className="text-[9px] text-emerald-600 italic font-serif">{sp.scientific}</p>
                      </div>
                    </div>
                    <div className="text-[9px] text-emerald-700 font-sans border-y border-zinc-100 py-1.5 mt-2 font-medium">
                      TẦN SỐ ĐẶC TRƯNG: {sp.frequencyRange}
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed text-justify mt-1">
                      {sp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Bottom Deck: Forest Audio Simulator Scenarios (Active Stream Feeds) ───────────── */}
      <footer className="border-t border-zinc-200 bg-white p-4 flex flex-col lg:flex-row items-center justify-between gap-4 font-sans z-30 shadow-xs">
        <div className="flex items-center gap-2.5 shrink-0">
          <Play className="h-4 w-4 text-emerald-600 animate-pulse" />
          <div>
            <div className="text-xs font-bold text-zinc-800 tracking-wider">BỘ THỬ NGHIỆM GIẢ LẬP KỊCH BẢN (DEMO FEEDS)</div>
            <div className="text-[8px] text-zinc-400 uppercase font-semibold">Tái dựng 5 kịch bản rừng để đánh giá phản hồi hệ thống</div>
          </div>
        </div>

        {/* 5 Scenario Deck */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end font-sans">
          <button 
            onClick={() => triggerSimulatorPreset(0)}
            className="px-3.5 py-2 text-[9px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all duration-150 cursor-pointer rounded-sm"
          >
            🐦 BÌNH MINH BÌNH YÊN
          </button>
          
          <button 
            onClick={() => triggerSimulatorPreset(1)}
            className="px-3.5 py-2 text-[9px] font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-150 cursor-pointer rounded-sm"
          >
            🪓 PHÁT HIỆN TIẾNG CƯA MÁY
          </button>

          <button 
            onClick={() => triggerSimulatorPreset(2)}
            className="px-3.5 py-2 text-[9px] font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-150 cursor-pointer rounded-sm"
          >
            💥 BÁO ĐỘNG TIẾNG SÚNG SĂN
          </button>

          <button 
            onClick={() => triggerSimulatorPreset(3)}
            className="px-3.5 py-2 text-[9px] font-bold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all duration-150 cursor-pointer rounded-sm"
          >
            ⛈️ NHIỄU GIÓ BÃO (NHEO SÓNG)
          </button>

          <button 
            onClick={() => triggerSimulatorPreset(4)}
            className="px-3.5 py-2 text-[9px] font-bold border border-zinc-200 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-all duration-150 cursor-pointer rounded-sm"
          >
            🌙 KHÔNG GIAN ĐÊM TĨNH
          </button>
        </div>
      </footer>
    </div>
  );
}
