# Backend — VAIC 2026

FastAPI (Python 3.11) + PyTorch 2.x + HuggingFace + Groq

## Dev

```bash
conda activate vaic2026          # hoặc: conda env create -f ../environment.yml
cp .env.example .env             # điền GROQ_API_KEY (bắt buộc)
uvicorn main:app --reload        # http://localhost:8000
```

## Env

| Variable | Required | Lấy ở đâu |
|----------|----------|-----------|
| `GROQ_API_KEY` | ✅ Yes | https://console.groq.com |
| `SUPABASE_URL` | Optional | https://supabase.com |
| `SUPABASE_KEY` | Optional | Supabase project settings |

## Structure

```
main.py               App entry, lifespan, CORS, route registration
config.py             Settings (pydantic-settings)
api/
  deps.py             Shared Depends() — auth, settings
  routes/
    ai.py             AI endpoints (placeholder — viết lại sau khi biết track)
services/
  pytorch_components.py   3 PyTorch components sẵn dùng
  ai_services.py          Groq LLM wrapper
```

## PyTorch Components

Xem `services/pytorch_components.py`. Models **tự download khi gọi lần đầu**.

```python
from services.pytorch_components import get_whisper, get_phobert, get_efficientnet

# Speech-to-text tiếng Việt
result = get_whisper().transcribe("audio.wav", language="vi")

# NLP / zero-shot classification tiếng Việt
result = get_phobert().classify_zero_shot("input text", ["label1", "label2"])

# Image classification
result = get_efficientnet().predict_from_file("image.jpg")
```

## Thêm Route Mới

```python
# api/routes/[track].py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Track Name"])

class Request(BaseModel):
    data: str

@router.post("/predict")
async def predict(req: Request):
    from services.pytorch_components import get_phobert  # lazy import
    ...
```

```python
# main.py — đăng ký
from api.routes.track import router as track_router
app.include_router(track_router, prefix="/api/track")
```

## Deploy → Railway

1. Push lên GitHub
2. Railway tự detect `Dockerfile`
3. Set env vars trong Railway dashboard
4. Copy Railway URL → update `../frontend/vercel.json` và frontend `.env`
