import os
import time
import wave
import uuid
import tempfile
import random
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel
from backend.services.ai_services import get_llm
from backend.services.supabase_client import (
    is_supabase_configured,
    insert_detection_record,
    fetch_detection_history,
    fetch_health_trend,
    get_storage_bucket,
    upload_storage_file,
    list_storage_files,
    get_storage_public_url,
)

router = APIRouter(prefix="/api/audio", tags=["Audio Monitoring"])

# ─── Pydantic Models for Schema Contracts ──────────────────────────────────────
class TimeWindow(BaseModel):
    start_sec: float
    end_sec: float

class SpeciesDetectionSchema(BaseModel):
    species_id: str
    common_name: str
    confidence: float
    uncertainty: float
    time_window: TimeWindow
    is_confident: bool = True

class ThreatDetectionSchema(BaseModel):
    threat_type: str
    confidence: float
    uncertainty: float
    is_alert: bool = True

class EcosystemHealthSchema(BaseModel):
    shannon_index: float
    species_richness: int
    trend: str
    assessment: str

class AudioPredictionResponse(BaseModel):
    request_id: str
    duration_sec: float
    processing_time_ms: int
    species_detections: List[SpeciesDetectionSchema]
    threat_detections: List[ThreatDetectionSchema]
    ecosystem_health: EcosystemHealthSchema
    spectrogram_base64: str
    gradcam_base64: str
    llm_report: str

class HistoricalRecordSchema(BaseModel):
    id: str
    sensor_id: str
    timestamp: str
    species: List[SpeciesDetectionSchema]
    threats: List[ThreatDetectionSchema]
    shannon_index: float
    is_alert: bool
    llm_report: str
    processing_time_ms: int

class HealthTrendPointSchema(BaseModel):
    timestamp: str
    shannon_index: float
    species_richness: int

class StorageFileSchema(BaseModel):
    path: str
    name: str
    public_url: str
    size: Optional[int] = None
    updated_at: Optional[str] = None

class StorageUploadResponseSchema(BaseModel):
    bucket_id: str
    path: str
    public_url: str
    key: Optional[str] = None

LOCAL_STORAGE_ROOT = Path(__file__).resolve().parent.parent.parent / "local_storage"

# In-Memory Cache for Hackathon Demo persistence
DETECTION_HISTORY: List[HistoricalRecordSchema] = []


def build_detection_record(response: AudioPredictionResponse, sensor_id: str) -> dict:
    return {
        "id": response.request_id,
        "sensor_id": sensor_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "species": [item.dict() for item in response.species_detections],
        "threats": [item.dict() for item in response.threat_detections],
        "shannon_index": response.ecosystem_health.shannon_index,
        "is_alert": len(response.threat_detections) > 0,
        "llm_report": response.llm_report,
        "processing_time_ms": response.processing_time_ms,
    }


# ─── Helper: Get Audio Duration via wave ──────────────────────────────────────
def get_wav_duration(file_path: str) -> float:
    try:
      with wave.open(file_path, 'r') as f:
          frames = f.getnframes()
          rate = f.getframerate()
          return float(frames) / float(rate)
    except Exception:
      return 5.0 # Fallback 5s default

# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/predict", response_model=AudioPredictionResponse)
async def predict_audio(file: UploadFile = File(...)):
    t0 = time.time()
    request_id = str(uuid.uuid4())
    
    # Save temporary file to read audio duration
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        duration = get_wav_duration(tmp_path)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    # Convert filename to lowercase for keyword matching (smart testing hack)
    fn = file.filename.lower()
    
    # Initialise variables
    species_detections = []
    threat_detections = []
    shannon_index = 0.0
    trend = "stable"
    assessment = "Hệ sinh thái ổn định"
    spectrogram_type = "procedural_silent"

    # ─── AI Head 1 & 2 Inference Simulation ─────────────────────────
    # If Viet's PyTorch model is integrated, load and call it here.
    # Otherwise, fallback to keyword matching so frontend demo works seamlessly.
    
    if "chainsaw" in fn or "cua_xich" in fn or "cua" in fn:
        threat_detections.append(
            ThreatDetectionSchema(
                threat_type="chainsaw",
                confidence=0.91,
                uncertainty=0.03,
                is_alert=True
            )
        )
        species_detections.append(
            SpeciesDetectionSchema(
                species_id="acridotheres_tristis",
                common_name="Sáo đá (Common Myna)",
                confidence=0.65,
                uncertainty=0.09,
                time_window=TimeWindow(start_sec=0.5, end_sec=1.8),
                is_confident=True
            )
        )
        shannon_index = 0.54
        trend = "declining"
        assessment = "Hệ sinh thái bị đe dọa nghiêm trọng"
        spectrogram_type = "procedural_chainsaw"

    elif "gunshot" in fn or "sung" in fn or "shot" in fn:
        threat_detections.append(
            ThreatDetectionSchema(
                threat_type="gunshot",
                confidence=0.95,
                uncertainty=0.02,
                is_alert=True
            )
        )
        shannon_index = 0.00
        trend = "declining"
        assessment = "Suy kiệt sinh học đột ngột"
        spectrogram_type = "procedural_gunshot"

    elif "storm" in fn or "sam_set" in fn or "thunder" in fn:
        species_detections.append(
            SpeciesDetectionSchema(
                species_id="microhyla_fissipes",
                common_name="Ếch nhái Ornate (Narrow-mouthed Frog)",
                confidence=0.48,
                uncertainty=0.17,
                time_window=TimeWindow(start_sec=3.0, end_sec=4.8),
                is_confident=False
            )
        )
        shannon_index = 0.98
        trend = "fluctuating"
        assessment = "Tín hiệu bị nhiễu do thời tiết"
        spectrogram_type = "procedural_storm"

    elif "dawn" in fn or "morning" in fn or "bird" in fn or "chim" in fn:
        species_detections.append(
            SpeciesDetectionSchema(
                species_id="pycnonotus_jocosus",
                common_name="Chào mào (Red-whiskered Bulbul)",
                confidence=0.94,
                uncertainty=0.02,
                time_window=TimeWindow(start_sec=1.0, end_sec=3.5),
                is_confident=True
            )
        )
        species_detections.append(
            SpeciesDetectionSchema(
                species_id="copsychus_saularis",
                common_name="Chích chòe (Oriental Magpie-Robin)",
                confidence=0.88,
                uncertainty=0.04,
                time_window=TimeWindow(start_sec=2.2, end_sec=4.8),
                is_confident=True
            )
        )
        shannon_index = 1.62
        trend = "stable"
        assessment = "Hệ sinh thái phong phú, đa dạng cao"
        spectrogram_type = "procedural_birds"

    else:
        # Default: Random normal day noise
        species_detections.append(
            SpeciesDetectionSchema(
                species_id="pycnonotus_jocosus",
                common_name="Chào mào (Red-whiskered Bulbul)",
                confidence=0.84,
                uncertainty=0.04,
                time_window=TimeWindow(start_sec=1.5, end_sec=4.0),
                is_confident=True
            )
        )
        shannon_index = 1.10
        trend = "stable"
        assessment = "Hệ sinh thái ổn định"
        spectrogram_type = "procedural_birds"

    # ─── Groq Llama 3.1 Report Generation ───────────────────────────
    # Combine findings into prompts
    threat_text = ", ".join([f"{t.threat_type} (Độ tin cậy: {t.confidence:.0%})" for t in threat_detections]) or "Không có"
    species_text = ", ".join([f"{s.common_name} (Độ tin cậy: {s.confidence:.0%})" for s in species_detections]) or "Không phát hiện loài đặc trưng"
    
    prompt = f"""
    Bạn là một trợ lý AI phân tích sinh thái học và giám sát an ninh rừng quốc gia Cúc Phương.
    Hãy dịch các kết quả phân tích âm thanh dưới đây thành một bản tin cảnh báo/báo cáo hành động ngắn gọn cho Kiểm lâm (bằng tiếng Việt, tối đa 3-4 câu).

    - Mối đe dọa (Head 2): {threat_text}
    - Loài phát hiện (Head 1): {species_text}
    - Chỉ số Sức khỏe Shannon: {shannon_index} (Đánh giá: {assessment})
    - Xu hướng: {trend}

    Quy tắc báo cáo:
    1. Nếu có mối đe dọa (cưa xích - chainsaw hoặc súng - gunshot): Đưa ra cảnh báo khẩn cấp đầu tiên bằng ký tự '🚨 CẢNH BÁO ĐỎ:' hoặc '🚨 KHẨN CẤP:'. Yêu cầu kiểm lâm di chuyển khẩn cấp kiểm tra.
    2. Nếu không có mối đe dọa: Báo cáo tình trạng bình thường, ghi nhận các hoạt động sinh học chim muông.
    3. Giọng văn nghiêm túc, ngắn gọn, hướng hành động kiểm lâm.
    """

    try:
        llm = get_llm()
        llm_report = llm.quick(prompt=prompt, system="Bạn là chuyên gia phân tích an ninh kiểm lâm Cúc Phương.")
    except Exception as e:
        # Fallback explanation if Groq key is not configured yet
        if len(threat_detections) > 0:
            llm_report = f"🚨 KHẨN CẤP: Ghi nhận {threat_text} tại khu vực giám sát. Chỉ số đa dạng sinh học sụt giảm nghiêm trọng ({shannon_index}). Yêu cầu kiểm lâm phụ trách trạm di chuyển kiểm tra tọa độ khẩn cấp."
        else:
            llm_report = f"Hệ sinh thái hoạt động ổn định. Phát hiện tiếng kêu sinh học của {species_text}. Không phát hiện tạp âm nhân tạo xâm hại rừng."

    processing_time_ms = int((time.time() - t0) * 1000)

    # Create Response Object
    response = AudioPredictionResponse(
        request_id=request_id,
        duration_sec=duration,
        processing_time_ms=processing_time_ms,
        species_detections=species_detections,
        threat_detections=threat_detections,
        ecosystem_health=EcosystemHealthSchema(
            shannon_index=shannon_index,
            species_richness=len(species_detections),
            trend=trend,
            assessment=assessment
        ),
        spectrogram_base64=spectrogram_type,
        gradcam_base64=spectrogram_type + "_cam" if len(threat_detections) > 0 or len(species_detections) > 0 else "",
        llm_report=llm_report
    )

    # Save to history log
    sensor_id = random.choice(["demo-sensor-1", "demo-sensor-2", "demo-sensor-3"])
    record = build_detection_record(response, sensor_id)

    if is_supabase_configured():
        try:
            insert_detection_record(record)
        except Exception as exc:
            # Log Supabase error but preserve demo behavior
            print(f"[Supabase] insert failed: {exc}")
            DETECTION_HISTORY.insert(0, HistoricalRecordSchema(**record))
    else:
        DETECTION_HISTORY.insert(0, HistoricalRecordSchema(**record))

    return response

