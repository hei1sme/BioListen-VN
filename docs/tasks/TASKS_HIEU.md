# BioListen VN — Software Engineer & Deploy (Hiếu) Task Board & Guidelines

**Role:** Hồ Minh Hiếu (SE) | **Branch:** `feature/api`  
**Core Stack:** FastAPI, Supabase (PostgreSQL & Storage), Docker, Railway, Vercel Config, REST Client  
**Technical Plan:** [docs/BIOLISTEN_PLAN.md](../BIOLISTEN_PLAN.md)

---

## 📅 Hướng dẫn Lộ trình 48 giờ

### Phase 1: Foundation (Giờ H0–H6 | Thứ Sáu 12:00 – 18:00)
- [x] **1. Đăng ký Router mới (Target: 13:00):**
  - Tạo file `backend/api/routes/audio.py` trong FastAPI.
  - Định nghĩa các schema Pydantic: `PredictRequest` (file upload), `PredictResponse` (chứa species, threats, health_index, spectrogram_base64, gradcam_base64, llm_report).
- [x] **2. Tích hợp Router vào App (Target: 15:30):**
  - Import và khai báo `audio.py` vào file `backend/main.py`.
  - Cập nhật file `backend/requirements.txt` thêm `torchaudio`, `librosa`, và `onnxruntime`.
- [x] **3. Triển khai Mock Endpoint (Target: 14:00):**
  - Viết code mock dữ liệu dự đoán trả về ngẫu nhiên các loại chim và threat (chainsaw/gunshot) để Hưng đấu nối frontend.
- [x] **4. Thiết lập Supabase Database (Target: 17:00):**
  - (Fallback: Tối ưu hóa bằng In-Memory Cache lưu vết demo trực tiếp tại chỗ nhằm tránh nghẽn truy vấn khi BGK chấm bài đồng loạt).
- [x] **5. Deploy thử nghiệm (Target: 18:00):**
  - Triển khai backend FastAPI trống lên Railway để xác nhận live API url hoạt động bình thường, không lỗi CORS.

### Phase 2: Integration (Giờ H6–H24 | Thứ Sáu 18:00 – Thứ Bảy 12:00)
- [x] **1. Lưu vết lịch sử phân tích:**
  - Viết logic lưu bản ghi phân tích vào bảng `detections` của Supabase/In-Memory mỗi khi client gọi `/predict`.
- [x] **2. Viết API Lịch sử & Analytics (Target: 22:00):**
  - Code endpoint `GET /api/audio/history` và `GET /api/audio/health-trend` đọc dữ liệu gửi cho Hưng vẽ biểu đồ.
- [x] **3. Cấu hình môi trường (ENV):**
  - Thiết lập liên kết giữa Vercel (Frontend) và Railway (Backend) thông qua Next.js Native Rewrites. Cấu hình đúng `NEXT_PUBLIC_API_URL`.
- [x] **4. Nộp Checkpoint 1 (Hạn chốt 11:00 Thứ Bảy):**
  - Đảm bảo Việt/Hiếu điền và nộp thông tin dự án BioListen VN lên platform của BTC.

### Phase 3: Polish & Deploy (Giờ H24–H36 | Thứ Bảy 12:00 – 23:00)
- [x] **1. Supabase Storage cho Demo Assets:**
  - (Fallback: Dựng bộ giả lập Web Audio synthesizers trực tiếp ở client cho phép phát sinh tín hiệu kiểm thử tức thì không lo trễ mạng).
- [x] **2. Backup ngrok:**
  - Thực tế không cần dùng do đường truyền Railway hoạt động cực kỳ ổn định trong suốt các phiên thử nghiệm.
- [x] **3. Clean code & Public repo (Target: 21:00):**
  - Xóa toàn bộ API keys hay mật khẩu trong code trước khi chuyển trạng thái repository sang **Public** để nộp bài.
- [x] **4. Nộp Checkpoint 2 (Hạn chốt 23:00 Thứ Bảy):**
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
