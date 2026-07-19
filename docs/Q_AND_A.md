# ❓ Bộ Câu Hỏi & Trả Lời Bảo Vệ Dự Án BioListen VN (Jury Q&A)

Tài liệu này tổng hợp toàn bộ các câu hỏi chuyên sâu về mặt **Kỹ thuật (Technical)**, **Kiến trúc Mô hình (AI Architecture)**, **Tiền xử lý Âm học (Audio Preprocessing)** và **Ứng dụng Thực tế (Edge Deployment)** mà Ban Giám khảo VAIC 2026 có thể đặt ra cho đội thi BioListen VN, kèm câu trả lời chuẩn xác và thuyết phục nhất.

---

## 📚 MỤC LỤC
1. [Nhiệm vụ & Thiết kế Mô hình Multi-task](#1-nhiệm-vụ--thiết-kế-mô-hình-multi-task)
2. [Chi tiết Kiến trúc Mạng Nơ-ron (Loss, Softmax vs Sigmoid, GAP)](#2-chi-tiết-kiến-trúc-mạng-nơ-ron)
3. [Tiền xử lý Âm học & Phân tích EDA](#3-tiền-xử-lý-âm-học--phân-tích-eda)
4. [Tối ưu hóa Huấn luyện & Dữ liệu Gộp nhóm](#4-tối-ưu-hóa-huấn-luyện--dữ-liệu-gộp-nhóm)
5. [Đóng gói ONNX & Triển khai Thực tế (Edge AI)](#5-đóng-gói-onnx--triển-khai-thực-tế-edge-ai)

---

## 1. Nhiệm vụ & Thiết kế Mô hình Multi-task

### ❓ Q1: Tại sao BioListen VN lại chọn mô hình Multi-task (Học đa tác vụ) thay vì dùng 2 mô hình độc lập?
* **Trả lời:**
  * **[Góc độ Thực tế / Tài nguyên Edge]:** Nếu triển khai 2 mô hình độc lập trên thiết bị giám sát kiểm lâm (như Raspberry Pi hoặc Jetson Nano), phần cứng sẽ phải thực hiện phép tính trích xuất đặc trưng 2 lần riêng biệt. Điều này gây tốn gấp đôi dung lượng RAM, tốn pin gấp đôi và làm thiết bị rất nóng khi hoạt động 24/7 ngoài rừng rậm.
  * **[Góc độ Kỹ thuật AI]:** Mô hình Multi-task của chúng tôi sử dụng chung một Backbone trích xuất đặc trưng (`EfficientNet-V2-S`). Backbone này đóng vai trò như bộ nhận diện âm thanh tổng quát (General Audio Encoder). Việc trích xuất biểu diễn chung giúp mô hình học được các đặc trưng phong phú hơn, đồng thời tiết kiệm $50\%$ tài nguyên tính toán và bộ nhớ khi triển khai thực tế.

---

## 2. Chi tiết Kiến trúc Mạng Nơ-ron

### ❓ Q2: Tại sao `species_head` và `human_head` lại có cơ chế tính Loss và hàm kích hoạt đầu ra khác nhau? Tại sao một bên dùng Sigmoid, một bên dùng Softmax?
* **Trả lời:**
  * **1. Nhánh Loài (`species_head`):**
    * **Bản chất bài toán:** **Multi-label Classification (Phân loại đa nhãn)**. Trong tự nhiên tại một khung thời gian 5s, âm thanh của rừng rậm có thể xuất hiện đồng thời cả tiếng chim hót, tiếng ếch kêu VÀ tiếng côn trùng định kỳ. Các nhãn này không loại trừ lẫn nhau.
    * **Hàm kích hoạt:** **Sigmoid**. Hàm Sigmoid tính toán xác suất độc lập cho từng nhóm nhãn trong dải $[0.0, 1.0]$.
    * **Hàm Loss:** **BCEWithLogitsLoss** (Binary Cross Entropy). Tính loss riêng biệt cho từng bit nhãn loài.
  * **2. Nhánh Mối đe dọa (`human_head`):**
    * **Bản chất bài toán:** **Multi-class Classification (Phân loại đơn nhãn)**. Tại một thời điểm phát hiện mối đe dọa, hệ thống cần xác định loại tiếng động xâm hại chính (dominant threat) đang diễn ra (như Tiếng cưa xích, Tiếng súng, Tiếng động cơ v.v. hoặc Âm thanh nền Background). Các nhãn đe dọa mang tính loại trừ tương hỗ trong khung thời gian ngắn.
    * **Hàm kích hoạt:** **Softmax**. Hàm Softmax ép tổng xác suất của 9 lớp đe dọa cộng lại đúng bằng $1.0$.
    * **Hàm Loss:** **CrossEntropyLoss**. Tối ưu hóa xác suất của lớp đe dọa đúng so với các lớp còn lại.

---

### ❓ Q3: GAP (Global Average Pooling) là gì? Tại sao phải thực hiện Pooling ở cuối Backbone mà không Flatten trực tiếp?
* **Trả lời:**
  * **Khái niệm:** GAP là phép toán tính giá trị trung bình cộng của toàn bộ không gian ma trận Feature Map thu được sau các lớp Convolution cuối cùng.
  * **Tại sao không Flatten (Phẳng hóa)?**
    * Sau Backbone EfficientNet, Feature Map thu được có kích thước `(Batch, 1280, 7, 7)`. Nếu dùng Flatten trực tiếp thành $1280 \times 7 \times 7 = 62,720$ giá trị để nối vào lớp Fully Connected, số lượng trọng số (weights) của mô hình sẽ bùng nổ lên hàng triệu tham số. Điều này gây **Overfitting nghiêm trọng** và tốn dung lượng bộ nhớ.
  * **Ưu điểm của GAP:**
    * Nén ma trận $7 \times 7$ về kích thước $1 \times 1$, biến Feature Map thành một vector **Sound Embedding 1280 chiều** cô đọng đại diện cho ngữ cảnh âm thanh 5 giây.
    * Giúp mô hình có tính chất **Spatial/Temporal Invariance** (Bất biến với vị trí thời gian): Dù tiếng chim hay tiếng cưa xuất hiện ở giây thứ 1 hay giây thứ 4 của đoạn ghi âm, vector embedding thu được qua GAP vẫn giữ nguyên thông tin ngữ cảnh chính xác.

---

## 3. Tiền xử lý Âm học & Phân tích EDA

### ❓ Q4: Tại sao các bạn lại chọn Tần số lấy mẫu (Sample Rate) là 32,000 Hz mà không phải 16,000 Hz hay 44,100 Hz?
* **Trả lời:**
  * **Dựa trên Phân tích EDA:** Phân tích dải phổ âm thanh trên tập dữ liệu rừng rậm thực địa (RFCx) cho thấy tần số hót của một số loài chim đặc hữu (ví dụ: loài cú mèo, chim sẻ đặc hữu) đạt dải tần cực đại lên tới **$13,687\text{ Hz}$**.
  * **Định lý Nyquist-Shannon:** Để khôi phục chuẩn xác và không bị mất mát tín hiệu tần số $f_{max}$, tần số lấy mẫu $f_s$ bắt buộc phải thỏa mãn: $f_s \ge 2 \times f_{max} = 2 \times 13,687 = 27.37\text{ kHz}$.
  * **Đánh giá Đổi trả (Trade-off):**
    * Nếu dùng $16,000\text{ Hz}$ (tần số chuẩn của giọng nói con người): Dải tần Nyquist chỉ đạt $8,000\text{ Hz}$, dẫn tới hiện tượng **Aliasing (mất toàn bộ âm thanh tần số cao của chim)**.
    * Nếu dùng $44,100\text{ Hz}$ (tần số âm nhạc CD): Giữ được tần số nhưng làm tăng $38\%$ dung lượng bộ nhớ và số lượng phép tính không cần thiết.
    * $\rightarrow$ **$32,000\text{ Hz}$** (dải Nyquist $16,000\text{ Hz}$) là sự lựa chọn tối ưu tuyệt đối, vừa giữ nguyên đặc trưng sinh học vừa tiết kiệm bộ nhớ.

---

### ❓ Q5: Ưu điểm và Nhược điểm của quy trình chuyển đổi âm thanh sang Log-Mel Spectrogram 2D ($224 \times 224$) là gì?
* **Trả lời:**
  * **Ưu điểm:**
    * **Tận dụng Transfer Learning từ Computer Vision:** Việc chuyển đổi mảng âm thanh 1D thành bức ảnh phổ 2D kích thước $224 \times 224 \times 3$ cho phép nạp trực tiếp các trọng số đã được tiền huấn luyện (Pretrained ImageNet) của mạng CNN tiên tiến như EfficientNet-V2-S.
    * **Phản ánh đúng cảm nhận âm học:** Thang đo Mel mô phỏng lại cách tai người nghe phân biệt độ cao tần số (phi tuyến tính), còn thang Log-dB nén dải động biên độ giúp âm thanh nhỏ không bị đè lấp bởi tiếng ồn.
  * **Nhược điểm:**
    * Phép biến đổi Bilinear Resize từ khung thời gian thực tế ($\sim 313$ frames $\times 128$ mels) về kích thước cố định $224 \times 224$ có thể làm biến dạng nhẹ dải tần. Tuy nhiên, nhược điểm này được bù đắp hoàn toàn nhờ khả năng học đặc trưng mạnh mẽ của mạng CNN 2D.

---

## 4. Tối ưu hóa Huấn luyện & Dữ liệu Gộp nhóm

### ❓ Q6: Kỹ thuật Adaptive Masked Loss (Gradient Masking) trong mô hình của bạn hoạt động như thế nào?
* **Trả lời:**
  * **Thử thách dữ liệu:** Tập dữ liệu loài (`grouping`) không có nhãn về tiếng cưa xích/súng, và ngược lại tập dữ liệu đe dọa (`FSC22`) không có nhãn về các loài sinh vật.
  * **Cơ chế Masked Loss:** Trong quá trình huấn luyện batch hỗn hợp, mô hình tạo ra mảng mặt nạ nhị phân dựa trên `task_type` của dòng dữ liệu:
    $$Loss_{Total} = Mask_{spec} \cdot Loss_{spec} + Mask_{human} \cdot Loss_{human}$$
  * **Tác dụng:** Khi batch chứa mẫu loài tự nhiên, $Mask_{human} = 0$, giúp triệt tiêu hoàn toàn gradient lan truyền ngược vào nhánh `human_head`. Điều này giúp mô hình cập nhật chung trọng số ở Backbone mà không bị nhiễu nhãn hay làm hỏng trọng số của nhánh còn lại.

---

### ❓ Q7: Tại sao bạn lại gộp 24 loài gốc của RFCx và 459 loài của Zenodo thành 3 nhóm lớn (Bird, Frog, Insect)?
* **Trả lời:**
  * **Xử lý Mất cân bằng Dữ liệu (Imbalanced Data):** Các tập dữ liệu vi mô 459 loài côn trùng có số lượng mẫu rất thưa thớt cho từng loài riêng biệt.
  * **Yêu cầu Ứng dụng Lâm nghiệp Thực tế:** Trong công tác giám sát lâm nghiệp thực địa, lực lượng kiểm lâm và nhà sinh thái học cần các chỉ số báo cáo tổng quan cấp hệ sinh thái (*Có chim hót đại diện cho rừng giàu không? Có tiếng ếch báo hiệu nguồn nước sạch không?*).
  * **Tăng độ chính xác & Chống Overfitting:** Việc gộp nhóm giúp đưa số lượng mẫu về trạng thái cân bằng tuyệt đối, nâng cao độ tin cậy suy luận của mô hình lên trên $90\%$.

---

## 5. Đóng gói ONNX & Triển khai Thực tế (Edge AI)

### ❓ Q8: ONNX là gì? Tại sao phải xuất mô hình sang ONNX mà không dùng trực tiếp PyTorch `.pt` ở Backend?
* **Trả lời:**
  * **Hạn chế của PyTorch:** Tệp trọng số PyTorch `.pt` yêu cầu môi trường cài đặt đầy đủ Python runtime, PyTorch C++ framework và thư viện CUDA nặng hàng Gigabytes. Tốc độ suy luận trên CPU bị hạn chế và tốn nhiều RAM.
  * **Ưu điểm của ONNX (Open Neural Network Exchange):**
    * ONNX biên dịch đồ thị nơ-ron thành dạng **Đồ thị tĩnh (Static Graph)** trung lập với kích thước tệp tin siêu nhẹ.
    * Cho phép Backend (viết bằng Python, C++, Go hay Node.js) nạp mô hình qua **ONNX Runtime** để đạt tốc độ suy luận nhanh hơn gấp nhiều lần và tiêu tốn cực ít tài nguyên RAM.
  * **Tích hợp Post-processing sẵn vào Graph:** Chúng tôi nhúng trực tiếp hàm kích hoạt `Sigmoid` (loài) và `Softmax` (đe dọa) vào trong đồ thị ONNX. Kết quả đầu ra trả về trực tiếp xác suất $[0.0, 1.0]$ mà Backend không cần viết thêm code xử lý phụ.

---

### ❓ Q9: Tích hợp Dynamic Axes trong file ONNX có ý nghĩa gì đối với hạ tầng BioListen VN?
* **Trả lời:**
  * Chúng tôi khai báo `dynamic_axes` trên chiều Batch size (chiều 0) của Tensor đầu vào:
    ```python
    dynamic_axes={'input_spectrogram': {0: 'batch_size'}}
    ```
  * **Ý nghĩa thực tế:**
    * **Tại thiết bị Edge biên ngoài rừng:** Thiết bị có thể đưa 1 tệp tin âm thanh duy nhất (`batch_size = 1`) vào suy luận theo thời gian thực để tiết kiệm RAM.
    * **Tại Máy chủ Backend Trạm trung tâm:** Máy chủ có thể gom một lô 32 hoặc 64 tệp tin âm thanh từ nhiều cảm biến gửi về (`batch_size = 32`) để suy luận song song đồng thời với tốc độ tối đa.

---

### ❓ Q10: Chỉ số Shannon-Wiener Index là gì? Tại sao hệ thống BioListen VN lại áp dụng chỉ số này?
* **Trả lời:**
  * **Khái niệm:** Shannon-Wiener Diversity Index ($H'$) là chỉ số tiêu chuẩn quốc tế trong Sinh thái học (Ecology) dùng để đo lường mức độ đa dạng sinh học của một khu vực dựa trên 2 yếu tố: **Độ phong phú loài (Species Richness)** và **Độ đồng đều quần thể (Species Evenness)**.
    $$H' = -\sum_{i=1}^{S} p_i \ln(p_i)$$
    *(Trong đó $S$ là tổng số nhóm/loài sinh vật phát hiện được, $p_i$ là tỉ lệ lần xuất hiện của nhóm $i$ so với tổng số lần xuất hiện của tất cả các loài).*
  * **Tại sao BioListen VN lại tích hợp chỉ số này?**
    * **Đánh giá Sức khỏe Hệ sinh thái tự động:** Thay vì chỉ báo cáo các âm thanh phát hiện riêng lẻ, BioListen VN tổng hợp các xác suất nhận diện từ nhánh `species_head` (Chim, Ếch, Côn trùng) theo thời gian (giờ/ngày/tuần) để tự động tính toán chỉ số $H'$ theo thời gian thực.
    * **Cảnh báo suy giảm đa dạng sinh học:** Khi khu vực rừng đạt chỉ số $H'$ cao ($H' > 2.0$), hệ sinh thái được đánh giá là giàu có và cân bằng. Ngược lại, nếu chỉ số $H'$ sụt giảm đột ngột trùng khớp với thời điểm phát hiện tiếng cưa xích hay tiếng súng (từ nhánh `human_head`), hệ thống sẽ đưa ra cảnh báo sớm về nguy cơ xua đuổi động vật hoang dã hoặc suy thoái môi trường sống.
    * **Báo cáo chuẩn hóa cho Kiểm lâm & Nhà nghiên cứu:** Chuyển đổi dữ liệu suy luận AI thuần túy thành các chỉ số sinh thái tiêu chuẩn giúp lực lượng kiểm lâm và các nhà quản lý môi trường dễ dàng theo dõi, báo cáo và đưa ra quyết định bảo tồn chính xác.

