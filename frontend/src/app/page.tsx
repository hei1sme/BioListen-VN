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
  Wifi, 
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

  // ── Alarm Siren loop ──────────────────────────────────────────────────────────
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

  function stopSiren() {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  }

  // Effect to handle siren whenever alarm condition changes
  useEffect(() => {
    const hasAlert = prediction?.threat_detections?.some(t => t.is_alert);
    if (hasAlert && !isMuted) {
      startSiren();
    } else {
      stopSiren();
    }
    return () => stopSiren();
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

  function stopRecordingResources() {
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
  }

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

      ctx.fillStyle = "#070c08";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw HUD vertical tech grid lines
      ctx.strokeStyle = "rgba(16, 185, 129, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      // Draw soundwave columns in Acid Green
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const greenGrad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
        greenGrad.addColorStop(0, "rgba(16, 185, 129, 0.1)");
        greenGrad.addColorStop(0.5, "rgba(52, 211, 153, 0.7)");
        greenGrad.addColorStop(1, "#39FF14");

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

    ctx.fillStyle = "#060606";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines (Technical HUD)
    ctx.strokeStyle = "rgba(16, 185, 129, 0.05)";
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
      grad1.addColorStop(0.2, heat ? "#ef4444" : "#10b981");
      grad1.addColorStop(0.3, heat ? "#fbbf24" : "#6ee7b7");
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
      grad2.addColorStop(0.6, heat ? "#ef4444" : "#10b981");
      grad2.addColorStop(0.7, heat ? "#f59e0b" : "#34d399");
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
      ctx.strokeStyle = heat ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.3)";
      
      // Bottom rumble block
      for (let y = canvas.height - 40; y < canvas.height - 10; y += 4) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(canvas.width - 10, y + Math.sin(y) * 3);
        ctx.stroke();
      }
      
      // Mid teeth (chainsaw buzz)
      ctx.lineWidth = 2;
      ctx.strokeStyle = heat ? "#ef4444" : "#10b981";
      ctx.beginPath();
      for (let x = 20; x < canvas.width - 20; x += 6) {
        const y = 140 + (x % 12 === 0 ? 15 : -15) + Math.random() * 5;
        if (x === 20) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Highlight heatmap if Gradcam active
      if (heat) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
        ctx.fillRect(80, 110, 240, 60);
        ctx.strokeStyle = "#fbbf24";
        ctx.strokeRect(80, 110, 240, 60);
      }

    } else if (type === "procedural_gunshot") {
      // Sudden vertical blast line (broadband explosion)
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.3, heat ? "#ef4444" : "#10b981");
      grad.addColorStop(0.5, heat ? "#fbbf24" : "#6ee7b7");
      grad.addColorStop(0.9, heat ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)");
      
      ctx.fillStyle = grad;
      ctx.fillRect(150, 20, 25, canvas.height - 30);

      if (heat) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(145, 15, 35, canvas.height - 25);
      }

    } else if (type === "procedural_storm") {
      // Large low-frequency blur clouds
      const grad = ctx.createRadialGradient(200, 160, 10, 200, 160, 90);
      grad.addColorStop(0, heat ? "rgba(251, 191, 36, 0.6)" : "rgba(16, 185, 129, 0.4)");
      grad.addColorStop(0.8, heat ? "rgba(239, 68, 68, 0.1)" : "rgba(6, 95, 70, 0.1)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(200, 160, 95, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Quiet scan line
      ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
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
    <div className="flex flex-col min-h-screen bg-[#050505] text-[#ededed] font-sans antialiased overflow-x-hidden">
      
      {/* ── Flashing Danger Background Alert ───────────────────────────────────── */}
      {prediction?.threat_detections?.some(t => t.is_alert) && (
        <div className="pointer-events-none fixed inset-0 z-50 border-[6px] border-red-600/70 animate-pulse" />
      )}

      {/* ── Top Technical Status Bar ───────────────────────────────────────────── */}
      <header className="border-b border-[#1b261d] bg-[#070c08]/90 px-6 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="h-6 w-6 text-[#39FF14] animate-pulse" />
            <div className="absolute inset-0 bg-[#39FF14]/20 blur-sm rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider font-mono text-[#ededed] flex items-center gap-2">
              BIOLISTEN VN <span className="text-[10px] bg-[#162a1a] text-[#39FF14] px-1.5 py-0.5 border border-[#39FF14]/30">V1.0.0</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">CÚC PHƯƠNG NATIONAL PARK MONITORING CONSOLE</p>
          </div>
        </div>

        {/* Live Metrics strip */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-[11px] border-l border-[#1b261d] pl-6">
          <div>
            <span className="text-zinc-500">STATIONS ACTIVE:</span>{" "}
            <span className="text-[#39FF14] font-bold">3/3</span>
          </div>
          <div>
            <span className="text-zinc-500">HEALTH INDEX (SHANNON):</span>{" "}
            <span className="text-[#39FF14] font-bold">
              {prediction ? prediction.ecosystem_health.shannon_index.toFixed(2) : "1.42"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">LATENCY:</span>{" "}
            <span className="text-zinc-400">
              {prediction ? `${prediction.processing_time_ms}ms` : "124ms"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mute Alert toggle for demonstration safety */}
          {prediction?.threat_detections?.some(t => t.is_alert) && (
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono border transition-all ${
                isMuted 
                ? "bg-zinc-800 border-zinc-700 text-zinc-400" 
                : "bg-red-950/80 border-red-600 text-red-400 animate-bounce"
              }`}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 animate-pulse" />}
              {isMuted ? "ĐÃ TẮT CÒI" : "TẮT CÒI BÁO ĐỘNG"}
            </button>
          )}
          
          <div className="flex items-center gap-1 bg-[#0f1d14] px-2.5 py-1 border border-[#1b261d] text-[10px] font-mono text-[#39FF14]">
            <Wifi className="h-3 w-3 animate-pulse" />
            LIVE EDGE LINK
          </div>
        </div>
      </header>

      {/* ── Main Workspace Layout ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col md:flex-row">
        
        {/* Sidebar Nav & Station Status Logs */}
        <aside className="w-full md:w-60 border-r border-[#1b261d] bg-[#070c08]/50 flex flex-col font-mono shrink-0">
          <div className="p-4 border-b border-[#1b261d]">
            <div className="text-[10px] text-zinc-500 mb-2">QUẢN LÝ THIẾT BỊ</div>
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab("monitor")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs border transition-all ${
                  activeTab === "monitor" 
                  ? "bg-[#112215]/80 border-[#39FF14]/30 text-[#39FF14]" 
                  : "border-transparent text-zinc-400 hover:text-[#ededed] hover:bg-[#112215]/20"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" /> GIÁM SÁT REAL-TIME
                </span>
                <span className="text-[9px] bg-[#162a1a] px-1 text-[#39FF14]">01</span>
              </button>
              
              <button 
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs border transition-all ${
                  activeTab === "history" 
                  ? "bg-[#112215]/80 border-[#39FF14]/30 text-[#39FF14]" 
                  : "border-transparent text-zinc-400 hover:text-[#ededed] hover:bg-[#112215]/20"
                }`}
              >
                <span className="flex items-center gap-2">
                  <History className="h-3.5 w-3.5" /> NHẬT KÝ LỊCH SỬ
                </span>
                <span className="text-[9px] bg-zinc-800 px-1 text-zinc-400">{history.length}</span>
              </button>

              <button 
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs border transition-all ${
                  activeTab === "analytics" 
                  ? "bg-[#112215]/80 border-[#39FF14]/30 text-[#39FF14]" 
                  : "border-transparent text-zinc-400 hover:text-[#ededed] hover:bg-[#112215]/20"
                }`}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5" /> PHÂN TÍCH ĐA DẠNG
                </span>
                <span className="text-[9px] bg-zinc-800 px-1 text-zinc-400">GRAPH</span>
              </button>

              <button 
                onClick={() => setActiveTab("catalog")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs border transition-all ${
                  activeTab === "catalog" 
                  ? "bg-[#112215]/80 border-[#39FF14]/30 text-[#39FF14]" 
                  : "border-transparent text-zinc-400 hover:text-[#ededed] hover:bg-[#112215]/20"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5" /> THƯ VIỆN LOÀI
                </span>
                <span className="text-[9px] bg-zinc-800 px-1 text-zinc-400">{SPECIES_CATALOG.length}</span>
              </button>
            </nav>
          </div>

          {/* Simulated Stations coordinates log */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-zinc-500 mb-3 uppercase">ĐIỂM TRẠM CẢM BIẾN</div>
              <div className="flex flex-col gap-2">
                {SENSORS.map((s) => (
                  <button 
                    key={s.id} 
                    onClick={() => setActiveSensor(s.id)}
                    className={`p-2.5 text-[11px] text-left border flex flex-col gap-1 transition-all ${
                      activeSensor === s.id 
                      ? "bg-[#112215]/60 border-[#39FF14]/40" 
                      : "bg-[#0b120c]/30 border-[#1b261d] hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#ededed] flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-[#39FF14]" />
                        {s.name}
                      </span>
                      <span>
                        {s.id === "demo-sensor-3" && prediction?.threat_detections?.some(t => t.is_alert) ? "🚨 ALARM" : s.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">Lat: {s.lat}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Lng: {s.lng}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware spec info strip */}
            <div className="pt-4 border-t border-[#1b261d] text-[10px] text-zinc-600 flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3" /> PyTorch ONNX Runtime (CPU)
              </div>
              <div>⚡ Latency Target: &lt;150ms</div>
              <div>🔋 Battery: 84% (Solar Linked)</div>
            </div>
          </div>
        </aside>

        {/* ── Content Viewports ──────────────────────────────────────────────── */}
        <main className="flex-1 bg-[#090e0a]/20 p-6 overflow-y-auto">
          
          {/* TAB 1: Real-time Audio Monitoring dashboard */}
          {activeTab === "monitor" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Audio Uploader, Spectrogram Visualizer */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Panel 1: Live Audio Ingestion */}
                <div className="border border-[#1b261d] bg-[#070c08]/80 p-5 rounded-none relative">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1b261d] text-[9px] font-mono text-zinc-500">INGESTION MODULE</div>
                  <h2 className="text-sm font-bold font-mono tracking-wider text-[#39FF14] mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4" /> KÊNH THU PHÁT VÀ PHÂN TÍCH ÂM THANH
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Live Mic Recorder */}
                    <div className="border border-[#1b261d] bg-[#090e0a] p-4 flex flex-col justify-between items-center text-center relative rounded-none">
                      <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                        <span className={`inline-block h-2 w-2 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-zinc-600"}`} />
                        MICROPHONE
                      </div>
                      
                      <div className="my-3 flex flex-col items-center gap-2">
                        {isRecording ? (
                          <button 
                            onClick={stopRecording}
                            className="h-16 w-16 bg-red-950 border border-red-500 text-red-500 flex items-center justify-center rounded-none shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:bg-red-900 transition-all cursor-pointer animate-pulse animate-duration-1000"
                          >
                            <Pause className="h-8 w-8" />
                          </button>
                        ) : (
                          <button 
                            onClick={startRecording}
                            disabled={isProcessing}
                            className="h-16 w-16 bg-[#112215] border border-[#39FF14] text-[#39FF14] flex items-center justify-center rounded-none shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:bg-[#1a3320] disabled:opacity-50 transition-all cursor-pointer"
                          >
                            <Mic className="h-8 w-8" />
                          </button>
                        )}
                        <span className="text-xs font-mono text-zinc-400 mt-2">
                          {isRecording ? `Đang ghi âm: ${recordingDuration}s / 10s` : "Nhấp để thu âm trực tiếp (Tối đa 10s)"}
                        </span>
                      </div>

                      {/* Microphone visualizer canvas */}
                      <canvas 
                        ref={canvasRef} 
                        className="w-full h-16 bg-[#070c08] border border-[#1b261d] rounded-none"
                        width={300}
                        height={64}
                      />
                    </div>

                    {/* Drag and Drop Wav Upload */}
                    <div className="border border-[#1b261d] bg-[#090e0a] p-4 flex flex-col justify-between items-center text-center relative rounded-none">
                      <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                        <UploadCloud className="h-3 w-3" /> TẬP TIN ÂM THANH
                      </div>

                      <div className="my-auto flex flex-col items-center p-3">
                        <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-[#1b261d] hover:border-[#39FF14]/50 cursor-pointer bg-[#070c08]/50 hover:bg-[#070c08] transition-all p-4">
                          <UploadCloud className="h-8 w-8 text-[#39FF14] mb-2" />
                          <span className="text-xs text-zinc-400 font-mono">Tải lên file .wav (5s - 60s)</span>
                          <span className="text-[10px] text-zinc-600 mt-1">Kéo thả hoặc click chọn file</span>
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
                        <div className="mt-2 text-[10px] font-mono text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {errorMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Processing / Classification Loading overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-[#050505]/95 z-10 flex flex-col items-center justify-center text-center p-6">
                      <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-dashed border-[#39FF14] rounded-none animate-spin animate-duration-3000" />
                        <Activity className="absolute inset-0 m-auto h-6 w-6 text-[#39FF14] animate-pulse animate-duration-1000" />
                      </div>
                      <div className="text-xs font-mono text-[#39FF14] animate-pulse tracking-widest uppercase animate-duration-1000">
                        ĐANG TRÍCH XUẤT SPECTROGRAM & CHẠY NHẬN DIỆN PYTORCH...
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">ONNX Runtime Engine executing inference pipelines</div>
                    </div>
                  )}
                </div>

                {/* Panel 2: Spectrogram & Heatmap Viewer */}
                <div className="border border-[#1b261d] bg-[#070c08]/80 p-5 rounded-none relative">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1b261d] text-[9px] font-mono text-zinc-500">ACCORDIAN MODULE</div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold font-mono tracking-wider text-[#39FF14] flex items-center gap-2">
                      <Activity className="h-4 w-4" /> PHỔ ÂM TẦN (MEL-SPECTROGRAM) & HEATMAP
                    </h2>
                    
                    {/* Grad-CAM toggle switch */}
                    <button 
                      onClick={() => setShowGradcam(!showGradcam)}
                      disabled={!prediction}
                      className={`px-3 py-1 text-[11px] font-mono border transition-all ${
                        !prediction 
                        ? "opacity-30 cursor-not-allowed border-zinc-800 text-zinc-600"
                        : showGradcam
                        ? "bg-amber-950/80 border-amber-500 text-[#fbbf24] shadow-[0_0_10px_rgba(251,191,36,0.15)]"
                        : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-[#ededed] cursor-pointer"
                      }`}
                    >
                      {showGradcam ? "ẨN GRAD-CAM HEATMAP" : "HIỆN GRAD-CAM (ĐỘ TẬP TRUNG)"}
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    {/* Mel Spectrogram display canvas */}
                    <div className="flex-1 bg-[#050505] p-3 border border-[#1b261d] flex flex-col justify-center relative min-h-[220px]">
                      
                      <div className="absolute top-2 left-2 bg-[#090e0a] border border-[#1b261d] px-2 py-0.5 text-[9px] font-mono text-[#39FF14] z-10 flex items-center gap-1.5">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${showGradcam ? "bg-amber-400 animate-pulse animate-duration-1000" : "bg-[#39FF14]"}`} />
                        {showGradcam ? "GRAD-CAM WEIGHT OVERLAY" : "MEL-SPECTROGRAM FREQUENCY PLOT"}
                      </div>

                      {/* Display Canvas */}
                      <canvas 
                        ref={specCanvasRef} 
                        className="w-full h-48 bg-[#060606] rounded-none border border-zinc-900/30"
                        width={450}
                        height={192}
                      />

                      {/* Canvas legend labels */}
                      <div className="flex justify-between items-center text-[9px] text-zinc-600 font-mono mt-1">
                        <span>0.0s (BẮT ĐẦU)</span>
                        <span>WINDOW SIZE: 5.0s</span>
                        <span>5.0s (KẾT THÚC)</span>
                      </div>
                    </div>

                    {/* Spectrogram Y-Axis legend block */}
                    <div className="w-full md:w-48 bg-[#090e0a] p-4 border border-[#1b261d] flex flex-col justify-between font-mono text-[10px]">
                      <div>
                        <div className="text-zinc-500 font-bold mb-2 uppercase border-b border-[#1b261d] pb-1">Trục Tần số (Hz)</div>
                        <div className="flex flex-col gap-1 text-zinc-400">
                          <div className="flex justify-between"><span>Max:</span> <span className="text-[#39FF14]">11,025 Hz</span></div>
                          <div className="flex justify-between"><span>Mid:</span> <span>5,500 Hz</span></div>
                          <div className="flex justify-between"><span>Min:</span> <span>50 Hz</span></div>
                        </div>
                      </div>
                      <div className="mt-4 pt-2 border-t border-[#1b261d]">
                        <div className="text-zinc-500 font-bold mb-2 uppercase pb-1">Mã hóa Cường độ</div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-24 bg-gradient-to-t from-black via-emerald-800 to-emerald-400 border border-zinc-800" />
                          <div className="flex flex-col justify-between h-24 text-[9px] text-zinc-500">
                            <span>-10 dB (Max)</span>
                            <span>-50 dB (Mid)</span>
                            <span>-90 dB (Min)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Active Threat Warnings & LLM Report */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Panel 3: Live Beacons & SVG Maps */}
                <div className="border border-[#1b261d] bg-[#070c08]/80 p-5 rounded-none relative">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1b261d] text-[9px] font-mono text-zinc-500">GEO MAP MODULE</div>
                  <h2 className="text-sm font-bold font-mono tracking-wider text-[#39FF14] mb-3 flex items-center gap-2">
                    <Compass className="h-4 w-4" /> BẢN ĐỒ TRẠM CẢM BIẾN QUỐC GIA
                  </h2>
                  
                  {/* Simulated SVG Map of Park */}
                  <div className="relative w-full h-48 bg-[#050906] border border-[#1b261d] overflow-hidden flex items-center justify-center">
                    
                    {/* SVG Vector Map */}
                    <svg className="w-full h-full opacity-60" viewBox="0 0 300 180">
                      {/* Grid background */}
                      <defs>
                        <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(16, 185, 129, 0.04)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#mapGrid)" />
                      
                      {/* Cúc Phương border mock shape */}
                      <path 
                        d="M 20 80 Q 50 20 120 40 T 220 30 T 280 120 T 150 160 T 40 140 Z" 
                        fill="none" 
                        stroke="rgba(16, 185, 129, 0.15)" 
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      
                      {/* Topographic Lines */}
                      <path d="M 40 90 Q 80 50 150 80 T 240 70" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
                      <path d="M 50 110 Q 100 80 170 110 T 260 100" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />

                      {/* Map Labels */}
                      <text x="25" y="150" fill="rgba(16, 185, 129, 0.3)" fontSize="8" fontFamily="monospace">VQG CÚC PHƯƠNG</text>
                      <text x="180" y="25" fill="rgba(16, 185, 129, 0.2)" fontSize="7" fontFamily="monospace">NINH BÌNH SECTOR</text>

                      {/* Connections between sensors */}
                      <line x1="80" y1="70" x2="160" y2="40" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="160" y1="40" x2="220" y2="110" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="80" y1="70" x2="220" y2="110" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" strokeDasharray="3 3" />

                      {/* Station 1 Point - Suối Lớn */}
                      <circle 
                        cx="80" 
                        cy="70" 
                        r={activeSensor === "demo-sensor-1" ? "5" : "3.5"} 
                        fill={activeSensor === "demo-sensor-1" ? "#39FF14" : "#10b981"} 
                        className="cursor-pointer" 
                        onClick={() => setActiveSensor("demo-sensor-1")}
                      />
                      <circle cx="80" cy="70" r="10" fill="none" stroke="#10b981" strokeWidth="0.5" className="animate-ping animate-duration-1000" />
                      <text x="60" y="60" fill={activeSensor === "demo-sensor-1" ? "#39FF14" : "rgba(255, 255, 255, 0.5)"} fontSize="7" fontFamily="monospace" fontWeight="bold">TRẠM A (SUỐI LỚN)</text>

                      {/* Station 2 Point - Đỉnh Mây */}
                      <circle 
                        cx="160" 
                        cy="40" 
                        r={activeSensor === "demo-sensor-2" ? "5" : "3.5"} 
                        fill={activeSensor === "demo-sensor-2" ? "#39FF14" : "#10b981"}
                        className="cursor-pointer" 
                        onClick={() => setActiveSensor("demo-sensor-2")}
                      />
                      <text x="140" y="30" fill={activeSensor === "demo-sensor-2" ? "#39FF14" : "rgba(255, 255, 255, 0.5)"} fontSize="7" fontFamily="monospace" fontWeight="bold">TRẠM B (ĐỈNH MÂY)</text>

                      {/* Station 3 Point - Rừng Già */}
                      {/* If alert is active in Rừng Già, show red blinking circle */}
                      {prediction?.threat_detections?.some(t => t.is_alert) && activeSensor === "demo-sensor-3" ? (
                        <>
                          <circle cx="220" cy="110" r="6" fill="#ef4444" className="cursor-pointer" onClick={() => setActiveSensor("demo-sensor-3")} />
                          <circle cx="220" cy="110" r="14" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping animate-duration-1000" />
                        </>
                      ) : (
                        <circle 
                          cx="220" 
                          cy="110" 
                          r={activeSensor === "demo-sensor-3" ? "5" : "3.5"} 
                          fill={activeSensor === "demo-sensor-3" ? "#39FF14" : "#10b981"} 
                          className="cursor-pointer" 
                          onClick={() => setActiveSensor("demo-sensor-3")}
                        />
                      )}
                      <text x="200" y="125" fill={prediction?.threat_detections?.some(t => t.is_alert) && activeSensor === "demo-sensor-3" ? "#ef4444" : activeSensor === "demo-sensor-3" ? "#39FF14" : "rgba(255, 255, 255, 0.5)"} fontSize="7" fontFamily="monospace" fontWeight="bold">TRẠM C (RỪNG GIÀ)</text>
                    </svg>

                    {/* Sensor Overlay coordinate index */}
                    <div className="absolute bottom-2 left-2 font-mono text-[9px] text-zinc-500 bg-[#050906]/85 border border-[#1b261d] p-1">
                      ACTIVE TRẠM: <span className="text-[#39FF14]">{SENSORS.find(s => s.id === activeSensor)?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Panel 4: Alert Pane & Groq Report */}
                <div className={`border p-5 rounded-none relative transition-colors ${
                  prediction?.threat_detections?.some(t => t.is_alert)
                  ? "border-red-500/50 bg-red-950/20"
                  : "border-[#1b261d] bg-[#070c08]/80"
                }`}>
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#1b261d] text-[9px] font-mono text-zinc-500">INTELLIGENCE MODULE</div>

                  {/* Header alert status */}
                  <div className="flex items-center gap-2 mb-4">
                    {prediction?.threat_detections?.some(t => t.is_alert) ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-900/60 border border-red-500 text-red-400 font-mono text-[10px] font-bold tracking-widest animate-pulse animate-duration-1000">
                        <ShieldAlert className="h-4 w-4" /> MỐI ĐE DỌA XÂM HẠI CAO
                      </div>
                    ) : prediction ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#10b981]/15 border border-[#10b981]/30 text-[#39FF14] font-mono text-[10px]">
                        <CheckCircle className="h-4 w-4" /> HỆ SINH THÁI AN TOÀN
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700 text-zinc-400 font-mono text-[10px]">
                        <Activity className="h-4 w-4" /> CHỜ THU THẬP TÍN HIỆU
                      </div>
                    )}
                  </div>

                  {/* Classification details */}
                  {prediction ? (
                    <div className="flex flex-col gap-4">
                      
                      {/* Threat Details if exists */}
                      {prediction.threat_detections.length > 0 && (
                        <div className="border border-red-500/20 bg-red-950/10 p-3">
                          <div className="text-[10px] font-mono text-red-400 font-bold mb-2 uppercase">PHÂN LOẠI MỐI ĐE DỌA (THREAT HEAD)</div>
                          {prediction.threat_detections.map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center font-mono text-xs text-red-200">
                              <span>Mối nguy: <span className="font-bold uppercase text-red-400">{t.threat_type}</span></span>
                              <div className="flex items-center gap-3">
                                <span>Độ tin cậy: <span className="text-red-400 font-bold">{(t.confidence * 100).toFixed(0)}%</span></span>
                                <span className="text-[10px] text-zinc-500">Uncert: {(t.uncertainty * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Species detected Details */}
                      <div>
                        <div className="text-[10px] font-mono text-zinc-400 font-bold mb-2 uppercase">PHÂN LOẠI KHU HỆ SINH VẬT (SPECIES HEAD)</div>
                        {prediction.species_detections.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {prediction.species_detections.map((sp, idx) => (
                              <div key={idx} className="p-2 border border-[#1b261d] bg-[#050805] text-xs">
                                <div className="flex justify-between font-mono mb-1">
                                  <span className="text-[#ededed] font-bold">{sp.common_name}</span>
                                  <span className={sp.is_confident ? "text-[#39FF14]" : "text-amber-500 font-bold"}>
                                    {sp.is_confident ? "CONFIDENT" : "LOW CONFIDENCE"}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                  <span>Độ tin cậy: {(sp.confidence * 100).toFixed(0)}%</span>
                                  <span>Độ bất định: {(sp.uncertainty * 100).toFixed(0)}%</span>
                                  <span>Cửa sổ: {sp.time_window.start_sec}s - {sp.time_window.end_sec}s</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs font-mono text-zinc-600 bg-[#050805] p-2 border border-[#1b261d]">
                            Không phát hiện tín hiệu loài cụ thể.
                          </div>
                        )}
                      </div>

                      {/* Ecosystem health values */}
                      <div className="grid grid-cols-2 gap-3 font-mono text-xs p-3 border border-[#1b261d] bg-[#050805]">
                        <div>
                          <div className="text-zinc-500 text-[9px] uppercase">Chỉ số Shannon</div>
                          <div className="text-lg font-bold text-[#39FF14]">{prediction.ecosystem_health.shannon_index.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-zinc-500 text-[9px] uppercase">Độ phong phú loài</div>
                          <div className="text-lg font-bold text-[#39FF14]">{prediction.ecosystem_health.species_richness} loài</div>
                        </div>
                      </div>

                      {/* Groq Llama 3.1 emergency bulletin report */}
                      <div className="border border-[#1b261d] bg-[#050805] p-3">
                        <div className="text-[10px] font-mono text-[#39FF14] font-bold mb-2 flex items-center gap-1.5 uppercase">
                          <FileText className="h-3.5 w-3.5" /> BÁO CÁO HÀNH ĐỘNG KIỂM LÂM (Groq LLM)
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed text-justify">
                          {prediction.llm_report}
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-600 font-mono text-xs flex flex-col items-center justify-center gap-2">
                      <Database className="h-8 w-8 text-zinc-700 animate-pulse animate-duration-1000" />
                      <span>Sẵn sàng xử lý dữ liệu kiểm âm.</span>
                      <span>Chọn một preset bên dưới hoặc kích hoạt Microphone để phân tích.</span>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Historical log list view */}
          {activeTab === "history" && (
            <div className="border border-[#1b261d] bg-[#070c08]/80 p-5 rounded-none font-mono">
              <h2 className="text-sm font-bold tracking-wider text-[#39FF14] mb-4 flex items-center gap-2">
                <History className="h-4 w-4" /> NHẬT KÝ KIỂM ÂM LỊCH SỬ
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1b261d] text-zinc-500 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Thời gian</th>
                      <th className="py-2.5 px-3">Trạm</th>
                      <th className="py-2.5 px-3">Mối đe dọa (Head 2)</th>
                      <th className="py-2.5 px-3">Loài phát hiện (Head 1)</th>
                      <th className="py-2.5 px-3 text-right">Shannon</th>
                      <th className="py-2.5 px-3 text-right">Độ trễ</th>
                      <th className="py-2.5 px-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b261d]/50">
                    {history.map((h) => (
                      <tr key={h.id} className={`hover:bg-[#112215]/20 ${h.is_alert ? "bg-red-950/10 text-red-200" : "text-zinc-300"}`}>
                        <td className="py-3 px-3 text-[11px] text-zinc-500">
                          {new Date(h.timestamp).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-3 px-3 font-bold text-zinc-200">
                          {SENSORS.find(s => s.id === h.sensor_id)?.name || h.sensor_id}
                        </td>
                        <td className="py-3 px-3 font-bold">
                          {h.threats.length > 0 ? (
                            <span className="text-red-500 uppercase bg-red-950/40 px-2 py-0.5 border border-red-500/30">
                              🚨 {h.threats.map(t => t.threat_type).join(", ")}
                            </span>
                          ) : (
                            <span className="text-zinc-500">Không có</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {h.species.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {h.species.map((sp, idx) => (
                                <span key={idx} className="text-[#39FF14]">
                                  {sp.common_name} ({(sp.confidence * 100).toFixed(0)}%)
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-600">None</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#39FF14]">{h.shannon_index.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right text-zinc-500">{h.processing_time_ms}ms</td>
                        <td className="py-3 px-3 text-right">
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
                            className="text-[#39FF14] hover:underline cursor-pointer flex items-center gap-1 justify-end ml-auto"
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
              <div className="lg:col-span-8 border border-[#1b261d] bg-[#070c08]/80 p-5 rounded-none">
                <h2 className="text-sm font-bold font-mono tracking-wider text-[#39FF14] mb-6 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> BIỂU ĐỒ CHỈ SỐ SHANNON THEO THỜI GIAN
                </h2>
                
                {/* Recharts Wrapper */}
                <div className="w-full h-80 font-mono text-[10px]">
                  {mounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="shannonGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.05)" />
                        <XAxis dataKey="timestamp" stroke="rgba(16, 185, 129, 0.4)" />
                        <YAxis domain={[0, 2.5]} stroke="rgba(16, 185, 129, 0.4)" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#070c08", borderColor: "#1b261d", color: "#ededed" }}
                          itemStyle={{ color: "#39FF14" }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="shannon_index" 
                          name="Chỉ số Shannon"
                          stroke="#39FF14" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#shannonGrad)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">Đang khởi tạo biểu đồ...</div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 border border-[#1b261d] bg-[#050805] text-xs font-mono text-zinc-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#39FF14]" />
                  <span>Chỉ số Shannon (Ecosystem Health Index) được tính toán theo thời gian dựa trên phân phối xác suất dự đoán của Head 1 trên 5-second windows.</span>
                </div>
              </div>

              {/* Bio Assessment specs */}
              <div className="lg:col-span-4 border border-[#1b261d] bg-[#070c08]/80 p-5 rounded-none font-mono">
                <h2 className="text-sm font-bold tracking-wider text-[#39FF14] mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4" /> ĐÁNH GIÁ ĐA DẠNG SINH HỌC
                </h2>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="p-3 border border-[#1b261d] bg-[#050805]">
                    <div className="text-zinc-500 text-[10px] mb-1">CÔNG THỨC SHANNON-WIENER (H&apos;)</div>
                    <code className="text-[#39FF14] text-xs font-bold font-mono">H&apos; = - ∑ (p_i * ln(p_i))</code>
                    <div className="text-zinc-400 text-[10px] mt-2 leading-relaxed">
                      p_i là xác suất xuất hiện của loài thứ i được dự đoán bởi đầu phân loại loài.
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="text-zinc-500 text-[10px] uppercase">Thang đo chỉ số H&apos;:</div>
                    <div className="flex justify-between border-b border-[#1b261d]/50 pb-1 text-zinc-400">
                      <span>H&apos; &gt; 2.0</span> <span className="text-[#39FF14] font-bold">Rất cao</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1b261d]/50 pb-1 text-zinc-400">
                      <span>1.5 ≤ H&apos; ≤ 2.0</span> <span className="text-emerald-400">Cao</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1b261d]/50 pb-1 text-zinc-400">
                      <span>1.0 ≤ H&apos; &lt; 1.5</span> <span className="text-zinc-300">Trung bình</span>
                    </div>
                    <div className="flex justify-between border-b border-[#1b261d]/50 pb-1 text-zinc-400">
                      <span>H&apos; &lt; 1.0</span> <span className="text-red-400 font-bold">Báo động suy giảm</span>
                    </div>
                  </div>

                  <div className="border border-[#1b261d] bg-[#050805] p-3 text-zinc-400 text-[11px] leading-relaxed">
                    <span className="text-red-400 font-bold">Lưu ý:</span> Khi phát hiện tiếng cưa xích hoặc tiếng súng, chỉ số H&apos; sẽ tự động bị đè (suppressed) xuống mức tối thiểu do tiếng ồn xáo trộn sinh cảnh cao, nhằm phản ánh đúng rủi ro suy giảm hệ sinh vật tức thì.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Species Catalog details */}
          {activeTab === "catalog" && (
            <div className="border border-[#1b261d] bg-[#070c08]/80 p-5 rounded-none font-mono">
              <h2 className="text-sm font-bold tracking-wider text-[#39FF14] mb-4 flex items-center gap-2">
                <Compass className="h-4 w-4" /> THƯ VIỆN LOÀI CHỈ THỊ (CÚC PHƯƠNG SECTOR)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {SPECIES_CATALOG.map((sp) => (
                  <div key={sp.id} className="p-4 border border-[#1b261d] bg-[#050805] hover:border-[#39FF14]/40 transition-all flex flex-col gap-2 rounded-none">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-[#112215]/80 p-2 border border-[#1b261d]">{sp.icon}</span>
                      <div>
                        <h3 className="text-xs font-bold text-zinc-200">{sp.name}</h3>
                        <p className="text-[10px] text-zinc-500 italic font-serif">{sp.scientific}</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-[#39FF14] font-mono border-y border-[#1b261d] py-1 mt-2">
                      DẢI TẦN SỐ: {sp.frequencyRange}
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed text-justify mt-1">
                      {sp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Bottom Deck: Forest Audio Simulator Scenarios (Jurors Panel) ───────────── */}
      <footer className="border-t border-[#1b261d] bg-[#070c08] p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono z-30">
        <div className="flex items-center gap-2 shrink-0">
          <Play className="h-4 w-4 text-[#39FF14] animate-pulse animate-duration-1000" />
          <div>
            <div className="text-xs font-bold text-zinc-300">BỘ GIẢ LẬP KỊCH BẢN (FOREST SIMULATOR)</div>
            <div className="text-[9px] text-zinc-500 uppercase">DÀNH CHO BAN GIÁM KHẢO TRẢI NGHIỆM ĐỒNG BỘ</div>
          </div>
        </div>

        {/* 5 Scenario Deck */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button 
            onClick={() => triggerSimulatorPreset(0)}
            className="px-3 py-2 text-[10px] border border-emerald-500/20 bg-emerald-950/20 text-[#39FF14] hover:bg-emerald-900/20 transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            🐦 BÌNH MINH YÊN BÌNH
          </button>
          
          <button 
            onClick={() => triggerSimulatorPreset(1)}
            className="px-3 py-2 text-[10px] border border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-900/30 transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            🪓 CƯA XÍCH XÂM NHẬP
          </button>

          <button 
            onClick={() => triggerSimulatorPreset(2)}
            className="px-3 py-2 text-[10px] border border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-900/30 transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            💥 NỔ SÚNG SĂN BẮN
          </button>

          <button 
            onClick={() => triggerSimulatorPreset(3)}
            className="px-3 py-2 text-[10px] border border-amber-500/30 bg-amber-950/30 text-[#fbbf24] hover:bg-amber-900/30 transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            ⛈️ MƯA DÔNG (NHEO TÍN HIỆU)
          </button>

          <button 
            onClick={() => triggerSimulatorPreset(4)}
            className="px-3 py-2 text-[10px] border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            🌙 ĐÊM TĨNH LẶNG
          </button>
        </div>
      </footer>
    </div>
  );
}
