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

  // ── TODO: Add track-specific methods here ─────────────────────────────────
  // async yourFeature(data: YourType) { ... }
}

export const api = new ApiClient(API_URL);
export default api;