@router.get("/history", response_model=List[HistoricalRecordSchema])
async def get_history(sensor_id: Optional[str] = None, limit: int = 50):
    if is_supabase_configured():
        try:
            rows = fetch_detection_history(limit=limit, sensor_id=sensor_id)
            return [HistoricalRecordSchema(**row) for row in rows]
        except Exception as exc:
            print(f"[Supabase] history fetch failed: {exc}")

    if sensor_id:
        return [h for h in DETECTION_HISTORY if h.sensor_id == sensor_id][:limit]
    return DETECTION_HISTORY[:limit]

@router.get("/health-trend", response_model=List[HealthTrendPointSchema])
async def get_health_trend(days: int = 7):
    if is_supabase_configured():
        try:
            rows = fetch_health_trend(days=days)
            return [HealthTrendPointSchema(**row) for row in rows]
        except Exception as exc:
            print(f"[Supabase] health trend fetch failed: {exc}")

    # Returns 7 mock data points for Recharts area rendering
    points = []
    current_time = time.time()
    for i in range(days):
        hr = time.strftime("%H:%M", time.localtime(current_time - (days - 1 - i) * 7200))
        points.append(
            HealthTrendPointSchema(
                timestamp=hr,
                shannon_index=round(random.uniform(1.2, 1.8), 2),
                species_richness=random.randint(3, 5)
            )
        )
    # If active alert is present, drop the last index point to simulate decline
    if len(DETECTION_HISTORY) > 0 and DETECTION_HISTORY[0].is_alert:
        points[-1].shannon_index = 0.54
        points[-1].species_richness = 1
    return points


def _sanitize_bucket_id(bucket_id: str) -> str:
    bucket_id = bucket_id.strip()
    if not bucket_id or any(sep in bucket_id for sep in ("/", "\\")):
        raise HTTPException(400, "Invalid bucket_id.")
    return bucket_id


def _sanitize_storage_path(storage_path: str) -> str:
    if not storage_path or storage_path.strip() == "":
        raise HTTPException(400, "Storage path is required.")

    normalized = Path(storage_path.replace("\\", "/"))
    if normalized.is_absolute() or any(part == ".." for part in normalized.parts):
        raise HTTPException(400, "Invalid storage path.")

    return "/".join(normalized.parts)


def _ensure_local_storage_dir(bucket_id: str, storage_path: str) -> Path:
    bucket_id = _sanitize_bucket_id(bucket_id)
    storage_path = _sanitize_storage_path(storage_path)
    path = LOCAL_STORAGE_ROOT / bucket_id / os.path.dirname(storage_path)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _save_local_storage_file(bucket_id: str, storage_path: str, content: bytes) -> str:
    bucket_id = _sanitize_bucket_id(bucket_id)
    storage_path = _sanitize_storage_path(storage_path)
    directory = _ensure_local_storage_dir(bucket_id, storage_path)
    full_path = directory / os.path.basename(storage_path)
    full_path.write_bytes(content)
    return f"/local_storage/{bucket_id}/{storage_path}"


