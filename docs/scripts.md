# 🎤 Kịch Bản Thuyết Trình Core AI: BioListen VN (Presentation Script)

Tài liệu này được thiết kế làm khung thuyết trình (Slide Outline) kèm lời thoại chi tiết (Verbal Script) dành cho đội ngũ phát triển BioListen VN khi báo cáo trước Hội đồng Giám khảo (gồm cả thành viên chuyên sâu về Kỹ thuật và thành viên Định hướng Kinh doanh/Phi kỹ thuật).

---

## ⏱️ Phân bổ Thời gian Dự kiến (Tổng cộng: 7 - 10 phút)
*   **Slide 1-2:** Đặt vấn đề & Bản chất Dữ liệu (1.5 phút)
*   **Slide 3-4:** Quy trình "Biến âm thanh thành hình ảnh" (2.0 phút)
*   **Slide 5-6:** Kiến trúc Mạng Multi-task & Trích xuất Đặc trưng (2.5 phút)
*   **Slide 7-8:** Tối ưu hóa Loss & Biên dịch ONNX phục vụ Triển khai (2.0 phút)

---

## Slide 1: Giới thiệu & Sứ mệnh của Core AI (BioListen VN)
### 📊 Nội dung trên Slide:
*   **Tiêu đề:** BioListen VN — Trí Tuệ Nhân Tạo Lắng Nghe Rừng Xanh
*   **Hình ảnh minh họa:** Hệ sinh thái rừng đặc dụng và biểu tượng sóng âm thanh chuyển đổi sang mạng thần kinh.
*   **Các ý chính:**
    *   Giám sát đa dạng sinh học tự động (Chim, Ếch, Côn trùng).
    *   Phát hiện sớm các hành vi xâm hại lâm sản bằng âm thanh (Tiếng cưa, tiếng súng).
    *   Mô hình Multi-task tinh gọn: Chạy thời gian thực trên các thiết bị Edge biên.

### 🗣️ Lời thoại Thuyết trình (Verbal Script):
*   **[Dành cho mọi người - Non-technical]:** "Kính thưa Ban Giám khảo, rừng rậm Việt Nam ẩn chứa hàng ngàn âm thanh của sự sống, nhưng cũng đang phải đối mặt với tiếng cưa xích trái phép hay tiếng súng săn trộm. Làm thế nào để kiểm lâm có thể lắng nghe toàn bộ khu rừng 24/7? Dự án BioListen VN ra đời với lõi Core AI chuyên sâu về xử lý âm thanh tự nhiên, giúp chúng ta không chỉ giám sát đa dạng sinh học mà còn phát hiện sớm các mối đe dọa phá rừng theo thời gian thực."
*   **[Nhấn mạnh Kỹ thuật - Technical]:** "Lõi AI của chúng tôi được thiết kế theo cấu trúc Multi-task Learning (Học đa tác vụ) trên nền mạng CNN tiên tiến, cho phép giải quyết đồng thời hai bài toán phức tạp trên một tài nguyên phần cứng duy nhất: Phân nhóm loài sinh vật tự nhiên và Phân loại mối đe dọa từ con người."

---

## Slide 2: Bản chất Dữ liệu Đầu vào (Audio Inputs & Datasets)
### 📊 Nội dung trên Slide:
*   **Tiêu đề:** Dữ liệu Đầu vào & Thử thách Âm học Lâm nghiệp
*   **Hình ảnh minh họa:** Sóng âm thanh dạng sóng (Waveform) dạng nhiễu thực địa.
*   **Thông số kỹ thuật chính:**
    *   Tần số lấy mẫu: $32,000\text{ Hz}$ (Đảm bảo dải tần Nyquist lên tới $16\text{ kHz}$ cho tiếng chim hót cao vút).
    *   Cửa sổ phân tích: Khung thời gian cố định $5.0\text{ giây}$ ($160,000$ mẫu biên độ).
    *   Nguồn dữ liệu: Tích hợp dữ liệu rừng nhiệt đới thực địa (RFCx), dữ liệu côn trùng (Zenodo), và âm thanh đe dọa (FSC22).

