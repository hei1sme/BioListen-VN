"""
PyTorch AI Services — track-agnostic utilities
Thêm các class/function cụ thể sau khi biết đề bài
"""
import torch
import torch.nn as nn
from pathlib import Path

# ─── Device Management ────────────────────────────────────────────────────────
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[AI] Using device: {DEVICE}")
MODELS_DIR = Path(__file__).parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)


# ─── Whisper — Speech to Text (PyTorch) ──────────────────────────────────────
# Hữu ích cho: Giáo dục (pronunciation), Y tế (voice input), SME (voice commands)
class WhisperService:
    """OpenAI Whisper chạy local bằng PyTorch"""
    
    def __init__(self, model_size: str = "base"):
        self._model = None
        self.model_size = model_size

    def load(self):
        import whisper
        print(f"[Whisper] Loading model '{self.model_size}'...")
        self._model = whisper.load_model(self.model_size, device=str(DEVICE))
        print("[Whisper] Model loaded ✓")

    def transcribe(self, audio_path: str, language: str = "vi") -> dict:
        if self._model is None:
            self.load()
        result = self._model.transcribe(audio_path, language=language)
        return {
            "text": result["text"],
            "segments": result.get("segments", []),
            "language": result.get("language", language),
        }


# ─── Image Classifier — General (PyTorch) ────────────────────────────────────
# Hữu ích cho: Y tế (phân tích ảnh), Nông nghiệp (nhận diện cây trồng/bệnh)
class ImageClassifierService:
    """Generic image classifier dùng torchvision pretrained models"""
    
    def __init__(self, model_name: str = "efficientnet_v2_s"):
        self._model = None
        self.model_name = model_name

    def load(self, num_classes: int = 1000):
        import torchvision.models as models
        weights = models.EfficientNet_V2_S_Weights.IMAGENET1K_V1
        self._model = models.efficientnet_v2_s(weights=weights)
        self._model = self._model.to(DEVICE)
        self._model.eval()
        print(f"[ImageClassifier] {self.model_name} loaded ✓")

    @torch.no_grad()
    def predict(self, image_tensor: torch.Tensor) -> torch.Tensor:
        if self._model is None:
            self.load()
        image_tensor = image_tensor.to(DEVICE)
        return self._model(image_tensor)


# ─── LLM Client — Groq (fast & free) ─────────────────────────────────────────
class LLMService:
    """Groq API wrapper — Llama 3.1, Gemma2, Mixtral"""
    
    DEFAULT_MODEL = "llama-3.1-70b-versatile"  # fast + capable
    FAST_MODEL = "llama-3.1-8b-instant"         # siêu nhanh, cho tasks đơn giản

    def __init__(self):
        from groq import Groq
        from config import settings
        self.client = Groq(api_key=settings.GROQ_API_KEY)

    def chat(self, messages: list, model: str = DEFAULT_MODEL, **kwargs) -> str:
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            **kwargs
        )
        return response.choices[0].message.content

    def quick(self, prompt: str, system: str = "You are a helpful AI assistant.") -> str:
        """Shortcut cho single-turn chat"""
        return self.chat([
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ], model=self.FAST_MODEL)


# ─── Singleton instances (lazy-loaded) ───────────────────────────────────────
_whisper: WhisperService | None = None
_llm: LLMService | None = None


def get_whisper() -> WhisperService:
    global _whisper
    if _whisper is None:
        _whisper = WhisperService("base")
    return _whisper


def get_llm() -> LLMService:
    global _llm
    if _llm is None:
        _llm = LLMService()
    return _llm
