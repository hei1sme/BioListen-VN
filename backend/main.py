"""
VAIC 2026 — FastAPI Backend Boilerplate
Track-agnostic: thêm routes vào sau khi biết đề bài
"""
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

try:
    import torch
except ImportError:
    torch = None

# ─── Startup / Shutdown ───────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup"""
    if torch is not None:
        print(f"[STARTUP] PyTorch version: {torch.__version__}")
        print(f"[STARTUP] CUDA available: {torch.cuda.is_available()}")
    else:
        print("[STARTUP] PyTorch is not installed or blocked; running in fallback mode.")
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

# CORS — allow all origins for hackathon development/deployment compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local storage fallback directory so demo assets are accessible without Supabase.
local_storage_dir = Path(__file__).resolve().parent / "local_storage"
local_storage_dir.mkdir(parents=True, exist_ok=True)
app.mount("/local_storage", StaticFiles(directory=str(local_storage_dir)), name="local_storage")

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
from backend.api.routes.audio import router as audio_router
app.include_router(audio_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