### 🗣️ Lời thoại Thuyết trình (Verbal Script):
*   **[Non-technical]:** "Mọi người thường nghĩ âm thanh nào cũng như nhau. Nhưng trong rừng rậm nhiệt đới, tiếng chim hót có tần số cực cao, trong khi tiếng cưa xích lại có tần số trầm và kéo dài. Nếu sử dụng tần số lấy mẫu thông thường của điện thoại, ta sẽ hoàn toàn bỏ sót tiếng chim đặc hữu."
*   **[Technical]:** "Để giải quyết vấn đề này, Core AI thống nhất chuẩn hóa toàn bộ dữ liệu đầu vào về Mono, tần số lấy mẫu $32,000\text{ Hz}$. Chúng tôi cắt các đoạn âm thanh thành cửa sổ cố định $5.0\text{ giây}$ (tương đương $160,000$ điểm dữ liệu). Mức tần số này giữ lại trọn vẹn dải tần hoạt động lên tới $16\text{ kHz}$ của các loài chim mà không làm phình to dung lượng tính toán."

---

## Slide 3: Tiền xử lý - "Biến Âm Thanh Thành Hình Ảnh" (Feature Extraction)
### 📊 Nội dung trên Slide:
*   **Tiêu đề:** Quy trình Trích xuất Đặc trưng Log-Mel Spectrogram
*   **Hình ảnh minh họa:** Đồ thị biến đổi từ sóng âm (Waveform) thành bức ảnh dải phổ màu (Mel-spectrogram).
*   **Các bước xử lý lõi:**
    1.  **STFT (Short-Time Fourier Transform):** Phân tích phổ thời gian ngắn ($n\_fft=2048$, $hop\_length=512$).
    2.  **Mel Scale Conversion:** Chuyển sang thang đo Mel mô phỏng tai người học ($n\_mels=128$).
    3.  **Log-Scaling (dB):** Nén biên độ dải động.
    4.  **Min-Max Normalization:** Đưa dải giá trị về pixel $[0.0, 1.0]$.
    5.  **Resize:** Đưa về độ phân giải chuẩn $224 \times 224 \times 3$.

### 🗣️ Lời thoại Thuyết trình (Verbal Script):
*   **[Non-technical]:** "Máy tính không nghe âm thanh giống như tai chúng ta. Vì vậy, Core AI sử dụng một bước biến đổi toán học để 'dịch' âm thanh thành một bức ảnh phổ màu. Bức ảnh này hiển thị trục ngang là thời gian, trục dọc là cao độ (tần số), và độ sáng tối là độ to của âm thanh. Nói cách khác, AI sẽ 'nhìn' âm thanh để đoán xem đó là tiếng gì."
*   **[Technical]:** "Chúng tôi thực hiện phép biến đổi STFT với kích thước cửa sổ $2048$ mẫu và bước nhảy $512$ mẫu để trích xuất dải tần số. Sau đó, chúng tôi ánh xạ qua bộ lọc gồm $128$ băng tần Mel để chuyển đổi tần số vật lý sang thang đo tương đương tai người. Dữ liệu phổ sau khi nén Log-dB được chuẩn hóa Min-Max về dải $[0.0, 1.0]$ và nội suy song tuyến tính (Bilinear Interpolation) về ma trận kích thước $224 \times 224$. Để tương thích với các kiến trúc thị giác máy tính, kênh phổ được nhân bản hoặc kết hợp dải Delta để tạo thành Tensor 3 kênh RGB."

---

## Slide 4: Kiến trúc Mạng Nơ-ron Multi-task (EfficientNet Backbone)
### 📊 Nội dung trên Slide:
*   **Tiêu đề:** Kiến trúc Mô hình Multi-task và Tối ưu hóa Tài nguyên
*   **Hình ảnh minh họa:** Sơ đồ mạng nơ-ron phân nhánh (1 Shared Backbone $\rightarrow$ 2 Heads).
*   **Thành phần chính:**
    *   **Shared Backbone:** EfficientNet-V2-S trích xuất đặc trưng chung.
    *   **Global Average Pooling (GAP):** Tổng hợp ngữ cảnh dải phổ thành vector đặc tả (Embedding).
    *   **Nhánh Loài (`species_head`):** Đầu ra $3$ chiều (Chim, Ếch, Côn trùng).
    *   **Nhánh Đe dọa (`human_head`):** Đầu ra $9$ chiều ($8$ hành vi phá hoại + $1$ âm thanh nền tự nhiên).

