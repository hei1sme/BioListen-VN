# BioListen VN — Software Engineer & Deploy (Hiếu) Task Board & Guidelines

**Role:** Hồ Minh Hiếu (SE) | **Branch:** `feature/api`  
**Core Stack:** FastAPI, Supabase (PostgreSQL & Storage), Docker, Railway, Vercel Config, REST Client  
**Technical Plan:** [docs/BIOLISTEN_PLAN.md](../BIOLISTEN_PLAN.md)

---

## 📅 Hướng dẫn Lộ trình 48 giờ

### Phase 1: Foundation (Giờ H0–H6 | Thứ Sáu 12:00 – 18:00)
- [ ] **1. Đăng ký Router mới (Target: 13:00):**
  - Tạo file `backend/api/routes/audio.py` trong FastAPI.
  - Định nghĩa các schema Pydantic: `PredictRequest` (file upload), `PredictResponse` (chứa species, threats, health_index, spectrogram_base64, gradcam_base64, llm_report).
- [ ] **2. Tích hợp Router vào App (Target: 15:30):**
  - Import và khai báo `audio.py` vào file `backend/main.py`.
  - Cập nhật file `backend/requirements.txt` thêm `torchaudio`, `librosa`, và `onnxruntime`.
- [ ] **3. Triển khai Mock Endpoint (Target: 14:00):**
  - Viết code mock dữ liệu dự đoán trả về ngẫu nhiên các loại chim và threat (chainsaw/gunshot) để Hưng đấu nối frontend.
- [ ] **4. Thiết lập Supabase Database (Target: 17:00):**
  - Đăng ký project Supabase. Tạo bảng `detections` (lưu vết phân tích) và `sensors` (dữ liệu vị trí địa lý trạm) bằng cách chạy script SQL dưới đây trong SQL Editor của Supabase:
    ```sql
    CREATE TABLE detections (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      sensor_id TEXT NOT NULL DEFAULT 'demo-sensor-1',
      timestamp TIMESTAMPTZ DEFAULT now(),
      audio_url TEXT,
      species JSONB NOT NULL DEFAULT '[]',
      threats JSONB NOT NULL DEFAULT '[]',
      shannon_index FLOAT,
      is_alert BOOLEAN DEFAULT false,
      llm_report TEXT,
      processing_time_ms INT
    );

    CREATE TABLE sensors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      lat FLOAT NOT NULL,
      lng FLOAT NOT NULL,
      park_name TEXT,
      status TEXT DEFAULT 'active'
    );

    INSERT INTO sensors VALUES
      ('demo-sensor-1', 'Trạm A - Suối Lớn', 20.2373, 105.6157, 'Cúc Phương', 'active'),
      ('demo-sensor-2', 'Trạm B - Đỉnh Mây', 20.2410, 105.6200, 'Cúc Phương', 'active'),
      ('demo-sensor-3', 'Trạm C - Rừng Già', 20.2350, 105.6100, 'Cúc Phương', 'active');
    ```
- [ ] **5. Deploy thử nghiệm (Target: 18:00):**
  - Triển khai backend FastAPI trống lên Railway để xác nhận live API url hoạt động bình thường, không lỗi CORS.

### Phase 2: Integration (Giờ H6–H24 | Thứ Sáu 18:00 – Thứ Bảy 12:00)
- [ ] **1. Lưu vết lịch sử phân tích:**
  - Viết logic lưu bản ghi phân tích vào bảng `detections` của Supabase mỗi khi client gọi `/predict`.
- [ ] **2. Viết API Lịch sử & Analytics (Target: 22:00):**
  - Code endpoint `GET /api/audio/history` và `GET /api/audio/health-trend` đọc từ database Supabase để gửi dữ liệu cho Hưng vẽ biểu đồ.
- [ ] **3. Cấu hình môi trường (ENV):**
  - Thiết lập liên kết giữa Vercel (Frontend) và Railway (Backend) thông qua file `frontend/vercel.json`. Cấu hình đúng `NEXT_PUBLIC_API_URL`.
- [ ] **4. Nộp Checkpoint 1 (Hạn chốt 11:00 Thứ Bảy):**
  - Đảm bảo Việt/Hiếu điền và nộp thông tin dự án BioListen VN lên platform của BTC.

### Phase 3: Polish & Deploy (Giờ H24–H36 | Thứ Bảy 12:00 – 23:00)
- [ ] **1. Supabase Storage cho Demo Assets:**
  - Tạo bucket trong Supabase Storage để lưu trữ 5 file audio test mẫu cho bộ Simulator.
- [ ] **2. Backup ngrok:**
  - Viết script run ngrok nhanh để làm phương án backup nếu Railway bị quá tải giới hạn gói cước miễn phí trong buổi demo.
- [ ] **3. Clean code & Public repo (Target: 21:00):**
  - Xóa toàn bộ API keys hay mật khẩu trong code trước khi chuyển trạng thái repository sang **Public** để nộp bài.
- [ ] **4. Nộp Checkpoint 2 (Hạn chốt 23:00 Thứ Bảy):**
  - Kiểm tra kỹ càng live URL và link GitHub, thực hiện submit đúng hạn.

---

## 🛠️ Hướng dẫn nhanh cho Agent của Hiếu

Khi Hiếu dùng AI Agent hỗ trợ code hệ thống, hãy bảo Agent của mình:
- **Đọc kỹ file:** `backend/main.py` và `backend/config.py` để lấy đúng cấu hình biến môi trường của Groq và Supabase.
- **REST Client Testing:** Viết thêm các test request vào file `backend/api_tests.http` để kiểm tra nhanh các API endpoint mới viết mà không cần mở Postman.
- **API Contract mẫu cho `/predict`:**
  ```json
  {
    "request_id": "string",
    "duration_sec": 5.0,
    "processing_time_ms": 120,
    "species_detections": [
      {
        "species_id": "string",
        "common_name": "string",
        "confidence": 0.95,
        "uncertainty": 0.02,
        "time_window": { "start_sec": 1.0, "end_sec": 4.0 },
        "is_confident": true
      }
    ],
    "threat_detections": [
      {
        "threat_type": "chainsaw",
        "confidence": 0.91,
        "uncertainty": 0.04,
        "is_alert": true
      }
    ],
    "ecosystem_health": {
      "shannon_index": 1.5,
      "species_richness": 3,
      "trend": "stable",
      "assessment": "string"
    },
    "spectrogram_base64": "string_base64_image",
    "gradcam_base64": "string_base64_image",
    "llm_report": "string"
  }
  ```
- **Lưu ý Fallback:** Nếu tối Thứ Sáu team quyết định pivot sang Điện Biên Agriculture, Hiếu sẽ điều chỉnh router sang nhận file ảnh thay vì file audio. Mọi logic deploy và database giữ nguyên 90%.
