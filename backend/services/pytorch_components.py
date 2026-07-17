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
from typing import Optional
import time

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
            print("[PhoBERT] Ready ✓")

    @torch.no_grad()
    def get_embeddings(self, texts: list[str]) -> torch.Tensor:
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
    def classify_zero_shot(self, text: str, labels: list[str]) -> dict:
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
    print("VAIC 2026 — PyTorch Components Test")
    print("=" * 60)
    print(f"PyTorch: {torch.__version__}")
    print(f"Device:  {DEVICE}")
    print(f"CUDA:    {torch.cuda.is_available()}")

    # Test PhoBERT (không cần file audio)
    print("\n[Test] PhoBERT zero-shot classification...")
    phobert = get_phobert()
    result = phobert.classify_zero_shot(
        text="Học sinh gặp khó khăn trong việc phát âm tiếng Anh",
        labels=["vấn đề giáo dục", "vấn đề y tế", "vấn đề tài chính"]
    )
    print(f"  → Top label: {result['top_label']} ({result['top_score']:.2%})")

    print("\n✅ PyTorch components ready for VAIC 2026!")
