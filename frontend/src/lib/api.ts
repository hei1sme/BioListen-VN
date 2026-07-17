/**
 * API Client — kết nối Frontend với FastAPI backend
 * Track-agnostic: thêm methods cụ thể sau khi biết đề bài
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "API Error");
    }

    return res.json();
  }

  // ── Health ────────────────────────────────────────────────────────────────
  async health() {
    return this.request<{ status: string }>("/health");
  }

  // ── AI Endpoints ──────────────────────────────────────────────────────────
  async analyzeText(text: string, language = "vi") {
    return this.request<{ result: string; confidence?: number }>("/api/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ text, language }),
    });
  }

  async transcribeAudio(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${this.baseUrl}/api/ai/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Transcription failed");
    return res.json() as Promise<{ text: string; segments: unknown[] }>;
  }

  // ── BioListen VN Endpoints ────────────────────────────────────────────────
  async predictAudio(file: File): Promise<AudioPredictionResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${this.baseUrl}/api/audio/predict`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(error.detail || "Audio prediction failed");
    }
    return res.json();
  }

  async getDetectionHistory(sensorId?: string, limit = 50): Promise<HistoricalRecord[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (sensorId) params.set("sensor_id", sensorId);
    return this.request<HistoricalRecord[]>(`/api/audio/history?${params}`);
  }

  async getHealthTrend(days = 7): Promise<HealthTrendPoint[]> {
    return this.request<HealthTrendPoint[]>(`/api/audio/health-trend?days=${days}`);
  }
}

// ── BioListen VN Type Definitions ──────────────────────────────────────────
export interface SpeciesDetection {
  species_id: string;
  common_name: string;
  confidence: number;
  uncertainty: number;
  time_window: { start_sec: number; end_sec: number };
  is_confident: boolean;
}

export interface ThreatDetection {
  threat_type: string;
  confidence: number;
  uncertainty: number;
  is_alert: boolean;
}

export interface AudioPredictionResponse {
  request_id: string;
  duration_sec: number;
  processing_time_ms: number;
  species_detections: SpeciesDetection[];
  threat_detections: ThreatDetection[];
  ecosystem_health: {
    shannon_index: number;
    species_richness: number;
    trend: string;
    assessment: string;
  };
  spectrogram_base64: string;
  gradcam_base64: string;
  llm_report: string;
}

export interface HistoricalRecord {
  id: string;
  sensor_id: string;
  timestamp: string;
  audio_url?: string;
  species: SpeciesDetection[];
  threats: ThreatDetection[];
  shannon_index: number;
  is_alert: boolean;
  llm_report: string;
  processing_time_ms: number;
}

export interface HealthTrendPoint {
  timestamp: string;
  shannon_index: number;
  species_richness: number;
}

export const api = new ApiClient(API_URL);
export default api;
