"""
PyTorch Components Ready-to-Use — VAIC 2026
Chuẩn bị sẵn 2 components mạnh nhất, apply được mọi track:
  1. WhisperInference — Vietnamese speech-to-text (PyTorch)
  2. PhoBERTClassifier — Vietnamese text classification (PyTorch)
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from pathlib import Path
from typing import Optional, List, Dict
import time
import random
import pandas as pd
import numpy as np

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODELS_DIR = Path(__file__).parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

print(f"[PyTorch] Device: {DEVICE} | Version: {torch.__version__}")


# ═══════════════════════════════════════════════════════════════════════════════
# COMPONENT 1: WHISPER — Vietnamese Speech to Text
# Use cases: Education (pronunciation), Healthcare (voice notes), SME (voice commands)
# ═══════════════════════════════════════════════════════════════════════════════
class WhisperInference:
    """
    OpenAI Whisper chạy trên PyTorch locally.
    Không cần API key, inference nhanh, hỗ trợ tiếng Việt tốt.
    """
    SUPPORTED_MODELS = ["tiny", "base", "small", "medium"]  # large quá nặng cho hackathon

    def __init__(self, model_size: str = "base"):
        assert model_size in self.SUPPORTED_MODELS, f"Use one of: {self.SUPPORTED_MODELS}"
        self.model_size = model_size
        self._model = None
        self._load_time = None

    def _ensure_loaded(self):
        if self._model is None:
            import whisper
            t0 = time.time()
            print(f"[Whisper] Loading '{self.model_size}' model on {DEVICE}...")
            self._model = whisper.load_model(self.model_size, device=str(DEVICE))
            self._load_time = time.time() - t0
            print(f"[Whisper] Ready in {self._load_time:.1f}s ✓")

    @torch.no_grad()
    def transcribe(
        self,
        audio_path: str,
        language: str = "vi",
        task: str = "transcribe",  # hoặc "translate" để dịch sang English
    ) -> dict:
        """
        Returns:
            {
                "text": str,
                "segments": [...],
                "language": str,
                "duration_s": float,
                "model": str
            }
        """
        self._ensure_loaded()
        t0 = time.time()
        result = self._model.transcribe(
            audio_path,
            language=language,
            task=task,
            fp16=torch.cuda.is_available(),  # fp16 nhanh hơn nếu có GPU
        )
        elapsed = time.time() - t0
        return {
            "text": result["text"].strip(),
            "segments": result.get("segments", []),
            "language": result.get("language", language),
            "duration_s": elapsed,
            "model": f"whisper-{self.model_size}",
        }

    @torch.no_grad()
    def score_pronunciation(self, audio_path: str, expected_text: str) -> dict:
        """
        So sánh transcript thực tế với text mong muốn → pronunciation score.
        Hữu ích cho Education track.
        """
        result = self.transcribe(audio_path, language="vi")
        actual = result["text"].lower().strip()
        expected = expected_text.lower().strip()

        # Simple word-overlap score (có thể thay bằng edit distance)
        actual_words = set(actual.split())
        expected_words = set(expected.split())
        overlap = len(actual_words & expected_words)
        score = overlap / max(len(expected_words), 1)

        return {
            "score": round(score, 3),
            "actual_transcript": actual,
            "expected_text": expected,
            "words_correct": overlap,
            "words_total": len(expected_words),
        }


# ═══════════════════════════════════════════════════════════════════════════════
# COMPONENT 2: PhoBERT — Vietnamese Text Analysis (PyTorch)
# Use cases: Sentiment, intent detection, classification — ANY track
# ═══════════════════════════════════════════════════════════════════════════════
class PhoBERTAnalyzer:
    """
    PhoBERT — BERT cho tiếng Việt, chạy trên PyTorch via HuggingFace.
    Dùng cho: classification, sentiment, entity extraction.
    """
    MODEL_NAME = "vinai/phobert-base-v2"

    def __init__(self):
        self._tokenizer = None
        self._model = None

    def _ensure_loaded(self):
        if self._model is None:
            from transformers import AutoTokenizer, AutoModel
            print(f"[PhoBERT] Loading '{self.MODEL_NAME}'...")
            self._tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
            self._model = AutoModel.from_pretrained(self.MODEL_NAME).to(DEVICE)
            self._model.eval()
            print("[PhoBERT] Ready [OK]")

    @torch.no_grad()
    def get_embeddings(self, texts: List[str]) -> torch.Tensor:
        """
        Trả về embeddings [batch_size, hidden_size] cho downstream tasks.
        """
        self._ensure_loaded()
        inputs = self._tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=256,
        ).to(DEVICE)
        outputs = self._model(**inputs)
        # Mean pooling
        embeddings = outputs.last_hidden_state.mean(dim=1)
        return embeddings  # [batch, 768]

    @torch.no_grad()
    def compute_similarity(self, text_a: str, text_b: str) -> float:
        """Cosine similarity giữa 2 đoạn văn tiếng Việt (0 → 1)"""
        embs = self.get_embeddings([text_a, text_b])
        sim = F.cosine_similarity(embs[0].unsqueeze(0), embs[1].unsqueeze(0))
        return float(sim.item())

    @torch.no_grad()
    def classify_zero_shot(self, text: str, labels: List[str]) -> Dict:
        """
        Zero-shot classification — không cần train lại.
        So sánh embedding của text với embedding của từng label.
        
        Example:
            classify_zero_shot(
                "Tôi cần vay vốn mua nhà",
                ["tư vấn tài chính", "hỗ trợ kỹ thuật", "khiếu nại"]
            )
        """
        text_emb = self.get_embeddings([text])
        label_embs = self.get_embeddings(labels)

        similarities = F.cosine_similarity(
            text_emb.expand(len(labels), -1),
            label_embs
        )
        probs = F.softmax(similarities, dim=0)

        results = [
            {"label": label, "score": float(prob)}
            for label, prob in zip(labels, probs)
        ]
        results.sort(key=lambda x: x["score"], reverse=True)

        return {
            "text": text,
            "top_label": results[0]["label"],
            "top_score": results[0]["score"],
            "all_labels": results,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# COMPONENT 3: EfficientNet — Image Classification (PyTorch)
# Use cases: Healthcare (medical images), Agriculture (crop disease)
# ═══════════════════════════════════════════════════════════════════════════════
class EfficientNetClassifier:
    """
    EfficientNet-V2-S pretrained on ImageNet.
    Dùng cho phân loại ảnh — healthcare, agriculture, etc.
    Có thể fine-tune nhanh nếu có ít data.
    """

    def __init__(self):
        self._model = None
        self._preprocess = None

    def _ensure_loaded(self):
        if self._model is None:
            import torchvision.models as models
            import torchvision.transforms as transforms
            print("[EfficientNet] Loading pretrained model...")
            self._model = models.efficientnet_v2_s(
                weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1
            ).to(DEVICE)
            self._model.eval()
            self._preprocess = models.EfficientNet_V2_S_Weights.IMAGENET1K_V1.transforms()
            print("[EfficientNet] Ready ✓")

    @torch.no_grad()
    def predict_from_file(self, image_path: str) -> dict:
        """Classify ảnh từ file path"""
        from PIL import Image
        self._ensure_loaded()

        img = Image.open(image_path).convert("RGB")
        tensor = self._preprocess(img).unsqueeze(0).to(DEVICE)
        logits = self._model(tensor)
        probs = F.softmax(logits, dim=1)
        top5_probs, top5_idx = probs.topk(5)

        return {
            "top5_probs": top5_probs[0].tolist(),
            "top5_indices": top5_idx[0].tolist(),
            "confidence": float(top5_probs[0][0]),
        }

    @torch.no_grad()
    def extract_features(self, image_path: str) -> torch.Tensor:
        """
        Extract feature vector — dùng cho custom classifier head.
        Hữu ích khi muốn fine-tune với ít data (few-shot learning).
        """
        from PIL import Image
        self._ensure_loaded()
        img = Image.open(image_path).convert("RGB")
        tensor = self._preprocess(img).unsqueeze(0).to(DEVICE)

        # Remove classifier head, lấy features
        features = self._model.features(tensor)
        features = self._model.avgpool(features)
        return features.squeeze()  # [1280]


# ═══════════════════════════════════════════════════════════════════════════════
# COMPONENT 4: BioListenModel — Multi-Task Audio Classifier (PyTorch)
# Track: Biodiversity & Security (Nông nghiệp)
# ═══════════════════════════════════════════════════════════════════════════════
class BioListenModel(nn.Module):
    """
    Multi-task audio classifier for edge computing.
    Backbone: EfficientNet-V2-S (pretrained, frozen early layers)
    Head 1: Species classification (N_SPECIES classes)
    Head 2: Threat detection (binary: threat / no_threat, with sub-labels)
    """
    def __init__(self, n_species=5, n_threats=2):
        super().__init__()
        import torchvision.models as models
        # Load pretrained backbone
        backbone = models.efficientnet_v2_s(
            weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1
        )
        self.features = backbone.features       # Feature extractor
        self.avgpool = backbone.avgpool         # Global average pooling
        feature_dim = 1280                      # EfficientNet-V2-S output dim

        # Freeze early layers (transfer learning — only train last 30 blocks + heads)
        for param in list(self.features.parameters())[:-30]:
            param.requires_grad = False

        # Head 1: Species classification (Birds, Amphibians, Primates, Insects)
        self.species_head = nn.Sequential(
            nn.Dropout(p=0.3),   # Reused for MC-Dropout Bayesian Uncertainty
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
        species_logits = self.species_head(features)  # [B, n_species]
        threat_logits = self.threat_head(features)    # [B, n_threats+1]
        return species_logits, threat_logits


# ═══════════════════════════════════════════════════════════════════════════════
# COMPONENT 5: BioListenDataset — Multi-Task Audio Preprocessing & Dataset (PyTorch)
# Supports RFCx (species) and ESC-50 (threats)
# ═══════════════════════════════════════════════════════════════════════════════
class BioListenDataset(torch.utils.data.Dataset):
    """
    Multi-task PyTorch Dataset for BioListen VN.
    Supports RFCx (species_head) and ESC-50 (human_head) datasets.
    """
    def __init__(self, rfcx_df=None, esc50_df=None, rfcx_audio_dir=None, esc50_audio_dir=None, is_train=True, config=None):
        self.rfcx_df = rfcx_df if rfcx_df is not None else pd.DataFrame()
        self.esc50_df = esc50_df if esc50_df is not None else pd.DataFrame()
        self.rfcx_audio_dir = Path(rfcx_audio_dir) if rfcx_audio_dir else None
        self.esc50_audio_dir = Path(esc50_audio_dir) if esc50_audio_dir else None
        self.is_train = is_train
        
        # Audio configuration
        self.config = config or {
            "sample_rate": 32000,
            "duration_sec": 5,
            "n_fft": 2048,
            "hop_length": 512,
            "n_mels": 128,
            "fmin_human": 50,
            "fmin_species": 200,
            "fmax": 15000,
        }
        self.target_samples = self.config["sample_rate"] * self.config["duration_sec"]
        
        # List of 14 focal classes for BioListen VN
        self.biolisten_classes = [
            'chainsaw', 'airplane', 'breathing', 'engine', 'helicopter',
            'rain', 'laughing', 'wind', 'sneezing', 'snoring',
            'thunderstorm', 'crickets', 'footsteps', 'fireworks'
        ]
        # Threat mapping (category name -> threat index, where 0 is reserved for no_threat / others)
        self.threat_map = {cls: idx + 1 for idx, cls in enumerate(self.biolisten_classes)}
        
        self.samples = []
        
        # Add RFCx samples
        if not self.rfcx_df.empty and self.rfcx_audio_dir:
            grouped = self.rfcx_df.groupby('recording_id')
            for rec_id, group in grouped:
                species_vector = np.zeros(24, dtype=np.float32)
                for _, row in group.iterrows():
                    species_id = int(row['species_id'])
                    if 0 <= species_id < 24:
                        species_vector[species_id] = 1.0
                
                t_center = None
                if 't_min' in group.columns and 't_max' in group.columns:
                    t_center = float((group['t_min'].min() + group['t_max'].max()) / 2)
                
                file_path = self.rfcx_audio_dir / f"{rec_id}.flac"
                if not file_path.exists():
                    file_path = self.rfcx_audio_dir / f"{rec_id}.wav"
                    
                self.samples.append({
                    'type': 'rfcx',
                    'file_path': str(file_path),
                    'species_label': species_vector,
                    'threat_label': 0,  # no_threat
                    't_center': t_center
                })
                
        # Add ESC-50 samples
        if not self.esc50_df.empty and self.esc50_audio_dir:
            has_category = 'category' in self.esc50_df.columns
            for _, row in self.esc50_df.iterrows():
                fname = row['filename']
                if has_category:
                    category = row['category']
                    threat_label = self.threat_map.get(category, 0)
                else:
                    # Fallback mapping if category is missing (e.g. basic tests with targets only)
                    target = int(row['target'])
                    target_to_cat = {28: 'chainsaw', 40: 'helicopter'}
                    cat_name = target_to_cat.get(target, 'other')
                    threat_label = self.threat_map.get(cat_name, 0)
                
                file_path = self.esc50_audio_dir / fname
                self.samples.append({
                    'type': 'esc50',
                    'file_path': str(file_path),
                    'species_label': np.zeros(24, dtype=np.float32),
                    'threat_label': threat_label,
                    't_center': None
                })
                
    def __len__(self):
        return len(self.samples)
        
    def __getitem__(self, idx):
        sample = self.samples[idx]
        file_path = sample['file_path']
        t_center = sample['t_center']
        
        try:
            import torchaudio
            import torchaudio.transforms as T
            waveform, sr = torchaudio.load(file_path)
            
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)
                
            target_sr = self.config["sample_rate"]
            if sr != target_sr:
                resampler = T.Resample(orig_freq=sr, new_freq=target_sr)
                waveform = resampler(waveform)
                
            total_samples = waveform.shape[1]
            if t_center is not None:
                center_sample = int(t_center * target_sr)
                start_sample = max(0, center_sample - self.target_samples // 2)
                end_sample = start_sample + self.target_samples
                if end_sample > total_samples:
                    end_sample = total_samples
                    start_sample = max(0, end_sample - self.target_samples)
                waveform = waveform[:, start_sample:end_sample]
            else:
                if total_samples > self.target_samples:
                    if self.is_train:
                        max_start = total_samples - self.target_samples
                        start_sample = random.randint(0, max_start)
                        waveform = waveform[:, start_sample:start_sample+self.target_samples]
                    else:
                        waveform = waveform[:, :self.target_samples]
            
            num_samples = waveform.shape[1]
            if num_samples < self.target_samples:
                pad_len = self.target_samples - num_samples
                waveform = torch.nn.functional.pad(waveform, (0, pad_len))
                
            if self.is_train:
                if random.random() < 0.3:
                    shift = random.randint(-target_sr // 2, target_sr // 2)
                    waveform = torch.roll(waveform, shift, dims=1)
            
            fmin = self.config["fmin_species"] if sample['type'] == 'rfcx' else self.config["fmin_human"]
            mel_transform = T.MelSpectrogram(
                sample_rate=target_sr,
                n_fft=self.config["n_fft"],
                hop_length=self.config["hop_length"],
                n_mels=self.config["n_mels"],
                f_min=fmin,
                f_max=self.config["fmax"]
            )
            mel_spec = mel_transform(waveform)
            
            amplitude_to_db = T.AmplitudeToDB()
            spec_db = amplitude_to_db(mel_spec)
            
            min_val = spec_db.min()
            max_val = spec_db.max()
            if max_val - min_val > 1e-9:
                spec_norm = (spec_db - min_val) / (max_val - min_val)
            else:
                spec_norm = torch.zeros_like(spec_db)
                
            spec_resized = torch.nn.functional.interpolate(
                spec_norm.unsqueeze(0),
                size=(224, 224),
                mode='bilinear',
                align_corners=False
            ).squeeze(0)
            
            if self.is_train and random.random() < 0.4:
                freq_mask = T.FrequencyMasking(freq_mask_param=15)
                spec_resized = freq_mask(spec_resized)
                time_mask = T.TimeMasking(time_mask_param=20)
                spec_resized = time_mask(spec_resized)
                
            x = spec_resized.repeat(3, 1, 1)
            
        except Exception as e:
            x = torch.zeros((3, 224, 224), dtype=torch.float32)
            
        species_label = torch.tensor(sample['species_label'], dtype=torch.float32)
        threat_label = torch.tensor(sample['threat_label'], dtype=torch.long)
        
        mask_species = 1.0 if sample['type'] == 'rfcx' else 0.0
        mask_threat = 1.0 if sample['type'] == 'esc50' else 0.0
        
        return x, species_label, threat_label, mask_species, mask_threat


# ═══════════════════════════════════════════════════════════════════════════════
# SINGLETON REGISTRY — lazy load, không load tất cả lúc startup
# ═══════════════════════════════════════════════════════════════════════════════
_registry: dict = {}

def get_whisper(model_size: str = "base") -> WhisperInference:
    key = f"whisper_{model_size}"
    if key not in _registry:
        _registry[key] = WhisperInference(model_size)
    return _registry[key]

def get_phobert() -> PhoBERTAnalyzer:
    if "phobert" not in _registry:
        _registry["phobert"] = PhoBERTAnalyzer()
    return _registry["phobert"]

def get_efficientnet() -> EfficientNetClassifier:
    if "efficientnet" not in _registry:
        _registry["efficientnet"] = EfficientNetClassifier()
    return _registry["efficientnet"]


# ═══════════════════════════════════════════════════════════════════════════════
# QUICK TEST — chạy file này trực tiếp để verify PyTorch hoạt động
# ═══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 60)
    print("VAIC 2026 -- PyTorch Components Test")
    print("=" * 60)
    print(f"PyTorch: {torch.__version__}")
    print(f"Device:  {DEVICE}")
    print(f"CUDA:    {torch.cuda.is_available()}")

    # Test BioListenModel shape compatibility
    print("\n[Test] BioListenModel forward pass shape check...")
    model = BioListenModel(n_species=24, n_threats=14)
    dummy_input = torch.randn(2, 3, 224, 224)
    species_out, threat_out = model(dummy_input)
    print(f"  -> Input shape:        {dummy_input.shape}")
    print(f"  -> Species logits:     {species_out.shape} (Expected: [2, 24])")
    print(f"  -> Threat logits:      {threat_out.shape} (Expected: [2, 15])")

    # Test BioListenDataset creation with empty/mock dataframes
    print("\n[Test] BioListenDataset initialization...")
    mock_rfcx = pd.DataFrame({
        'recording_id': ['rec1', 'rec2'],
        'species_id': [3, 14],
        't_min': [1.2, 5.4],
        't_max': [3.4, 7.8]
    })
    mock_esc50 = pd.DataFrame({
        'filename': ['file1.wav', 'file2.wav'],
        'target': [28, 40],
        'category': ['chainsaw', 'helicopter']
    })
    dataset = BioListenDataset(
        rfcx_df=mock_rfcx, 
        esc50_df=mock_esc50,
        rfcx_audio_dir="mock_dir",
        esc50_audio_dir="mock_dir",
        is_train=True
    )
    print(f"  -> Dataset size:       {len(dataset)} samples (Expected: 4)")
    print(f"  -> Threat map checks:  {dataset.threat_map}")

    # Test PhoBERT (không cần file audio)
    print("\n[Test] PhoBERT zero-shot classification...")
    phobert = get_phobert()
    result = phobert.classify_zero_shot(
        text="Hoc sinh gap kho khan trong viec phat am tieng Anh",
        labels=["van de giao duc", "van de y te", "van de tai chinh"]
    )
    print(f"  -> Top label: {result['top_label']} ({result['top_score']:.2%})")

    print("\n[Test] PyTorch components ready for VAIC 2026!")
