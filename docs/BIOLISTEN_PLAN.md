# BioListen VN — Deep Technical Analysis & 48-Hour Execution Plan

**Project:** *BioListen VN* — Real-time Ecological Acoustics & Illegal Activity Monitoring System  
**Track:** Nông nghiệp (Biodiversity monitoring through Ecological acoustics)  
**Target:** Top 1 Overall + Best PyTorch Award

---

## 1. Technical Feasibility & Dataset Strategy

### Audio Processing Pipeline
We will process continuous environmental audio by chunking it into **5-second windows** and converting them into 2D **Mel-spectrograms**. This turns our audio task into an image classification problem, allowing us to leverage our pre-existing `EfficientNet-V2` architecture.

```
[Raw Audio .wav]
   │
   ▼ (torchaudio / librosa)
[Mel-spectrogram (2D Grid: 128 x 256)]
   │
   ▼ (CNN Backbone: ResNet-18 or EfficientNet-V2)
[Feature Vector] ──┬──► [Species Classification Head] ──► Probabilities (Softmax)
                   └──► [Threat Detection Head]       ──► Logits (Chainsaw/Gunshot)
```

### Dataset Sourcing (Hours 0–4)
To build a functional prototype within 36 hours without data-gathering overhead:

1. **Environmental Noise & Threats (Chainsaw/Gunshots):**
   - **Source:** [ESC-50 Dataset](https://github.com/karolpiczak/ESC-50).
   - **Target classes:** `chainsaw` (class 28), `gunshot` (class 42), and background noises like `rain` (class 1), `thunderstorm` (class 3), `crickets` (class 12).
   - **Action:** Việt downloads the raw audio files (~600MB) directly using a download script.

2. **Vietnamese Forest Species (Birds/Frogs):**
   - **Source:** [Xeno-Canto API](https://xeno-canto.org/explore/api).
   - **Action:** Scrape 10–15 specific bird species found in Vietnam (e.g., Red-whiskered Bulbul - Chào mào, Common Myna - Sáo đá). Alternatively, download a curated subset of 5 bird species from the Kaggle [BirdCLEF 2024](https://www.kaggle.com/competitions/birdclef-2024/data) dataset.
   - **Demo Target:** Support 5 Vietnamese bird/amphibian species + 2 threat types (chainsaw/gunshot) + 3 background noise types.

#### Target Vietnamese Bird Species (Xeno-canto)

| # | Scientific Name | Vietnamese Name | Xeno-canto Query | Est. Recordings |
|---|----------------|-----------------|-------------------|-----------------|
| 1 | *Pycnonotus jocosus* | Chào mào (Red-whiskered Bulbul) | `pycnonotus+jocosus` | 200+ |
| 2 | *Acridotheres tristis* | Sáo đá (Common Myna) | `acridotheres+tristis` | 300+ |
| 3 | *Copsychus saularis* | Chích chòe (Oriental Magpie-Robin) | `copsychus+saularis` | 250+ |
| 4 | *Halcyon smyrnensis* | Bói cá (White-throated Kingfisher) | `halcyon+smyrnensis` | 150+ |
| 5 | *Microhyla fissipes* | Ếch nhái (Ornate Narrow-mouthed Frog) | Search manually on xeno-canto | 50+ |

**Total target classes for demo: 10**
- 5 species (birds + 1 amphibian)
- 2 threats (chainsaw, gunshot)
- 3 backgrounds (rain, crickets, silence/wind)

### 1.2 Preprocessing Pipeline (Exact Parameters)

The key insight: **Mel-spectrograms are 2D images**. Our existing `EfficientNet-V2` in `backend/services/pytorch_components.py` expects `(3, 224, 224)` RGB tensors via its built-in `transforms()`. We need to convert single-channel spectrograms to this format.

```python
# Exact preprocessing parameters for BioListen VN
AUDIO_CONFIG = {
    "sample_rate": 22050,       # Standard for environmental audio
    "duration_sec": 5,          # 5-second analysis windows
    "n_samples": 22050 * 5,     # = 110,250 samples per window
    "n_fft": 2048,              # FFT window size
    "hop_length": 512,          # Hop between windows → ~431 time frames
    "n_mels": 128,              # Mel frequency bins
    "fmin": 50,                 # Min frequency (filter low rumble)
    "fmax": 11025,              # Max = sample_rate / 2 (Nyquist)
}
# Output spectrogram shape: (1, 128, 431) → resize to (1, 224, 224) → repeat to (3, 224, 224)
```

**Step-by-step pipeline:**
1. Load audio with `torchaudio.load()` → resample to 22050 Hz
2. Pad/clip to exactly 5 seconds (110,250 samples)
3. Apply `torchaudio.transforms.MelSpectrogram()`
4. Convert to log scale: `torch.log(mel_spec + 1e-9)`
5. Normalize to [0, 1]
6. Resize to `(224, 224)` using `torchvision.transforms.Resize`
7. Repeat channel: `(1, 224, 224)` → `(3, 224, 224)` to match EfficientNet RGB input

### 1.3 Data Augmentation Strategy

Keep it simple — 3 augmentations that work well for environmental audio:

| Augmentation | Implementation | Effect |
|-------------|---------------|--------|
| **Time shift** | `torch.roll(waveform, random_shift)` | Simulates recording starting at different points |
| **Background noise mixing** | Add random ESC-50 `rain`/`wind` clip at 0.1–0.3 amplitude | Makes model robust to weather |
| **Frequency masking** | Zero out 2–4 random mel bands in spectrogram | SpecAugment — standard for audio ML |

---

## 2. Technical Architecture & Edge Simulation

### 2.1 Multi-Task CNN Design

We modify the existing `EfficientNetClassifier` in `backend/services/pytorch_components.py` L194-249. We replace it with two custom heads:

```python
class BioListenModel(nn.Module):
    """
    Multi-task audio classifier.
    Backbone: EfficientNet-V2-S (pretrained, frozen early layers)
    Head 1: Species classification (N_SPECIES classes)
    Head 2: Threat detection (binary: threat / no_threat, with sub-labels)
    """
    def __init__(self, n_species=5, n_threats=2):
        super().__init__()
        # Load pretrained backbone
        backbone = models.efficientnet_v2_s(
            weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1
        )
        self.features = backbone.features       # Feature extractor
        self.avgpool = backbone.avgpool          # Global average pooling
        feature_dim = 1280                       # EfficientNet-V2-S output dim

        # Freeze early layers (transfer learning — only train last 3 blocks + heads)
        for param in list(self.features.parameters())[:-30]:
            param.requires_grad = False

        # Head 1: Species classification
        self.species_head = nn.Sequential(
            nn.Dropout(p=0.3),   # ← THIS dropout is reused for MC-Dropout
            nn.Linear(feature_dim, 256),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(256, n_species),
        )

        # Head 2: Threat detection (chainsaw, gunshot, or none)
        self.threat_head = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(feature_dim, 128),
            nn.ReLU(),
            nn.Linear(128, n_threats + 1),  # +1 for "no_threat" class
        )

    def forward(self, x):
        features = self.features(x)
        features = self.avgpool(features).flatten(1)  # [B, 1280]
        species_logits = self.species_head(features)   # [B, n_species]
        threat_logits = self.threat_head(features)      # [B, n_threats+1]
        return species_logits, threat_logits
```

### 2.2 ONNX Export & Edge Simulation

**Step 1: Export after training**
```python
model.eval()
dummy = torch.randn(1, 3, 224, 224)
torch.onnx.export(
    model, dummy, "models/biolisten_edge.onnx",
    input_names=["spectrogram"],
    output_names=["species", "threats"],
    dynamic_axes={"spectrogram": {0: "batch"}},
    opset_version=17,
)
```

**Step 2: FastAPI ONNX inference service**
```python
# backend/services/onnx_service.py
import onnxruntime as ort
import numpy as np

class ONNXAudioService:
    def __init__(self, model_path="models/biolisten_edge.onnx"):
        self.session = ort.InferenceSession(
            model_path,
            providers=["CPUExecutionProvider"]  # Proves edge-readiness
        )

    def predict(self, spectrogram_np: np.ndarray):
        species, threats = self.session.run(
            None, {"spectrogram": spectrogram_np}
        )
        return species, threats
```

### 2.3 MC-Dropout Uncertainty Quantification

```python
def predict_with_uncertainty(model, spectrogram, n_forward=10):
    """
    Run inference N times with dropout ACTIVE.
    High variance across runs = model is uncertain.
    """
    model.train()  # Keep dropout active (key trick)
    species_preds = []
    threat_preds = []

    with torch.no_grad():
        for _ in range(n_forward):
            sp, th = model(spectrogram)
            species_preds.append(F.softmax(sp, dim=1))
            threat_preds.append(F.softmax(th, dim=1))

    model.eval()

    species_stack = torch.stack(species_preds)    # [N, B, classes]
    threat_stack = torch.stack(threat_preds)

    return {
        "species_mean": species_stack.mean(0),     # Average prediction
        "species_std": species_stack.std(0),        # Uncertainty per class
        "threat_mean": threat_stack.mean(0),
        "threat_std": threat_stack.std(0),
        "is_uncertain": bool(species_stack.std(0).max() > 0.15),
    }
```

### 2.4 Grad-CAM on Mel-Spectrograms

```python
def generate_gradcam(model, spectrogram, target_class):
    """
    Highlight which TIME-FREQUENCY regions triggered the classification.
    On a spectrogram, this visually shows "the model heard the bird call HERE."
    """
    model.eval()
    spectrogram.requires_grad_(True)

    # Forward pass
    features = model.features(spectrogram)
    pooled = model.avgpool(features).flatten(1)
    species_logits = model.species_head(pooled)

    # Backward pass on target class
    species_logits[0, target_class].backward()

    # Grad-CAM computation
    gradients = spectrogram.grad
    weights = gradients.mean(dim=[2, 3], keepdim=True)
    cam = (weights * features).sum(dim=1, keepdim=True)
    cam = F.relu(cam)
    cam = F.interpolate(cam, size=(224, 224), mode="bilinear")
    cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)

    return cam.squeeze().detach().cpu().numpy()  # [224, 224] heatmap
```

---

## 3. API Contracts & Data Flow

### 3.1 Main Endpoint: `POST /api/audio/predict`

**Request:**
```
POST /api/audio/predict
Content-Type: multipart/form-data

file: <audio_file.wav>  (max 10MB, 5-60 seconds)
```

**Response (200 OK):**
```json
{
  "request_id": "uuid-v4",
  "duration_sec": 5.0,
  "processing_time_ms": 142,

  "species_detections": [
    {
      "species_id": "pycnonotus_jocosus",
      "common_name": "Chào mào (Red-whiskered Bulbul)",
      "confidence": 0.94,
      "uncertainty": 0.03,
      "time_window": {"start_sec": 1.2, "end_sec": 3.8},
      "is_confident": true
    }
  ],

  "threat_detections": [
    {
      "threat_type": "chainsaw",
      "confidence": 0.87,
      "uncertainty": 0.05,
      "is_alert": true
    }
  ],

  "ecosystem_health": {
    "shannon_index": 1.42,
    "species_richness": 3,
    "trend": "stable",
    "assessment": "Moderate biodiversity"
  },

  "spectrogram_base64": "<base64 encoded PNG of mel-spectrogram>",
  "gradcam_base64": "<base64 encoded PNG of Grad-CAM overlay>",

  "llm_report": "Phát hiện tiếng Chào mào (94% tin cậy) tại phân khu 3. Cảnh báo: phát hiện tiếng cưa xích cách trạm ~200m. Đề xuất thông báo kiểm lâm."
}
```

### 3.2 Frontend API Client Extensions

```typescript
// Add to ApiClient class in frontend/src/lib/api.ts

interface SpeciesDetection {
  species_id: string;
  common_name: string;
  confidence: number;
  uncertainty: number;
  time_window: { start_sec: number; end_sec: number };
  is_confident: boolean;
}

interface ThreatDetection {
  threat_type: string;
  confidence: number;
  uncertainty: number;
  is_alert: boolean;
}

interface AudioPredictionResponse {
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

async predictAudio(file: File): Promise<AudioPredictionResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${this.baseUrl}/api/audio/predict`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Audio prediction failed");
  return res.json();
}

async getDetectionHistory(sensorId?: string, limit = 50) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (sensorId) params.set("sensor_id", sensorId);
  return this.request<any[]>(`/api/audio/history?${params}`);
}

async getHealthTrend(days = 7) {
  return this.request<any[]>(`/api/audio/health-trend?days=${days}`);
}
```

### 3.3 Supabase Schema

```sql
-- Table: detections (stores every prediction)
CREATE TABLE detections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL DEFAULT 'demo-sensor-1',
  timestamp TIMESTAMPTZ DEFAULT now(),
  audio_url TEXT,                    -- Supabase Storage link
  species JSONB NOT NULL DEFAULT '[]',
  threats JSONB NOT NULL DEFAULT '[]',
  shannon_index FLOAT,
  is_alert BOOLEAN DEFAULT false,
  llm_report TEXT,
  processing_time_ms INT
);

