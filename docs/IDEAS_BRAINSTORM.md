# VAIC 2026 — Pre-Competition Ideas Brainstorm
**Team NeuraX.ai** | Huỳnh Quốc Việt · Lê Nguyễn Gia Hưng · Hồ Minh Hiếu  
*Tài liệu brainstorm tham khảo trước khi công bố đề bài chính thức*

---

## 🏆 Top 3 Khuyến Nghị Lựa Chọn (2 AI + 1 SE)

### 🥇 Lựa chọn 1: Y tế & Sức khỏe — SkinCheck VN
- **Kỹ thuật:** Sử dụng `EfficientNet-V2` fine-tune trên dữ liệu ISIC để phân loại tổn thương da + tích hợp cơ chế **Bayesian Uncertainty (MC-Dropout)** để đo độ bất định của dự đoán + **Whisper** để nhận diện giọng nói triệu chứng của bệnh nhân.
- **Điểm nhấn:** Đánh trúng tiêu chí **AI Safety & Trust (10đ)** nhờ khả năng ước lượng độ tin cậy và Grad-CAM (giải thích vùng ảnh quyết định).

### 🥈 Lựa chọn 2: Nông nghiệp — CropGuard
- **Kỹ thuật:** Sử dụng `YOLO` để phát hiện vùng lá/thân cây bị bệnh (Object Detection) và phân tích mức độ nghiêm trọng (Severity Scoring) + **Groq (LLM)** để gợi ý phác đồ điều trị và loại thuốc bảo vệ thực vật phù hợp.
- **Điểm nhấn:** Trực quan hóa cực mạnh (vẽ bounding box trực tiếp trên UI Next.js), dễ demo, tính ứng dụng thực tế cao ở Việt Nam.

### 🥉 Lựa chọn 3: Phòng chống thiên tai — FloodWatch VN
- **Kỹ thuật:** Sử dụng `UNet` hoặc `DeepLabV3` (phần mạng mã hóa dùng backbone EfficientNet sẵn có) để phân vùng ngập lụt (Semantic Segmentation) từ ảnh vệ tinh Sentinel-2.
- **Điểm nhấn:** Độ khó kỹ thuật cực cao (Semantic Segmentation), gần như không có đối thủ cạnh tranh ở mảng này, rất mạnh để nhắm giải **Best PyTorch**.

---

## 8 Ý Tưởng Chi Tiết Cho Từng Track

### 1. Tài chính & Ngân hàng: *TrustLend*
- **Bài toán:** Chấm điểm tín dụng cho lao động tự do (gig workers) bằng phân tích hành vi giao dịch và phỏng vấn giọng nói.
- **PyTorch:** LSTM/Transformer dự báo dòng tiền từ lịch sử giao dịch; PhoBERT phân tích ngữ nghĩa lý do vay vốn.
- **LLM (Groq):** Thực hiện cuộc gọi/chat phỏng vấn tự động để trích xuất thông tin phi cấu trúc.
- **Pitch:** Chuyển đổi hồ sơ của 3 triệu lao động phi chính thức thành điểm số tín dụng có độ tin cậy cao trong 2 giây.

### 2. Y tế & Sức khỏe: *SkinCheck VN*
- **Bài toán:** Sàng lọc tổn thương da bằng camera điện thoại kết hợp chuẩn đoán độ tin cậy.
- **PyTorch:** EfficientNet-V2 phân loại u hắc tố với MC-Dropout; Whisper nhận diện triệu chứng tiếng Việt.
- **LLM (Groq):** Dịch kết quả phân tích kỹ thuật thành lời khuyên y tế dễ hiểu cho người dân.
- **Pitch:** Không chỉ phân loại ảnh – hệ thống biết tự lượng giá độ bất định của mình để đưa ra khuyến cáo khám bác sĩ an toàn.

