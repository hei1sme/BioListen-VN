# BioListen VN — AI Lead (Việt) Task Board & Guidelines

**Role:** Huỳnh Quốc Việt (AI Lead) | **Branch:** `feature/ai`  
**Core Stack:** PyTorch, Torchaudio, ONNX, MC-Dropout, Grad-CAM

---

## 📅 Hướng dẫn Lộ trình 48 giờ

### Phase 1: Foundation (Giờ H0–H6 | Thứ Sáu 12:00 – 18:00)
- [ ] **1. Tải và chuẩn bị Dataset (Target: 13:00):**
  - Tải tập dữ liệu **ESC-50** (`git clone https://github.com/karolpiczak/ESC-50.git`).
  - Viết script Python sử dụng thư viện `requests` cào dữ liệu âm thanh từ **Xeno-canto API** cho 5 loài chim phổ biến Việt Nam: Chào mào (*Pycnonotus jocosus*), Sáo đá (*Acridotheres tristis*), Chích chòe (*Copsychus saularis*), Bói cá (*Halcyon smyrnensis*), Ếch nhái (*Microhyla fissipes*).
- [ ] **2. Xây dựng Preprocessing Pipeline (Target: 14:30):**
  - Viết class `AudioDataset` trong file `backend/services/audio_dataset.py`.
  - Quy chuẩn hóa âm thanh đầu vào: Tần số lấy mẫu (sample_rate) `22050Hz`, thời gian `5s` cố định (110,250 samples).
  - Trích xuất Mel-spectrogram (`n_fft=2048`, `hop_length=512`, `n_mels=128`).
  - Resize Mel-spectrogram về kích thước `(224, 224)` và nhân bản (repeat) thành 3 channels màu `(3, 224, 224)` để tương thích hoàn toàn với backbone `EfficientNet-V2-S`.
- [ ] **3. Viết Kiến trúc Model Multi-Task (Target: 16:00):**
  - Code class `BioListenModel` trong `backend/services/biolisten_model.py`.
  - Sử dụng chung backbone `features` của EfficientNet-V2-S có sẵn trong repo.
  - Thiết kế 2 heads riêng biệt: `species_head` (Phân loại 5 loài) và `threat_head` (Phân loại cưa xích/súng/không có mối đe dọa).
- [ ] **4. Huấn luyện Model (Target: 18:00):**
  - Viết file `scripts/train.py` chạy huấn luyện model (chạy 20 epochs). Lưu checkpoint tốt nhất tại `models/biolisten_v1.pt`.

### Phase 2: Integration (Giờ H6–H24 | Thứ Sáu 18:00 – Thứ Bảy 12:00)
- [ ] **1. Tối ưu hóa Model (Target: 20:00):**
  - Kiểm tra độ chính xác trên tập validation. Nếu đạt yêu cầu, xuất model PyTorch sang định dạng `.onnx` và lưu tại `models/biolisten_edge.onnx`.
- [ ] **2. Giả lập tính toán tại Biên (Target: 22:00):**
  - Viết class `ONNXAudioService` trong file `backend/services/onnx_service.py` sử dụng thư viện `onnxruntime` chạy suy luận (inference) model ONNX trên CPU (giả lập Raspberry Pi).
- [ ] **3. Đấu nối API:**
  - Hỗ trợ Hiếu đưa file `ONNXAudioService` thay thế cho mock data trong API `/predict` của FastAPI.
- [ ] **4. Chỉ số sức khỏe hệ sinh thái:**
  - Viết hàm tính toán Chỉ số đa dạng sinh học Shannon-Wiener dựa trên phân phối xác suất các loài chim phát hiện được để trả về cho API.

### Phase 3: Polish & AI Safety (Giờ H24–H36 | Thứ Bảy 12:00 – 23:00)
- [ ] **1. Bayesian Uncertainty (MC-Dropout):**
  - Viết giải thuật chạy model 10 lần với Dropout bật (`model.train()`). Đo lường độ lệch chuẩn (std) của các lần chạy. Nếu std > 0.15, đánh dấu cảnh báo độ tin cậy thấp (Low confidence).
- [ ] **2. Grad-CAM trên Spectrogram:**
  - Viết hàm Grad-CAM lấy activation maps từ lớp convolutional cuối của EfficientNet để vẽ ra ảnh heatmap, chỉ rõ khu vực tần số/thời gian nào trên spectrogram đã kích hoạt quyết định của AI.

---

## 🛠️ Cheat Sheet Kỹ thuật nhanh cho Agent của Việt

Khi Việt dùng AI Agent hỗ trợ code model, hãy bảo Agent của mình:
- **Đọc kỹ file:** `backend/services/pytorch_components.py` để sử dụng đúng cách lazy loading của repo.
- **Cấu hình Audio Mel-spectrogram:**
```python
AUDIO_CONFIG = {
    "sample_rate": 22050,
    "duration_sec": 5,
    "n_fft": 2048,
    "hop_length": 512,
    "n_mels": 128,
}
```
- **Lưu ý Fallback:** Nếu model không hội tụ vào 23:00 tối Thứ Sáu, Việt sẽ đổi sang nạp dataset `PlantVillage` để phân loại bệnh lá cây bằng EfficientNet.