### 🗣️ Lời thoại Thuyết trình (Verbal Script):
*   **[Non-technical]:** "Tại sao lại là Multi-task? Nếu chúng ta cài đặt 2 mô hình chạy song song trên thiết bị giám sát ở rừng - một cái tìm chim, một cái tìm cưa xích - thiết bị sẽ rất nóng, nhanh hết pin và chi phí cao. BioListen VN sử dụng chung một 'não bộ' trích xuất đặc trưng hình ảnh âm thanh, sau đó tách thành 2 nhánh nhỏ để đưa ra quyết định độc lập. Giúp thiết bị hoạt động mát mẻ, tiết kiệm $50\%$ năng lượng."
*   **[Technical]:** "Kiến trúc sử dụng backbone mạnh mẽ **EfficientNet-V2-S** làm bộ trích xuất đặc trưng chung. Sau khi trải qua các lớp Convolution nâng cao và lớp Global Average Pooling, chúng ta thu được một vector embedding ngữ cảnh cô đọng kích thước $1280$ chiều. Từ vector này, mô hình rẽ nhánh qua hai classifier riêng biệt: Nhánh loài sinh vật sử dụng đầu ra $3$ chiều kết hợp hàm Sigmoid cho phân loại đa nhãn (nhiều loài có thể hót cùng lúc). Nhánh mối đe dọa con người có đầu ra $9$ chiều sử dụng hàm Softmax để xác định mối đe dọa chính đang diễn ra."

---

## Slide 5: Chiến lược Huấn luyện Thích ứng (Adaptive Masked Loss)
### 📊 Nội dung trên Slide:
*   **Tiêu đề:** Kỹ thuật Gradient Masking trong Huấn luyện Đa tác vụ
*   **Hình ảnh minh họa:** Cách dòng dữ liệu nhãn loài chỉ đi qua nhánh Loài, dữ liệu mối đe dọa chỉ đi qua nhánh Đe dọa mà không làm nhiễu lẫn nhau.
*   **Công thức & Cơ chế:**
    *   `spec_mask` và `human_mask` kiểm soát dòng lan truyền ngược.
    *   Tính Loss Loài: BCEWithLogitsLoss.
    *   Tính Loss Đe dọa: CrossEntropyLoss.
    *   Tổng Loss: $Loss_{Total} = Mask_{spec} \cdot Loss_{spec} + Mask_{human} \cdot Loss_{human}$.

### 🗣️ Lời thoại Thuyết trình (Verbal Script):
*   **[Non-technical]:** "Thử thách lớn nhất của việc dạy AI làm nhiều việc cùng lúc là: dữ liệu về tiếng chim thì không có nhãn tiếng súng, và dữ liệu tiếng cưa xích thì không ghi chú có chim gì ở đó. Nếu dạy không khéo, AI sẽ bị 'tẩu hỏa nhập ma' - học được cái này thì lại quên cái kia. Chúng tôi áp dụng cơ chế 'mặt nạ thông minh', giúp AI biết chính xác lúc nào cần cập nhật kiến thức về loài và lúc nào cần cập nhật kiến thức về mối đe dọa."
*   **[Technical]:** "Chúng tôi áp dụng kỹ thuật **Gradient Masking**. Trong quá trình huấn luyện batch hỗn hợp, đối với mỗi mẫu dữ liệu, chúng tôi tạo mảng mặt nạ nhị phân dựa trên `task_type`. Khi mẫu thuộc tập loài tự nhiên, `spec_mask` nhận giá trị $1$ và `human_mask` nhận giá trị $0$, giúp chặn không cho các nhãn không xác định của tác vụ đe dọa gây nhiễu cho các trọng số của nhánh `human_head`. Cơ chế này cho phép tận dụng tối đa các tập dữ liệu rời rạc ngoài thực địa để cùng huấn luyện chung một backbone."

---

