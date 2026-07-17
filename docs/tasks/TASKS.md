# VAIC 2026 — BioListen VN Task Board

**Team NeuraX.ai** | Huỳnh Quốc Việt · Lê Nguyễn Gia Hưng · Hồ Minh Hiếu  
**Technical Plan:** [docs/BIOLISTEN_PLAN.md](../BIOLISTEN_PLAN.md)

---

## Phase 1 — Khởi động & Foundation (Giờ H0–H6 | Thứ Sáu 12:00 – 18:00)
> *Mục tiêu: Xây dựng pipeline xử lý dữ liệu âm thanh và các endpoints API mô phỏng.*

### Việt (AI Lead) — `feature/ai`
- [ ] Tải dữ liệu mẫu: ESC-50 (`git clone`) + viết script cào Xeno-canto cho 5 loài chim Việt Nam
- [ ] Xây dựng class `AudioDataset` trong PyTorch: load wav ➔ resample 22050Hz ➔ crop/pad 5s ➔ chuyển sang Mel-spectrogram ➔ resize 224x224 ➔ lặp thành 3 channels
- [ ] Định nghĩa model `BioListenModel` với backbone `EfficientNet-V2-S` dùng chung feature extractor, đầu ra chia làm 2 nhánh: Phân loại loài (5 lớp) và Phát hiện cưa xích/súng (3 lớp)
- [ ] Chạy lượt huấn luyện (training) đầu tiên trên máy tính của Việt

### Hưng (AI All-round) — `feature/ui`
- [ ] Thiết lập khung Dashboard Next.js: layout chính, sidebar (Monitor / History / Analytics / Catalog)
- [ ] Tạo UI hiển thị Mel-spectrogram động và khung hiển thị thông tin trích xuất
- [ ] Viết system prompt cho Groq (Llama 3.1 70B) để chuyển đổi dữ liệu thô (ví dụ: `[chainsaw: 0.9]`) thành bản tin khuyến cáo tiếng Việt cụ thể cho kiểm lâm

### Hiếu (SE) — `feature/api`
- [ ] Tạo router `backend/api/routes/audio.py` với các models Pydantic (`POST /predict`, `GET /history`)
- [ ] Code mock dữ liệu dự đoán (trả về các loài chim & cưa xích ngẫu nhiên) để Hưng có thể gọi API ngay lập tức
- [ ] Cài đặt Supabase, thiết kế bảng `detections` và `sensors`
- [ ] Push code backend lên Railway và xác nhận URL API live hoạt động bình thường

---

## Phase 2 — Tích hợp & Xây dựng Lõi (Giờ H6–H24 | Thứ Sáu 18:00 – Thứ Bảy 12:00)
> *Mục tiêu: Đưa model thật vào hoạt động, deploy thành công bản live demo đầu tiên.*

### Việt (AI Lead) — `feature/ai`
- [ ] Hoàn thành huấn luyện model, kiểm tra độ chính xác (accuracy)
- [ ] Export model PyTorch thành công sang định dạng **`.onnx`**
- [ ] Viết lớp `ONNXAudioService` chạy suy luận (inference) model ONNX trên CPU để giả lập xử lý biên (Edge computing)
- [ ] Thay thế mock dữ liệu của Hiếu bằng suy luận thực tế từ model ONNX
- [ ] Tích hợp tính năng tính toán Chỉ số sức khỏe hệ sinh thái (Shannon Diversity Index) dựa trên kết quả phát hiện loài

### Hưng (AI All-round) — `feature/ui`
- [ ] Kết nối Next.js với API `/predict` thực tế, cập nhật spectrogram thực từ backend lên giao diện
- [ ] Tạo biểu đồ Shannon Index theo thời gian thực (dùng Recharts)
- [ ] Xây dựng **Alert Panel** báo còi hú và màn hình nhấp nháy đỏ khi phát hiện tiếng cưa xích / súng săn từ API
- [ ] Xây dựng panel `ForestSimulator` cho phép giám khảo chọn chạy thử 5 kịch bản âm thanh mẫu (Yên bình, Bão, Cưa gỗ, Súng săn, v.v.)

### Hiếu (SE) — `feature/api`
- [ ] Bật tính năng tự động lưu lịch sử phân tích vào database Supabase mỗi khi gọi `/predict`
- [ ] Viết API lấy dữ liệu lịch sử (`GET /history`) phục vụ giao diện bảng biểu của Hưng
- [ ] Đẩy code lên Vercel/Railway, cấu hình CORS và ENV kết nối giữa 2 dịch vụ
- [ ] **🔴 Nộp Checkpoint 1 (Hạn chốt 11:00 Thứ Bảy):** Điền tên dự án, chọn track Nông nghiệp và paste phần mô tả giải pháp đã chuẩn bị.

---

## Phase 3 — Tinh chỉnh & Tính năng AI Tin cậy (Giờ H24–H36 | Thứ Bảy 12:00 – 23:00)
> *Mục tiêu: Hoàn thiện tính năng AI Safety (đo lường độ bất định) và Grad-CAM.*

### Việt (AI Lead) — `feature/ai`
- [ ] Tích hợp giải thuật MC-Dropout để đo lường độ bất định (uncertainty) của model PyTorch
- [ ] Tạo ảnh Grad-CAM làm nổi bật vùng phổ âm thanh (Mel-spectrogram) quyết định việc phân loại
- [ ] Đánh giá hiệu suất: đo thời gian xử lý của model ONNX trên CPU (target < 50ms) để đưa chỉ số vào slide

### Hưng (AI All-round) — `feature/ui`
- [ ] Render ảnh heatmap Grad-CAM đè lên biểu đồ phổ âm thanh trên giao diện
- [ ] Hiển thị nhãn cảnh báo độ tin cậy: Xanh (Chắc chắn) / Vàng (Chưa chắc chắn - Low confidence) dựa trên độ bất định từ API gửi về
- [ ] Tối ưu hóa UI: bổ sung hiệu ứng chuyển động, loading states khi đang gửi file audio

### Hiếu (SE) — `feature/api`
- [ ] Tải 5 file âm thanh demo lên Supabase Storage làm tài nguyên cố định cho nút Simulator
- [ ] Test hiệu năng backend (concurrency test) đảm bảo hệ thống không bị sập khi nhiều người truy cập
- [ ] **🔴 Nộp Checkpoint 2 (Hạn chốt 23:00 Thứ Bảy):** Kiểm tra kỹ live Vercel URL và GitHub link (phải để PUBLIC), nộp lên hệ thống của BTC.

---

## Phase 4 — Video Demo & Slide Thuyết trình (Giờ H36–H48 | Thứ Bảy 23:00 – Chủ Nhật 11:00)
> *Mục tiêu: Đóng gói sản phẩm và luyện tập thuyết trình.*

### Cả team
- [ ] **Hưng:** Quay video demo màn hình chạy thực tế ứng dụng trong 5 phút (sử dụng OBS/Loom) và upload lên Drive lấy link
- [ ] **Hưng:** Hoàn thành Google Slides (đúng 10 slide theo sườn trong `docs/TASKS.md`)
- [ ] **Việt & Hiếu:** Hỗ trợ chuẩn bị các câu trả lời kỹ thuật cho buổi vấn đáp trực tiếp (Q&A)
- [ ] Cả team chạy thử kịch bản thuyết trình live demo đúng 5 phút
- [ ] **🔴 Nộp bài chung cuộc (Hạn chốt 11:00 Chủ Nhật):** Nộp link Slides, video demo, GitHub repo và file nhật ký cộng tác AI (`docs/ai_collab_log.md`).
