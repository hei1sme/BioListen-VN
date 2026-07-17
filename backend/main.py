"""
VAIC 2026 — FastAPI Backend Boilerplate
Track-agnostic: thêm routes vào sau khi biết đề bài
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import torch

# ─── Startup / Shutdown ───────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup"""
    print(f"[STARTUP] PyTorch version: {torch.__version__}")
    print(f"[STARTUP] CUDA available: {torch.cuda.is_available()}")
    # TODO: Load your PyTorch model here after choosing track
    # app.state.model = load_model()
    yield
    print("[SHUTDOWN] Cleaning up...")


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="VAIC 2026 API",
    description="AI-Native backend — VAIC 2026",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "status": "ok",
        "team": "NeuraX.ai",
        "competition": "VAIC 2026",
        "pytorch": torch.__version__,
        "cuda": torch.cuda.is_available(),
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# ─── Registered Routers ───────────────────────────────────────────────────────
from api.routes.audio import router as audio_router
app.include_router(audio_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
