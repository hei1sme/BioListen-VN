# BioListen VN — Deep Technical Analysis & 48-Hour Execution Plan

**Generated:** 17/07/2026 12:38 PM | **Time remaining:** ~46 hours  

---

## 1. Dataset & Feasibility Scan

### 1.1 Exact Datasets to Download (Hour 0–2)

| Dataset | Size | Classes Needed | Download Method | Priority |
|---------|------|---------------|-----------------|----------|
| **[ESC-50](https://github.com/karolpiczak/ESC-50)** | 600MB | `chainsaw` (028), `engine` (034), `hand_saw` (029), `gunshot` (042), `rain` (001), `thunderstorm` (003), `crickets` (012), `insects_flying` (011) | `git clone https://github.com/karolpiczak/ESC-50.git` | **P0 — download NOW** |
| **[Xeno-canto](https://xeno-canto.org/explore/api)** | ~500MB subset | 5 Vietnamese bird species (see list below) | Python script using `requests` to query API: `https://xeno-canto.org/api/2/recordings?query=cnt:vietnam+q:A` | **P0 — download NOW** |
| **[BirdCLEF 2024](https://www.kaggle.com/competitions/birdclef-2024)** | 25GB full, ~2GB filtered | Vietnamese/SEA species subset | `kaggle competitions download -c birdclef-2024` then filter by species list | **P1 — fallback if Xeno-canto insufficient** |

#### Target Vietnamese Bird/Amphibian Species (Xeno-canto)

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
    "hop_length": 512,          # Hop between windows
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
- **Time shift:** `torch.roll(waveform, random_shift)` (Simulates recording starting at different points)
- **Background noise mixing:** Add random ESC-50 `rain`/`wind` clip at 0.1–0.3 amplitude (Makes model robust to weather)
- **Frequency masking:** Zero out 2–4 random mel bands in spectrogram (SpecAugment)

---

## 2. Technical Architecture & Edge Simulation

### 2.1 Multi-Task CNN Design

We modify the existing `EfficientNetClassifier` in `backend/services/pytorch_components.py`. We replace it with two custom heads:

```python
import torchvision.models as models

class BioListenModel(nn.Module):
    """
    Multi-task audio classifier.
    Backbone: EfficientNet-V2-S (pretrained, frozen early layers)
    Head 1: Species classification (N_SPECIES classes)
    Head 2: Threat detection (binary: threat / no_threat)
    """
    def __init__(self, n_species=5, n_threats=2):
        super().__init__()
        backbone = models.efficientnet_v2_s(
            weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1
        )
        self.features = backbone.features
        self.avgpool = backbone.avgpool
        feature_dim = 1280

        # Freeze early layers
        for param in list(self.features.parameters())[:-30]:
            param.requires_grad = False

        # Head 1: Species classification
        self.species_head = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(feature_dim, 256),
            nn.ReLU(),
            nn.Dropout(p=0.3),
            nn.Linear(256, n_species),
        )

        # Head 2: Threat detection
        self.threat_head = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(feature_dim, 128),
            nn.ReLU(),
            nn.Linear(128, n_threats + 1),  # +1 for "no_threat"
        )

    def forward(self, x):
        features = self.features(x)
        features = self.avgpool(features).flatten(1)
        species_logits = self.species_head(features)
        threat_logits = self.threat_head(features)
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
            providers=["CPUExecutionProvider"]
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
    model.train()  # Keep dropout active
    species_preds = []
    threat_preds = []

    with torch.no_grad():
        for _ in range(n_forward):
            sp, th = model(spectrogram)
            species_preds.append(F.softmax(sp, dim=1))
            threat_preds.append(F.softmax(th, dim=1))

    model.eval()
    species_stack = torch.stack(species_preds)
    threat_stack = torch.stack(threat_preds)

    return {
        "species_mean": species_stack.mean(0),
        "species_std": species_stack.std(0),
        "threat_mean": threat_stack.mean(0),
        "threat_std": threat_stack.std(0),
        "is_uncertain": bool(species_stack.std(0).max() > 0.15),
    }
```

### 2.4 Grad-CAM on Mel-Spectrograms
```python
def generate_gradcam(model, spectrogram, target_class):
    model.eval()
    spectrogram.requires_grad_(True)
    features = model.features(spectrogram)
    pooled = model.avgpool(features).flatten(1)
    species_logits = model.species_head(pooled)

    species_logits[0, target_class].backward()
    gradients = spectrogram.grad
    weights = gradients.mean(dim=[2, 3], keepdim=True)
    cam = (weights * features).sum(dim=1, keepdim=True)
    cam = F.relu(cam)
    cam = F.interpolate(cam, size=(224, 224), mode="bilinear")
    cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)

    return cam.squeeze().detach().cpu().numpy()
```

---

## 3. API Contracts & Data Flow

### 3.1 Endpoint: `POST /api/audio/predict`
**Request:** `multipart/form-data` with `file: <audio_file.wav>`.

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
  "llm_report": "Phát hiện tiếng Chào mào (94% tin cậy). Cảnh báo: phát hiện tiếng cưa xích cách trạm ~200m."
}
```

---

## 4. Fallback Pivot Plan
- **Trigger:** Nếu độ chính xác model < 60% trên tập validation vào lúc 23:00 tối nay.
- **Pivot to:** AI Platform for Điện Biên Agriculture (Phân loại bệnh cây trồng bằng ảnh chụp lá).
- **Code tận dụng:** Giữ nguyên cấu trúc FastAPI, Supabase DB. Đổi router sang nhận ảnh, chuyển model EfficientNet từ xử lý spectrogram sang ảnh lá. Thay UI hiển thị biểu đồ sóng thành box hiển thị ảnh chụp lá cây.
