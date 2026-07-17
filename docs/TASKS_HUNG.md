# BioListen VN — UI & LLM Lead (Hưng) Task Board & Guidelines

**Role:** Lê Nguyễn Gia Hưng (AI All-round) | **Branch:** `feature/ui`  
**Core Stack:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript, Recharts, wavesurfer.js, Groq API

---

## 📅 Hướng dẫn Lộ trình 48 giờ

### Phase 1: Foundation (Giờ H0–H6 | Thứ Sáu 12:00 – 18:00)
- [ ] **1. Thiết lập Layout chính (Target: 13:30):**
  - Xây dựng sidebar điều hướng gồm: Màn hình giám sát (Monitor), Nhật ký lịch sử (History Log), Phân tích đa dạng (Analytics), Thư viện loài (Species Catalog).
  - Tối ưu hóa cấu trúc component trong `frontend/src/components/layout/`.
- [ ] **2. Spectrogram Viewer (Target: 15:00):**
  - Viết component `SpectrogramViewer.tsx` nhận chuỗi base64 ảnh spectrogram từ API và hiển thị lên màn hình chính.
- [ ] **3. Cổng Uploader & Ghi âm (Target: 16:30):**
  - Tạo component `AudioUploader.tsx` hỗ trợ drag-and-drop file `.wav` hoặc click để sử dụng Microphone thu âm trực tiếp (dùng MediaRecorder API).
- [ ] **4. Alert Panel (Target: 18:00):**
  - Thiết kế component `AlertPanel.tsx` có hiệu ứng nhấp nháy đỏ để báo động khẩn cấp khi phát hiện cưa xích/súng.
  - Tích hợp âm thanh còi hú báo động.

### Phase 2: Integration (Giờ H6–H24 | Thứ Sáu 18:00 – Thứ Bảy 12:00)
- [ ] **1. Đấu nối API:**
  - Gọi class `ApiClient` ở `frontend/src/lib/api.ts` để kết nối API `/predict` thật của backend, thay thế dữ liệu mock.
- [ ] **2. Biểu đồ Shannon Index (Target: 23:00):**
  - Thiết kế component `HealthChart.tsx` sử dụng thư viện Recharts để vẽ biểu đồ đường biểu diễn sự thay đổi của Chỉ số Sức khỏe Hệ sinh thái theo thời gian.
- [ ] **3. Bản đồ trạm cảm biến:**
  - Viết component `SensorMap.tsx` hiển thị vị trí 3 trạm cảm biến của Cúc Phương lên bản đồ (vẽ bằng SVG hoặc Leaflet). Hiển thị trạng thái trạm (Active / Alert).
- [ ] **4. Prompt LLM cho Kiểm Lâm:**
  - Viết System Prompt cho Groq Llama 3.1 70B nhận diện thông tin danh sách loài và threat thô từ PyTorch gửi qua, dịch và viết thành một báo cáo hành động thông minh cho kiểm lâm (bằng tiếng Việt).
- [ ] **5. Bộ giả lập Forest Simulator (Target: 12:00 Thứ Bảy):**
  - Thiết kế panel cho phép ban giám khảo click chạy nhanh 5 file âm thanh test mẫu có sẵn (Tiếng chim yên bình, tiếng cưa xích, tiếng súng, sấm sét...) để hệ thống tự động xử lý và trả về kết quả tương ứng.

### Phase 3: Polish & AI Safety (Giờ H24–H36 | Thứ Bảy 12:00 – 23:00)
- [ ] **1. Trực quan hóa Grad-CAM:**
  - Hiển thị heatmap Grad-CAM đè lên ảnh spectrogram chính xác để minh họa AI đang "nhìn" và "nghe" tần số nào.
- [ ] **2. Hiển thị Trạng thái độ tin cậy:**
  - Tạo các tag UI màu hiển thị mức độ tin cậy: Xanh lá (Tin cậy cao) / Vàng (Tin cậy thấp - dựa vào std của MC-Dropout).
- [ ] **3. UX Polish:**
  - Thêm hiệu ứng loading skeletons, xử lý giao diện hiển thị lỗi khi API mất kết nối.

---

## 🛠️ Hướng dẫn nhanh cho Agent của Hưng

Khi Hưng dùng AI Agent hỗ trợ code frontend, hãy bảo Agent của mình:
- **Đọc kỹ file:** `frontend/src/lib/api.ts` để biết cách viết thêm method gọi API.
- **Tiêu chuẩn Thiết kế:** Xem kỹ `globals.css` để sử dụng đúng hệ màu Tailwind CSS v4. Đảm bảo giao diện mang phong cách hiện đại (glassmorphic, có hiệu ứng dark-mode tối ưu).
- **Lưu ý Fallback:** Nếu tối Thứ Sáu team quyết định pivot sang Điện Biên Agriculture, Hưng sẽ đổi UI từ hiển thị spectrogram sang giao diện upload ảnh chụp lá và hiển thị kết quả phân tích bệnh cây.
