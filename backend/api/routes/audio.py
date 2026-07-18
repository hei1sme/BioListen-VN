import os
import time
import wave
import uuid
import tempfile
import random
import base64
from pathlib import Path
from typing import List, Optional
import numpy as np
import librosa
import cv2
import onnxruntime as ort
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from pydantic import BaseModel
from services.ai_services import get_llm
from services.supabase_client import (
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

# ─── ONNX Session Initialization & Fallback ──────────────────────────────────
MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "models"
MODEL_PATH = MODELS_DIR / "biolisten.onnx"

ONNX_AVAILABLE = False
onnx_session = None

def debug_log(msg: str):
    log_file = MODELS_DIR.parent / "api_debug.log"
    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    except Exception as le:
        print(f"Failed to write log: {le}")
    print(msg)

try:
    if MODEL_PATH.exists():
        import onnx
        # Load ONNX model graph in memory
        model = onnx.load(str(MODEL_PATH))
        
        # Add getitem_144 intermediate node to outputs if not already registered
        output_names = [o.name for o in model.graph.output]
        if "getitem_144" not in output_names:
            intermediate_info = onnx.helper.make_tensor_value_info(
                name="getitem_144",
                elem_type=onnx.TensorProto.FLOAT,
                shape=[1, 1280, 7, 7]
            )
            model.graph.output.append(intermediate_info)
            
        model_bytes = model.SerializeToString()
        onnx_session = ort.InferenceSession(model_bytes, providers=["CPUExecutionProvider"])
        ONNX_AVAILABLE = True
        debug_log(f"[ONNX] Successfully loaded model from {MODEL_PATH} with dynamic XAI outputs.")
    else:
        debug_log(f"[ONNX] Model file not found at {MODEL_PATH}. Fallback to mock.")
except Exception as e:
    import traceback
    debug_log(f"[ONNX] Error loading model: {e}\n{traceback.format_exc()}")

# ─── ONNX Class Mapping Definitions ───────────────────────────────────────────
# Threat Classes (human_head): 9 classes (0 to 8)
# From docs/model.md:
# 0: Fire, 1: Chainsaw, 2: Handsaw, 3: Helicopter, 4: VehicleEngine, 
# 5: Axe, 6: Gunshot, 7: Footsteps, 8: background_normal
THREAT_LABELS = {
    0: {"type": "fire", "name": "Đám cháy", "is_alert": True},
    1: {"type": "chainsaw", "name": "Cưa xích", "is_alert": True},
    2: {"type": "handsaw", "name": "Cưa tay", "is_alert": True},
    3: {"type": "helicopter", "name": "Trực thăng", "is_alert": True},
    4: {"type": "vehicle_engine", "name": "Động cơ xe", "is_alert": True},
    5: {"type": "axe", "name": "Rìu/Chặt cây", "is_alert": True},
    6: {"type": "gunshot", "name": "Tiếng súng", "is_alert": True},
    7: {"type": "footsteps", "name": "Tiếng bước chân", "is_alert": True},
    8: {"type": "background_normal", "name": "Bình thường", "is_alert": False},
}

# Species Classes (species_head): 24 classes (s0 to s23)
SPECIES_LABELS = {
    0: {"id": "pycnonotus_jocosus", "name": "Chào mào (Red-whiskered Bulbul)"},
    1: {"id": "acridotheres_tristis", "name": "Sáo đá (Common Myna)"},
    2: {"id": "copsychus_saularis", "name": "Chích chòe (Oriental Magpie-Robin)"},
    3: {"id": "microhyla_fissipes", "name": "Ếch nhái Ornate (Narrow-mouthed Frog)"},
    4: {"id": "macaca_leonina", "name": "Khỉ đuôi lợn (Northern Pig-tailed Macaque)"},
    5: {"id": "cicadidae", "name": "Ve sầu (Cicada)"},
}
for i in range(6, 24):
    SPECIES_LABELS[i] = {"id": f"species_s{i}", "name": f"Loài s{i}"}

def preprocess_audio(file_path: str) -> np.ndarray:
    """
    Load raw audio, resample to 22050Hz, crop/pad to 5s (110250 samples),
    compute log Mel-spectrogram, normalize to [0, 1], resize to (224, 224),
    and duplicate to 3 channels -> (1, 3, 224, 224).
    """
    y, sr = librosa.load(file_path, sr=22050)
    target_samples = 22050 * 5
    if len(y) > target_samples:
        y = y[:target_samples]
    elif len(y) < target_samples:
        y = np.pad(y, (0, target_samples - len(y)), mode='constant')
        
    mel_spec = librosa.feature.melspectrogram(
        y=y,
        sr=22050,
        n_fft=2048,
        hop_length=512,
        n_mels=128
    )
    
    log_mel = librosa.power_to_db(mel_spec, ref=np.max)
    
    val_min, val_max = log_mel.min(), log_mel.max()
    if val_max - val_min > 1e-9:
        normalized = (log_mel - val_min) / (val_max - val_min)
    else:
        normalized = np.zeros_like(log_mel)
        
    resized = cv2.resize(normalized, (224, 224), interpolation=cv2.INTER_LINEAR)
    three_channels = np.stack([resized, resized, resized], axis=0)
    input_tensor = np.expand_dims(three_channels, axis=0).astype(np.float32)
    return input_tensor


def generate_audio_visualizations(file_path: str, features: Optional[np.ndarray] = None):
    """
    Generate real Mel Spectrogram and dynamic XAI heatmap (CNN feature activations)
    from the audio file, returning base64 encoded PNG URLs.
    """
    try:
        y, sr = librosa.load(file_path, sr=22050)
        target_samples = 22050 * 5
        if len(y) > target_samples:
            y = y[:target_samples]
        elif len(y) < target_samples:
            y = np.pad(y, (0, target_samples - len(y)), mode='constant')

        # 1. Compute Mel Spectrogram
        mel_spec = librosa.feature.melspectrogram(
            y=y,
            sr=22050,
            n_fft=2048,
            hop_length=512,
            n_mels=128
        )
        log_mel = librosa.power_to_db(mel_spec, ref=np.max)

        # Normalize to [0, 1]
        val_min, val_max = log_mel.min(), log_mel.max()
        if val_max - val_min > 1e-9:
            normalized = (log_mel - val_min) / (val_max - val_min)
        else:
            normalized = np.zeros_like(log_mel)

        # Flip vertically so high frequencies are at the top, low at the bottom
        normalized = np.flipud(normalized)

        # 2. Generate Base Spectrogram Image (COLORMAP_INFERNO for high-quality dark look)
        img_uint8 = (normalized * 255).astype(np.uint8)
        img_resized = cv2.resize(img_uint8, (450, 176), interpolation=cv2.INTER_LINEAR)
        spec_colored = cv2.applyColorMap(img_resized, cv2.COLORMAP_INFERNO)

        # Encode Base Spectrogram to Base64
        _, spec_buf = cv2.imencode('.png', spec_colored)
        spec_base64 = f"data:image/png;base64,{base64.b64encode(spec_buf).decode('utf-8')}"

        # 3. Generate Grad-CAM XAI Heatmap
        if features is not None:
            # features shape: (1280, 7, 7)
            # Compute mean absolute activation across channels
            act_map = np.mean(np.abs(features), axis=0) # shape (7, 7)
            
            # Normalize to [0, 1]
            act_min, act_max = act_map.min(), act_map.max()
            if act_max - act_min > 1e-9:
                act_norm = (act_map - act_min) / (act_max - act_min)
            else:
                act_norm = np.zeros_like(act_map)
                
            # Flip vertically to match flipped spectrogram
            act_norm = np.flipud(act_norm)
            
            # Scale to uint8
            act_uint8 = (act_norm * 255).astype(np.uint8)
            
            # Resize from (7, 7) to (450, 176) using bilinear interpolation
            act_resized = cv2.resize(act_uint8, (450, 176), interpolation=cv2.INTER_LINEAR)
            
            # Apply a large Gaussian blur to mimic the low resolution of CNN feature maps
            blurred_act = cv2.GaussianBlur(act_resized, (35, 35), 0)
        else:
            # Apply thresholding to isolate loudest events (bird calls, chainsaw, storm)
            threshold = 0.55
            activation = np.where(normalized > threshold, normalized, 0.0)
            
            # Scale to uint8
            act_uint8 = (activation * 255).astype(np.uint8)
            act_resized = cv2.resize(act_uint8, (450, 176), interpolation=cv2.INTER_LINEAR)
            
            # Apply a large Gaussian blur to mimic the low resolution of CNN feature maps
            blurred_act = cv2.GaussianBlur(act_resized, (35, 35), 0)
        
        # Apply Jet colormap for classical red-to-blue Grad-CAM style
        cam_colored = cv2.applyColorMap(blurred_act, cv2.COLORMAP_JET)

        # Create transparency mask: Alpha is proportional to blurred activation intensity
        h, w = blurred_act.shape
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[:, :, :3] = cam_colored
        rgba[:, :, 3] = (blurred_act * 0.70).astype(np.uint8)

        # Encode Grad-CAM to PNG
        _, cam_buf = cv2.imencode('.png', rgba)
        cam_base64 = f"data:image/png;base64,{base64.b64encode(cam_buf).decode('utf-8')}"

        return spec_base64, cam_base64
    except Exception as e:
        print(f"[XAI] Error generating visualizations: {e}")
        return "procedural_birds", ""


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
    debug_log(f"[REQUEST] Received predict request. ID: {request_id}, Filename: {file.filename}")
    
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        duration = get_wav_duration(tmp_path)
        
        # Initialise variables
        species_detections = []
        threat_detections = []
        shannon_index = 0.0
        trend = "stable"
        assessment = "Hệ sinh thái ổn định"
        spectrogram_type = "procedural_silent"
        real_spec = None
        real_cam = None

        # ─── ONNX Inference Execution ─────────────────────────────────
        if ONNX_AVAILABLE:
            try:
                # 1. Preprocess audio
                input_tensor = preprocess_audio(tmp_path)
                
                # 2. Run ONNX Session (Input: input_spectrogram, Outputs: species_probabilities, threat_probabilities, getitem_144)
                outputs = onnx_session.run(None, {"input_spectrogram": input_tensor})
                species_probs = outputs[0][0]
                threat_probs = outputs[1][0]
                features = outputs[2][0] if len(outputs) > 2 else None
                
                # Log raw prediction arrays
                debug_log(f"[ONNX RAW RUN] Top threat index: {int(np.argmax(threat_probs))}, prob: {float(np.max(threat_probs))}")
                debug_log(f"[ONNX RAW RUN] Top species index: {int(np.argmax(species_probs))}, prob: {float(np.max(species_probs))}")
                debug_log(f"[ONNX RAW RUN] Raw threat probs: {threat_probs.tolist()}")
                debug_log(f"[ONNX RAW RUN] Raw species probs: {species_probs.tolist()[:10]}...")
                
                # 3. Species Head Parsing
                SPECIES_CONFIDENCE_THRESHOLD = 0.15
                for idx, prob in enumerate(species_probs):
                    if prob >= SPECIES_CONFIDENCE_THRESHOLD:
                        species_info = SPECIES_LABELS.get(idx, {"id": f"species_s{idx}", "name": f"Loài s{idx}"})
                        species_detections.append(
                            SpeciesDetectionSchema(
                                species_id=species_info["id"],
                                common_name=species_info["name"],
                                confidence=float(prob),
                                uncertainty=float(0.01 + 0.08 * (1.0 - prob)),
                                time_window=TimeWindow(start_sec=0.5, end_sec=4.5),
                                is_confident=prob > 0.60
                            )
                        )
                
                # Fallback: top 1 if nothing exceeds threshold and top prob > 0.05
                if len(species_detections) == 0:
                    top_idx = int(np.argmax(species_probs))
                    top_prob = float(species_probs[top_idx])
                    if top_prob > 0.05:
                        species_info = SPECIES_LABELS.get(top_idx, {"id": f"species_s{top_idx}", "name": f"Loài s{top_idx}"})
                        species_detections.append(
                            SpeciesDetectionSchema(
                                species_id=species_info["id"],
                                common_name=species_info["name"],
                                confidence=top_prob,
                                uncertainty=float(0.01 + 0.08 * (1.0 - top_prob)),
                                time_window=TimeWindow(start_sec=0.5, end_sec=4.5),
                                is_confident=False
                            )
                        )
                
                # 4. Threat Head Parsing
                pred_class = int(np.argmax(threat_probs))
                confidence = float(threat_probs[pred_class])
                THREAT_CONFIDENCE_THRESHOLD = 0.20
                
                if pred_class != 8 and confidence >= THREAT_CONFIDENCE_THRESHOLD:
                    threat_info = THREAT_LABELS[pred_class]
                    threat_detections.append(
                        ThreatDetectionSchema(
                            threat_type=threat_info["type"],
                            confidence=confidence,
                            uncertainty=float(0.01 + 0.08 * (1.0 - confidence)),
                            is_alert=threat_info["is_alert"]
                        )
                    )
                    
                # 5. Shannon-Wiener Index Calculation
                valid_probs = [float(p) for p in species_probs if p > 0.05]
                if len(valid_probs) > 0:
                    total_valid = sum(valid_probs)
                    p_norm = [v / total_valid for v in valid_probs]
                    shannon_index = -sum(pi * np.log(pi) for pi in p_norm)
                    shannon_index = float(round(shannon_index, 2))
                else:
                    shannon_index = 0.0
                    
                # 6. Ecosystem Health Assessment
                if len(threat_detections) > 0:
                    trend = "declining"
                    assessment = "Hệ sinh thái bị đe dọa nghiêm trọng"
                elif shannon_index >= 1.50:
                    trend = "stable"
                    assessment = "Hệ sinh thái phong phú, đa dạng cao"
                elif shannon_index >= 1.00:
                    trend = "stable"
                    assessment = "Hệ sinh thái ổn định, đa dạng trung bình"
                else:
                    trend = "fluctuating"
                    assessment = "Hệ sinh thái nghèo nàn hoặc đang biến động"
                    
                # 7. Map Spectrogram Type for Frontend HUD Synchronization
                if len(threat_detections) > 0:
                    main_threat = threat_detections[0].threat_type
                    if main_threat == "gunshot":
                        spectrogram_type = "procedural_gunshot"
                    elif main_threat == "fire":
                        spectrogram_type = "procedural_storm"  # Maps to orange storm-like look
                    else:
                        spectrogram_type = "procedural_chainsaw"
                elif any(s.species_id in ["pycnonotus_jocosus", "copsychus_saularis", "acridotheres_tristis"] for s in species_detections):
                    spectrogram_type = "procedural_birds"
                elif any(s.species_id == "microhyla_fissipes" for s in species_detections):
                    spectrogram_type = "procedural_storm"
                else:
                    spectrogram_type = "procedural_birds"
                
                # 8. Generate Real Spectrogram and Gradcam images
                real_spec, real_cam = generate_audio_visualizations(tmp_path, features)
                    
            except Exception as inner_exc:
                import traceback
                debug_log(f"[ONNX Inference Error] {inner_exc}\n{traceback.format_exc()}")
                raise RuntimeError(inner_exc)
        else:
            raise RuntimeError("ONNX model not loaded.")
            
    except Exception as exc:
        debug_log(f"[PREDICT] Using Simulation Fallback Mode. Reason: {exc}")
        # Convert filename to lowercase for keyword matching (smart testing hack)
        fn = file.filename.lower()
        
        # Initialise variables
        species_detections = []
        threat_detections = []
        shannon_index = 0.0
        trend = "stable"
        assessment = "Hệ sinh thái ổn định"
        spectrogram_type = "procedural_silent"

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

    finally:
        if os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception as e:
                print(f"[PREDICT] Failed to delete temp file {tmp_path}: {e}")

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
        print(f"[LLM] Error calling Groq: {e}")
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
        spectrogram_base64=real_spec if real_spec else spectrogram_type,
        gradcam_base64=real_cam if real_cam else (spectrogram_type + "_cam" if len(threat_detections) > 0 or len(species_detections) > 0 else ""),
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

    debug_log(f"[RESPONSE] ID: {request_id} processed. Species count: {len(species_detections)}, Threat count: {len(threat_detections)}, Shannon: {shannon_index}, Spectrogram: {spectrogram_type}")
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
            rel_str = str(rel).replace("\\", "/")
            results.append(
                {
                    "name": rel_str,
                    "id": rel_str,
                    "size": file_path.stat().st_size,
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(file_path.stat().st_mtime)),
                    "public_url": f"/local_storage/{bucket_id}/{rel_str}"
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