## Slide 6: Kết quả Huấn luyện & Tối ưu hóa Triển khai (ONNX & Edge AI)
### 📊 Nội dung trên Slide:
*   **Tiêu đề:** Tối ưu hóa suy luận & Biên dịch định dạng ONNX biên
*   **Hình ảnh minh họa:** Lưu đồ xuất file từ PyTorch sang mô hình ONNX siêu nhẹ tích hợp Sigmoid/Softmax.
*   **Kết quả đạt được:**
    *   Tự động nhúng Post-processing (Sigmoid, Softmax) vào đồ thị ONNX tĩnh.
    *   Kích hoạt Dynamic Axes cho phép suy luận linh hoạt dải batch size từ client.
    *   Đạt chuẩn cấu trúc graph tuyệt đối qua kiểm tra của `onnx.checker`.

### 🗣️ Lời thoại Thuyết trình (Verbal Script):
*   **[Non-technical]:** "Sau khi AI học xong, thử thách cuối cùng là đưa nó vào thực địa. Làm thế nào một file AI nặng nề có thể chạy mượt mà trên chiếc máy tính nhỏ bằng lòng bàn tay gắn trên thân cây? Chúng tôi chuyển đổi mô hình sang định dạng ONNX chuẩn hóa toàn cầu. Định dạng này giúp mô hình chạy nhanh hơn gấp nhiều lần, tiêu tốn cực ít bộ nhớ và tương thích ngay lập tức với hệ thống phần mềm của trạm kiểm lâm."
*   **[Technical]:** "Để đảm bảo triển khai thực tế tối ưu ở Edge và Backend, chúng tôi thiết kế một `ONNXMultiTaskWrapper`. Lớp bọc này tích hợp trực tiếp các hàm kích hoạt Sigmoid và Softmax vào đồ thị tĩnh của ONNX, tránh việc client phải viết thêm các lớp hậu xử lý thủ công bằng Python/C++. Mô hình được xuất bản ở định dạng ONNX Opset 17 với tính năng dynamic batch size ở chiều số 0. File mô hình đã vượt qua quá trình kiểm định nghiệm ngặt của `onnx.checker` và sẵn sàng nạp trực tiếp vào ONNX Runtime trên các nền tảng phần cứng nhúng."

---

## Slide 7: Tóm tắt Đóng góp của Core AI (Key Takeaways)
### 📊 Nội dung trên Slide:
*   **Tiêu đề:** Giá trị Cốt lõi của Lõi AI BioListen VN
*   **Các điểm nhấn cốt lõi:**
    *   **Tối ưu phần cứng:** Tiết kiệm bộ nhớ và điện năng nhờ kiến trúc Multi-task chia sẻ backbone.
    *   **Đồng bộ âm học:** Tiền xử lý $32\text{ kHz}$ giữ lại dải Nyquist sinh học quan trọng.
    *   **Huấn luyện thông minh:** Khắc phục nhãn thiếu bằng cơ chế Masked Loss thích ứng.
    *   **Triển khai biên:** Định dạng ONNX tích hợp sẵn hậu xử lý suy luận cực nhanh.

### 🗣️ Lời thoại Thuyết trình (Verbal Script):
*   **[Non-technical]:** "Tóm lại, Core AI của BioListen VN không chỉ là một thuật toán nhận diện âm thanh đơn thuần. Đó là một giải pháp thiết kế toàn diện: tối ưu từ khâu nghe âm thanh tần số cao, xử lý thông minh để tiết kiệm pin thiết bị bảo vệ rừng, cho đến khả năng đóng gói siêu nhẹ dễ dàng lắp đặt tại thực địa. Chúng tôi tin rằng BioListen VN sẽ trở thành người bạn đồng hành đáng tin cậy của kiểm lâm Việt Nam."
*   **[Technical]:** "Về mặt công nghệ, chúng tôi đã chứng minh được tính khả thi của việc huấn luyện đa tác vụ trên tập dữ liệu không đồng nhất thông qua cơ chế Masked Loss, kết hợp với backbone EfficientNet-V2-S hiện đại và quy trình xuất ONNX tiêu chuẩn hóa cho Edge AI. Đây là nền tảng vững chắc để mở rộng hệ thống lên nhiều loại sinh vật và mối đe dọa khác trong tương lai. Xin chân thành cảm ơn Ban Giám khảo đã lắng nghe!"