### 3. Giáo dục: *SpeakVN Coach*
- **Bài toán:** Trợ lý chấm điểm và sửa lỗi phát âm tiếng Anh/tiếng Việt tới từng âm tiết (phoneme).
- **PyTorch:** Whisper thực hiện nhận diện âm thanh và chấm điểm chi tiết (forced alignment/CTC confidence) thay vì chỉ so sánh text thô.
- **LLM (Groq):** Phân tích lỗi sai và đề xuất các bài tập luyện phát âm phù hợp cho từng cá nhân.
- **Pitch:** Chấm điểm phát âm chuẩn xác tới từng âm vị (phoneme), cá nhân hóa lộ trình học tiếng Anh với chi phí tối thiểu.

### 4. Năng suất doanh nghiệp (SME): *InvoiceIQ*
- **Bài toán:** Số hóa hóa đơn/biên lai và tự động dự báo dòng tiền cho các cửa hàng bán lẻ nhỏ.
- **PyTorch:** EfficientNet + CRNN để OCR hóa đơn tiếng Việt; LSTM dự báo dòng tiền 30 ngày tới.
- **LLM (Groq):** Chuẩn hóa dữ liệu thô từ OCR và hỗ trợ truy vấn báo cáo tài chính bằng ngôn ngữ tự nhiên.
- **Pitch:** Biến một bức ảnh chụp hóa đơn viết tay thành biểu đồ dự báo dòng tiền kinh doanh tức thì.

### 5. Nông nghiệp: *CropGuard*
- **Bài toán:** Phát hiện sâu bệnh trên cây trồng theo thời gian thực và tư vấn nông nghiệp tại vườn.
- **PyTorch:** YOLO phát hiện vùng bệnh trên lá; EfficientNet phân loại loại bệnh.
- **LLM (Groq):** Đưa ra phác đồ phun thuốc, liều lượng và thời gian cách ly cụ thể bằng tiếng Việt dễ hiểu cho nông dân.
- **Pitch:** Mang năng lực của một chuyên gia nông nghiệp đến tận tay người nông dân thông qua camera điện thoại trong 3 giây.

### 6. Phòng chống thiên tai: *FloodWatch VN*
- **Bài toán:** Phân vùng khu vực ngập lụt tự động từ ảnh vệ tinh phục vụ cứu hộ khẩn cấp.
- **PyTorch:** UNet/DeepLab thực hiện semantic segmentation ảnh vệ tinh Sentinel-2/drone để xác định diện tích ngập nước.
- **LLM (Groq):** Tổng hợp dữ liệu ngập lụt thành bản tin cảnh báo khẩn cấp cho chính quyền địa phương.
- **Pitch:** Biến ảnh vệ tinh thô thành bản đồ ngập lụt chi tiết trong 10 giây thay vì hàng giờ đo đạc thủ công.

### 7. Chính phủ thông minh: *DocuSense Gov*
- **Bài toán:** Tự động phân loại, trích xuất thông tin và chuyển hướng (route) văn bản hành chính công.
- **PyTorch:** PhoBERT fine-tune phân loại nhiều nhãn (multi-label) cho các loại đơn từ, hồ sơ hành chính.
- **LLM (Groq):** Tóm tắt nội dung đơn và dự thảo văn bản phản hồi tự động cho người dân kiểm tra hồ sơ thiếu/đủ.
- **Pitch:** Giảm thiểu 30% thời gian xử lý thủ tục hành chính nhờ hệ thống tự động phân loại và định tuyến hồ sơ chính xác.

### 8. Xã hội & Cộng đồng: *ElderCare Voice*
- **Bài toán:** Trợ lý giọng nói theo dõi sức khỏe và phát hiện sớm dấu hiệu suy giảm nhận thức ở người cao tuổi.
- **PyTorch:** Whisper ghi nhận giọng nói; PhoBERT phân tích độ trôi embedding (embedding drift) qua các ngày để phát hiện bất thường trong ngôn ngữ (suy giảm trí nhớ).
- **LLM (Groq):** Đóng vai trò bạn trò chuyện hàng ngày với người già, theo dõi các chỉ số hành vi một cách tự nhiên.
- **Pitch:** 2 phút trò chuyện mỗi ngày giúp phát hiện sớm các dấu hiệu sa sút trí tuệ trước khi các biểu hiện lâm sàng xuất hiện.