def _list_local_storage_files(bucket_id: str, path: Optional[str] = None) -> List[dict]:
    bucket_id = _sanitize_bucket_id(bucket_id)
    path = _sanitize_storage_path(path) if path else ""
    root = LOCAL_STORAGE_ROOT / bucket_id
    results: List[dict] = []
    if not root.exists():
        return results
    search_root = root / path
    if not search_root.exists():
        return results
    for file_path in search_root.rglob("*"):
        if file_path.is_file():
            rel = file_path.relative_to(root)
            results.append(
                {
                    "name": str(rel).replace("\\", "/"),
                    "id": str(rel).replace("\\", "/"),
                    "size": file_path.stat().st_size,
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(file_path.stat().st_mtime)),
                    "public_url": f"/local_storage/{bucket_id}/{str(rel).replace('\\', '/')}"
                }
            )
    return results


@router.post("/storage/upload", response_model=StorageUploadResponseSchema)
async def upload_audio_asset(
    file: UploadFile = File(...),
    bucket_id: str = "demo-assets",
):
    filename = os.path.basename(file.filename)
    if filename == "":
        raise HTTPException(400, "File must include a filename.")

    storage_path = f"samples/{filename}"
    file_content = await file.read()
    if len(file_content) == 0:
        raise HTTPException(400, "Uploaded file is empty.")

    if is_supabase_configured():
        try:
            get_storage_bucket(bucket_id)
            result = upload_storage_file(
                bucket_id,
                storage_path,
                file_content,
                {
                    "content-type": file.content_type or "application/octet-stream",
                    "upsert": True,
                },
            )
            public_url = get_storage_public_url(bucket_id, storage_path)
            key = result.get("Key") if isinstance(result, dict) else None
        except Exception as exc:
            print(f"[Storage] Supabase upload failed, falling back to local storage: {exc}")
            public_url = _save_local_storage_file(bucket_id, storage_path, file_content)
            key = None
    else:
        public_url = _save_local_storage_file(bucket_id, storage_path, file_content)
        key = None

    return StorageUploadResponseSchema(
        bucket_id=bucket_id,
        path=storage_path,
        public_url=public_url,
        key=key,
    )


@router.get("/storage/list", response_model=List[StorageFileSchema])
async def get_audio_storage_files(bucket_id: str = "demo-assets", path: Optional[str] = None):
    if is_supabase_configured():
        try:
            get_storage_bucket(bucket_id)
            raw_items = list_storage_files(bucket_id, path)
            items: List[StorageFileSchema] = []
            for item in raw_items:
                file_path = item.get("name") or item.get("id") or ""
                if not file_path:
                    continue
                items.append(
                    StorageFileSchema(
                        path=file_path,
                        name=os.path.basename(file_path),
                        public_url=get_storage_public_url(bucket_id, file_path),
                        size=item.get("size"),
                        updated_at=item.get("updated_at") or item.get("last_modified"),
                    )
                )
            return items
        except Exception as exc:
            print(f"[Storage] Supabase listing failed, falling back to local storage: {exc}")
            raw_items = _list_local_storage_files(bucket_id, path)
    else:
        raw_items = _list_local_storage_files(bucket_id, path)

    return [
        StorageFileSchema(
            path=item["id"],
            name=os.path.basename(item["id"]),
            public_url=item["public_url"],
            size=item.get("size"),
            updated_at=item.get("updated_at"),
        )
        for item in raw_items
    ]


@router.get("/storage/download")
async def download_audio_asset(bucket_id: str = "demo-assets", path: Optional[str] = None):
    bucket_id = _sanitize_bucket_id(bucket_id)
    if not path:
        raise HTTPException(400, "Storage path is required.")
    storage_path = _sanitize_storage_path(path)
    local_path = LOCAL_STORAGE_ROOT / bucket_id / storage_path

    if local_path.exists() and local_path.is_file():
        return FileResponse(local_path, filename=os.path.basename(local_path))

    if is_supabase_configured():
        try:
            get_storage_bucket(bucket_id)
            public_url = get_storage_public_url(bucket_id, storage_path)
            return RedirectResponse(public_url)
        except Exception as exc:
            raise HTTPException(404, f"Asset not found locally, and Supabase storage access failed: {exc}")

    raise HTTPException(404, "Storage asset not found.")
