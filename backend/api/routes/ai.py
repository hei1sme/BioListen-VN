"""
Generic AI router — placeholder
Thay thế nội dung sau khi biết track
"""
from fastapi import APIRouter, UploadFile, File, Depends
from pydantic import BaseModel
import tempfile
import os

router = APIRouter(tags=["AI"])


# ─── Models ───────────────────────────────────────────────────────────────────
class TextRequest(BaseModel):
    text: str
    language: str = "vi"

class TextResponse(BaseModel):
    result: str
    confidence: float | None = None


# ─── Routes ───────────────────────────────────────────────────────────────────
@router.post("/analyze", response_model=TextResponse)
async def analyze_text(req: TextRequest):
    """
    Generic text analysis endpoint.
    TODO: Replace with actual AI logic after picking track.
    """
    from services.ai_services import get_llm
    llm = get_llm()
    result = llm.quick(
        prompt=req.text,
        system="Bạn là trợ lý AI hỗ trợ phân tích. Trả lời bằng tiếng Việt."
    )
    return TextResponse(result=result)


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Speech-to-text bằng Whisper (PyTorch).
    Hữu ích cho: Giáo dục, Y tế, SME voice commands
    """
    from services.ai_services import get_whisper
    
    # Save uploaded file temporarily
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        whisper = get_whisper()
        result = whisper.transcribe(tmp_path, language="vi")
        return {"text": result["text"], "segments": result["segments"]}
    finally:
        os.unlink(tmp_path)