-- Table: sensors (simulated sensor locations)
CREATE TABLE sensors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  park_name TEXT,
  status TEXT DEFAULT 'active'
);

-- Insert demo sensors
INSERT INTO sensors VALUES
  ('demo-sensor-1', 'Trạm A - Suối Lớn', 20.2373, 105.6157, 'Cúc Phương', 'active'),
  ('demo-sensor-2', 'Trạm B - Đỉnh Mây', 20.2410, 105.6200, 'Cúc Phương', 'active'),
  ('demo-sensor-3', 'Trạm C - Rừng Già', 20.2350, 105.6100, 'Cúc Phương', 'active');
```

---

## 4. 48-Hour Execution Roadmap

### Phase 1: Foundation (H0–H6 | Fri 12:00 – 18:00)

#### Việt (AI Lead) — Branch: `feature/ai`
- **12:00–13:00:** Download ESC-50 (`git clone`) + write Xeno-canto scraper for 5 VN bird species. Output: `data/esc50/`, `data/birds/`, `scripts/download_data.py`.
- **13:00–14:30:** Build `AudioDataset` class: load wav → resample 22050Hz → pad/clip 5s → MelSpectrogram → normalize → resize 224×224 → repeat to 3ch. Output: `backend/services/audio_dataset.py`.
- **14:30–16:00:** Implement `BioListenModel(nn.Module)` with dual heads on EfficientNet-V2-S backbone. Output: `backend/services/biolisten_model.py`.
- **16:00–18:00:** Write training script. Start first training run (aim: 20 epochs, ~2h on GPU). Output: `scripts/train.py`, first checkpoint at `models/biolisten_v1.pt`.

#### Hưng (AI All-round) — Branch: `feature/ui`
- **12:00–13:30:** Design main dashboard layout: sidebar (Monitor / History / Analytics / Catalog) + header. Output: `frontend/src/app/page.tsx`, `frontend/src/components/layout/`.
- **13:30–15:00:** Build `SpectrogramViewer` component (render base64 PNG spectrogram from API response). Output: `frontend/src/components/SpectrogramViewer.tsx`.
- **15:00–16:30:** Build `AudioUploader` component (drag-and-drop + record from mic button using MediaRecorder API). Output: `frontend/src/components/AudioUploader.tsx`.
- **16:30–18:00:** Build `AlertPanel` component (red flash animation, threat type icon, Groq-generated message) + wire mock data. Output: `frontend/src/components/AlertPanel.tsx`.

#### Hiếu (SE) — Branch: `feature/api`
- **12:00–13:00:** Create `backend/api/routes/audio.py` with Pydantic models matching the JSON contract above. Output: `audio.py` with `POST /predict`, `GET /history`, `GET /health-trend`.
- **13:00–14:00:** Implement mock inference in `/predict` (returns realistic random species/threats). Output: Working mock endpoint.
- **14:00–15:30:** Register audio router in `backend/main.py`. Add `torchaudio` and `librosa` to `requirements.txt`. Output: Updated `main.py`, `requirements.txt`.
- **15:30–17:00:** Create Supabase project. Run SQL schema (tables: `detections`, `sensors`). Insert demo sensor data. Output: Working Supabase instance with 3 simulated sensors.
- **17:00–18:00:** Push `feature/api` to Railway. Verify deploy succeeds with mock endpoints. Test from Vercel frontend. Output: Live Railway URL returning mock predictions.

---

### Phase 2: Integration (H6–H24 | Fri 18:00 – Sat 12:00)

#### Việt (AI Lead)
- **18:00–20:00:** Monitor training. Evaluate validation accuracy. Tune hyperparameters if needed (lr, augmentation strength). Output: Training log, accuracy curves.
- **20:00–22:00:** Export best checkpoint to ONNX. Write `ONNXAudioService` class. Test CPU inference speed. Output: `models/biolisten_edge.onnx`, `backend/services/onnx_service.py`.
- **22:00–01:00:** **Replace mock** with real model inference in `/predict` endpoint. End-to-end test: upload wav → get real species predictions. Output: Real predictions flowing through API.
- **01:00–04:00:** 💤 **Sleep 3h** (Việt needs to be sharp for Phase 3 AI Safety work).
- **04:00–08:00:** Improve model: add more augmentation, try unfreezing more backbone layers, retrain. Output: `models/biolisten_v2.pt`.
- **08:00–12:00:** Implement Shannon-Wiener Ecosystem Health Index calculator. Integrate into `/predict` response. Output: Ecosystem health scores in API response.

#### Hưng (AI All-round)
- **18:00–20:00:** Connect all components to live API (replace mock data). Handle loading/error states. Output: Working frontend with real API calls.
- **20:00–23:00:** Build `HealthChart` component (line chart: Shannon index over time using Recharts). Build `SensorMap` component (3 simulated sensors on a map using Leaflet or simple SVG). Output: `HealthChart.tsx`, `SensorMap.tsx`.
- **23:00–02:00:** Build `SpeciesGallery` page — shows all detected species with photos, audio playback, and detection count. Output: `frontend/src/app/species/page.tsx`.
- **02:00–05:00:** 💤 **Sleep 3h**.
- **05:00–08:00:** Write Groq system prompt for ranger alert generation. Test edge cases (multiple species, no detections, threat + species combo). Output: Polished LLM reports.
- **08:00–12:00:** Build `ForestSimulator` panel — 5 pre-recorded demo scenarios with one-click playback for judges. Output: `frontend/src/components/ForestSimulator.tsx`.

#### Hiếu (SE)
- **18:00–20:00:** Implement Supabase write: every `/predict` call saves detection to `detections` table. Output: Detection history persisting.
- **20:00–22:00:** Implement `GET /history` and `GET /health-trend` reading from Supabase with filters. Output: Working history/analytics endpoints.
- **22:00–01:00:** Deploy updated backend with real model. Smoke test from 3 different devices/browsers. Output: Stable Railway deployment.
- **01:00–06:00:** 💤 **Sleep 5h** (Hiếu handles final deploy — needs most rest).
- **06:00–12:00:** Deploy frontend to Vercel. Test full flow end-to-end. Fix CORS/timeout issues. Output: Working Vercel + Railway stack.

---

### Phase 3: Polish & AI Safety (H24–H36 | Sat 12:00 – Sun 00:00)

#### Việt (AI Lead)
- **12:00–15:00:** Implement MC-Dropout uncertainty quantification. Add `uncertainty` and `is_confident` fields to API response.
- **15:00–18:00:** Implement Grad-CAM spectrogram overlay. Return `gradcam_base64` in API response.
- **18:00–21:00:** ONNX edge benchmark: measure inference time on CPU, model file size. Prepare stats for slides.
- **21:00–00:00:** Final model review. Ensure every response has confidence + uncertainty. Review code for PyTorch Award submission.

#### Hưng (AI All-round)
- **12:00–14:00:** Add Grad-CAM overlay rendering in `SpectrogramViewer` (heatmap on top of spectrogram image).
- **14:00–16:00:** Add uncertainty badge UI: green "Confident" / amber "Low Confidence" / red "THREAT ALERT".
- **16:00–19:00:** Full UX polish: transitions, loading skeletons, responsive mobile layout, dark mode.
- **19:00–21:00:** Prepare 5 curated demo audio files. Test ForestSimulator flow end-to-end.
- **21:00–00:00:** Start Google Slides (10 slides). Draft key points for each slide.

#### Hiếu (SE)
- **12:00–15:00:** Load test: send 20 concurrent requests to Railway. Identify and fix bottlenecks.
- **15:00–18:00:** Set up ngrok as backup tunnel. Write one-command deploy script.
- **18:00–21:00:** Verify GitHub repo is PUBLIC. Remove all API keys from committed code. Update README with demo screenshots.
- **21:00–22:30:** **CHECKPOINT 2 PREP:** Verify live URL works on incognito + mobile. Verify GitHub link.
- **23:00:** **🔴 SUBMIT CHECKPOINT 2:** Live URL + GitHub public link.

---

### Phase 4: Final (H36–H48 | Sun 00:00 – 12:00)

| Time | Việt | Hưng | Hiếu |
|------|------|------|------|
| 00:00–04:00 | 💤 Sleep | 💤 Sleep | 💤 Sleep |
| 04:00–07:00 | Review tech slides for accuracy | Record 5-min demo video (OBS Studio) | Final deploy check |
| 07:00–09:00 | Prepare answers to judge questions | Finish Google Slides | Verify all 5 deliverables are ready |
| 09:00–11:00 | Rehearse pitch (all 3 members) | Rehearse pitch | Rehearse pitch |
| **11:00** | **🔴 FINAL SUBMISSION** | Upload slides + video | Verify links |

---

## 5. 5-Minute Live Demo Blueprint & Fallback Plan

### 5.1 Demo Script
- **0:00–0:15 [HOOK]:** Hưng giới thiệu về tiềm năng 34 rừng quốc gia Việt Nam nhưng chưa có AI lắng nghe.
- **0:15–0:45 [PROBLEM]:** Nêu khó khăn của camera trap (bị mù trước âm thanh) và sự cần thiết của âm thanh kiểm lâm.
- **0:45–1:15 [SOLUTION]:** Mở dashboard demo BioListen VN, một microphone, solar panel và mô hình PyTorch chạy biên.
- **1:15–2:00 [DEMO - PEACEFUL]:** Chạy thử file "Dawn Chorus", hiển thị spectrogram động phát hiện Chào mào (94%) và Sáo đá (88%). Shannon Index tăng.
- **2:00–2:45 [DEMO - THREAT]:** Chạy thử file "Intruder Alert" có tiếng cưa máy, màn hình nhấp nháy đỏ báo động và Groq đưa ra khuyến nghị vị trí gửi kiểm lâm.
- **2:45–3:15 [DEMO - AI SAFETY]:** Chạy tiếng sấm sét xa, model báo độ bất định cao (Low Confidence) nhờ MC-Dropout, tránh báo động giả.
- **3:15–4:00 [TECH ARCHITECTURE]:** Việt trình bày chuyển đổi audio sang Mel-spectrogram, model Multi-task CNN PyTorch, và ONNX CPU inference (30ms).
- **4:00–5:00 [BUSINESS & PILOT]:** Hiếu trình bày chi phí thiết bị <50 USD, kế hoạch pilot 10 thiết bị tại rừng Cúc Phương.

### 5.2 Fallback Pivot Plan
- **Điều kiện kích hoạt:** Nếu Việt không train được model audio chính xác > 60% vào lúc 23:00 tối Thứ Sáu.
- **Hướng chuyển đổi:** Chuyển sang track Nông nghiệp Điện Biên (Phân loại bệnh lá cây bằng EfficientNet từ dataset PlantVillage).
- **Phần giữ nguyên:** Cấu trúc code FastAPI, database Supabase và layout Next.js. Chỉ đổi API xử lý ảnh thay vì audio, và UI hiển thị ảnh chụp lá cây thay vì phổ spectrogram.
