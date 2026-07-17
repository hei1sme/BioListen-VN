# BioListen VN — UI & LLM Lead (Hưng) Task Board & Guidelines

**Role:** Lê Nguyễn Gia Hưng (AI All-round) | **Branch:** `feature/ui`  
**Core Stack:** Next.js 16 (App Router), Tailwind CSS v4, TypeScript, Recharts, wavesurfer.js, Groq API  
**Technical Plan:** [docs/BIOLISTEN_PLAN.md](../BIOLISTEN_PLAN.md)

---

## 📅 Hướng dẫn Lộ trình 48 giờ

### Phase 1: Foundation (Giờ H0–H6 | Thứ Sáu 12:00 – 18:00)
- [x] **1. Thiết lập Layout chính (Target: 13:30):**
  - Xây dựng sidebar điều hướng gồm: Màn hình giám sát (Monitor), Nhật ký lịch sử (History Log), Phân tích đa dạng (Analytics), Thư viện loài (Species Catalog).
  - Tối ưu hóa cấu trúc component trong `frontend/src/components/layout/`.
- [x] **2. Spectrogram Viewer (Target: 15:00):**
  - Viết component `SpectrogramViewer.tsx` nhận chuỗi base64 ảnh spectrogram từ API và hiển thị lên màn hình chính.
- [x] **3. Cổng Uploader & Ghi âm (Target: 16:30):**
  - Tạo component `AudioUploader.tsx` hỗ trợ drag-and-drop file `.wav` hoặc click để sử dụng Microphone thu âm trực tiếp (dùng MediaRecorder API).
- [x] **4. Alert Panel (Target: 18:00):**
  - Thiết kế component `AlertPanel.tsx` có hiệu ứng nhấp nháy đỏ để báo động khẩn cấp khi phát hiện cưa xích/súng.
  - Tích hợp âm thanh còi hú báo động.

### Phase 2: Integration (Giờ H6–H24 | Thứ Sáu 18:00 – Thứ Bảy 12:00)
- [x] **1. Đấu nối API:**
  - Gọi class `ApiClient` ở `frontend/src/lib/api.ts` để kết nối API `/predict` thật của backend, thay thế dữ liệu mock.
- [x] **2. Biểu đồ Shannon Index (Target: 23:00):**
  - Thiết kế component `HealthChart.tsx` sử dụng thư viện Recharts để vẽ biểu đồ đường biểu diễn sự thay đổi của Chỉ số Sức khỏe Hệ sinh thái theo thời gian.
- [x] **3. Bản đồ trạm cảm biến:**
  - Viết component `SensorMap.tsx` hiển thị vị trí 3 trạm cảm biến của Cúc Phương lên bản đồ (vẽ bằng SVG hoặc Leaflet). Hiển thị trạng thái trạm (Active / Alert).
- [x] **4. Prompt LLM cho Kiểm Lâm:**
  - Viết System Prompt cho Groq Llama 3.1 70B nhận diện thông tin danh sách loài và threat thô từ PyTorch gửi qua, dịch và viết thành một báo cáo hành động thông minh cho kiểm lâm (bằng tiếng Việt).
- [x] **5. Bộ giả lập Forest Simulator (Target: 12:00 Thứ Bảy):**
  - Thiết kế panel cho phép ban giám khảo click chạy nhanh 5 file âm thanh test mẫu có sẵn (Tiếng chim yên bình, tiếng cưa xích, tiếng súng, sấm sét...) để hệ thống tự động xử lý và trả về kết quả tương ứng.

### Phase 3: Polish & AI Safety (Giờ H24–H36 | Thứ Bảy 12:00 – 23:00)
- [x] **1. Trực quan hóa Grad-CAM:**
  - Hiển thị heatmap Grad-CAM đè lên ảnh spectrogram chính xác để minh họa AI đang "nhìn" và "nghe" tần số nào.
- [x] **2. Hiển thị Trạng thái độ tin cậy:**
  - Tạo các tag UI màu hiển thị mức độ tin cậy: Xanh lá (Tin cậy cao) / Vàng (Tin cậy thấp - dựa vào std của MC-Dropout).
- [x] **3. UX Polish:**
  - Thêm hiệu ứng loading skeletons, xử lý giao diện hiển thị lỗi khi API mất kết nối.

### Phase 4: Deployment & Final Delivery (Giờ H36–H48 | Chủ Nhật)
- [x] **1. Triển khai Backend API lên Railway:**
  - Viết Dockerfile tối ưu hóa cài đặt Python + setuptools + openai-whisper + PyTorch.
  - Cấu hình CORS wildcard và biến môi trường.
  - Deploy thành công lên Railway (`https://vaic-2026.up.railway.app`).
- [x] **2. Triển khai Frontend lên Vercel:**
  - Cấu hình monorepo Next.js trỏ Root Directory về thư mục `frontend`.
  - Cấu hình biến môi trường `NEXT_PUBLIC_API_URL` trỏ về API Railway.
  - Giải quyết lỗi định tuyến Edge CDN (404) bằng cách di chuyển rewrite từ `vercel.json` sang `next.config.ts`.
  - Deploy chạy thành công giao diện online tại `https://biolistenvn.vercel.app`.
- [x] **3. Sửa lỗi & Chuẩn hóa mã nguồn:**
  - Sửa triệt để 11 lỗi linter nghiêm trọng liên quan đến JavaScript Hoisting, synchronous React state và JSX single quotes.

---

## 🛠️ Hướng dẫn nhanh cho Agent của Hưng

Khi Hưng dùng AI Agent hỗ trợ code frontend, hãy bảo Agent của mình:
- **Đọc kỹ file:** `frontend/src/lib/api.ts` để biết cách viết thêm method gọi API.
- **Tiêu chuẩn Thiết kế:** Xem kỹ `globals.css` để sử dụng đúng hệ màu Tailwind CSS v4. Đảm bảo giao diện mang phong cách hiện đại (glassmorphic, có hiệu ứng dark-mode tối ưu).
- **Lưu ý Fallback:** Nếu tối Thứ Sáu team quyết định pivot sang Điện Biên Agriculture, Hưng sẽ đổi UI từ hiển thị spectrogram sang giao diện upload ảnh chụp lá và hiển thị kết quả phân tích bệnh cây.
