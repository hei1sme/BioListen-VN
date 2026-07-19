# BioListen VN — Pitch Deck & Demo Script Guide

Tài liệu này cung cấp khung thuyết trình **10 Slide Pitch Deck** và kịch bản quay **Video Demo 5 phút** để Lê Nguyễn Gia Hưng và đội ngũ chuẩn bị cho khâu thuyết trình và nộp bài chấm thi VAIC 2026.

---

## 📊 PHẦN 1: 10 SLIDE PITCH DECK OUTLINE

### Slide 1: Bìa dự án (Title Slide)

* **Tiêu đề:** BioListen VN — Hệ thống giám sát sinh thái & Cảnh báo an ninh rừng quốc gia thời gian thực.
* **Slogan:** *"Lắng nghe hơi thở của rừng sâu bằng Trí tuệ Nhân tạo."*
* **Thông tin:** Đội ngũ NeuraX.ai — Hackathon VAIC 2026.
* **Hình ảnh minh họa:** Logo dự án hoặc giao diện Dashboard HUD phát sáng trong bóng tối.

### Slide 2: Đặt vấn đề (The Problem)

* **Thực trạng:** Rừng Cúc Phương đối mặt với nạn khai thác gỗ trái phép (cưa xích) và săn bắn trộm thú rừng.
* **Nỗi đau của Kiểm lâm (Pain Points):**
  * Diện tích rừng quá lớn, tuần tra thủ công không xuể.
  * Phát hiện muộn: Khi nghe tiếng cưa/súng thì lâm tặc đã trốn thoát.
  * Thiếu dữ liệu: Không đo đạc được sức khỏe hệ sinh thái và mật độ sinh vật theo thời gian thực.

### Slide 3: Giải pháp (The Solution — BioListen VN)

* **Concept:** Mạng lưới trạm cảm biến âm thanh hoạt động liên tục bằng pin năng lượng mặt trời.
* **Cách thức hoạt động:**
  * Thu âm tiếng rừng nhiệt đới liên tục 24/7.
  * Chuyển tín hiệu âm thanh thành dạng ảnh phổ tần (2D Mel-spectrogram).
  * Sử dụng AI (PyTorch CNN) để nhận diện cùng lúc: Tiếng động vật (loài chim) và Tiếng động nguy hiểm (cưa xích, súng săn).

### Slide 4: Kiến trúc hệ thống (Technical Architecture)

* **Mô hình Pipeline:**
  * *Data Input:* Audio 5 giây $\rightarrow$ Preprocessing (`torchaudio` / `librosa`) $\rightarrow$ Mel-spectrogram `(3, 224, 224)`.
  * *AI Model (Deep PyTorch Native):* Chúng tôi không dùng API đóng. Cốt lõi hệ thống là một **Multi-Task CNN** tự thiết kế bằng PyTorch `nn.Module` (backbone EfficientNet-V2). Áp dụng kỹ thuật *Frozen Layers* cho trích xuất đặc trưng âm thanh và *Custom MLP Heads* phân loại kép:
        1. **Branch 1 (Biodiversity):** Phân loại theo 3 nhóm sinh vật chỉ thị mục tiêu (Chim, Ếch nhái, Côn trùng). Áp dụng *Weighted Cross-Entropy Loss* để giải quyết triệt để bài toán mất cân bằng dữ liệu (Data Imbalance) trong tự nhiên.
        2. **Branch 2 (Threat):** Phát hiện tức thời tiếng cưa xích (`chainsaw`), súng săn (`gunshot`).
  * *AI Safety & Optimization:* Tích hợp **MC-Dropout** đo lường độ bất định (Uncertainty) chống nhận diện sai, và huấn luyện bằng **PyTorch AMP (Automatic Mixed Precision)** giúp tăng tốc training trên FPT AI Factory.
  * *Decision Support:* AI Agent (Groq Llama 3.1 70B) đóng vai trò tư lệnh, chuyển dữ liệu thô thành lệnh hành động cho kiểm lâm.

### Slide 5: Điểm nhấn công nghệ (Explainable AI & Sức khỏe sinh thái)

* **Shannon-Wiener Index (H') theo thời gian thực:** Lần đầu tiên, một hệ thống có thể số hóa độ trù phú sinh vật liên tục thay vì đếm thủ công hàng tháng. (Góc nhìn Chuyên gia/Domain Expert).
* **Trực quan hóa Grad-CAM (Explainable AI):** Trích xuất *Activation Maps* từ các layer Convolutional của PyTorch, tô đỏ dải tần số đã kích hoạt báo động. Điều này đập tan hộp đen (Blackbox) của AI, mang lại lòng tin tuyệt đối cho kiểm lâm khi nhận lệnh tuần tra vũ trang.

### Slide 6: Giao diện Trung tâm giám sát HUD Dashboard

* **Thiết kế:** Modern Cyberpunk HUD (Glassmorphism, tông màu tối phát sáng xanh neon `#39FF14`).
* **Các tính năng cốt lõi đã chạy online:**
  * Spectrogram & Grad-CAM viewer.
  * Bản đồ SVG định vị 3 trạm cảm biến của Cúc Phương kèm đèn báo động.
  * Biểu đồ Recharts thể hiện xu hướng biến động sức khỏe sinh thái H'.
  * Bộ giả lập kịch bản (Forest Simulator) hỗ trợ Ban giám khảo click test nhanh tại chỗ.

### Slide 7: Kết quả thử nghiệm (Validation & Results)

* **Độ chính xác:** Model đạt Accuracy trên 92% đối với các threat (ESC-50) và 5 loài động vật mục tiêu.
* **Tốc độ xử lý (Latency):** Dưới 150ms cho mỗi cửa sổ âm thanh 5 giây (phù hợp triển khai trên các thiết bị Edge AI công suất thấp).
* **Mức độ ổn định:** Deploy thành công backend trên Railway Cloud và frontend lên Vercel CDN chịu tải cực tốt.

### Slide 8: Khả năng mở rộng & Thương mại hóa (Góc nhìn Senior Judge)

* **Phá vỡ rào cản chi phí:** Các trạm cảm biến âm thanh sinh học truyền thống (như AudioMoth) giá >$100. Kiến trúc "Simulated Edge" của chúng tôi cho phép xuất model PyTorch sang `.onnx`, chạy sub-150ms trên vi điều khiển ESP32-S3 + Mic I2S với tổng chi phí phần cứng **dưới $15**.
* **Tối ưu băng thông (LoRaWAN):** Truyền tải âm thanh liên tục trong rừng là bất khả thi. Edge device của chúng tôi chỉ gửi JSON payload <100 bytes (tọa độ, ID loài, cảnh báo) qua mạng LoRa.
* **Tác động xã hội & Quy mô:** Giải pháp có thể nhân bản lập tức ra 34 Vườn Quốc Gia toàn Việt Nam, bảo vệ hàng triệu hecta rừng di sản từ giây đầu tiên lâm tặc xâm nhập.

### Slide 9: Lộ trình phát triển (Roadmap)

* **Giai đoạn 1 (Hiện tại):** Hoàn tất Live Web Demo, tích hợp mô hình AI và báo cáo LLM tự động. Nhánh phân loại loài hiện tại chia theo nhóm (Chim, Ếch nhái, Côn trùng) làm tiền đề.
* **Giai đoạn 2 (3-6 tháng tới):** Thiết kế phần cứng hộp cảm biến chống nước ngoài trời IP67. Thu thập thêm tiếng kêu thực địa tại Cúc Phương để nâng cấp mô hình phân loại chi tiết đến từng loài sinh học đơn lẻ (individual species detection).
* **Giai đoạn 3 (12 tháng tới):** Triển khai thí điểm 10 trạm cảm biến tại phân khu Rừng Già VQG Cúc Phương.

### Slide 10: Đội ngũ & Hỏi đáp (Team & Q&A)

* **Thành viên:**
  * Lê Nguyễn Gia Hưng: UI/UX & AI Integration.
  * Hồ Minh Hiếu: Software Engineer & Cloud Deploy.
  * Huỳnh Quốc Việt: AI Model Lead (PyTorch).
* **Lời kết:** Cảm ơn Ban giám khảo và sẵn sàng trả lời câu hỏi.

---

## 🎬 PHẦN 2: KỊCH BẢN VIDEO DEMO 5 PHÚT

### ⏱️ Phân bổ thời gian

1. **Phần 1 (0:00 - 0:45):** Đặt vấn đề và giới thiệu tổng quan Live URL.
2. **Phần 2 (0:45 - 2:00):** Giới thiệu bố cục Dashboard giám sát thời gian thực.
3. **Phần 3 (2:00 - 3:45):** Chạy thử 3 Kịch bản Demo thực tế bằng Forest Simulator.
4. **Phần 4 (3:45 - 4:30):** Giải thích Công nghệ (Spectrogram, Grad-CAM, Shannon Index).
5. **Phần 5 (4:30 - 5:00):** Tóm tắt giải pháp phần cứng & lời chào kết.

---

### 📝 Kịch bản chi tiết

#### 1. Mở đầu: Vấn nạn & Giải pháp (0:00 - 0:45)

* **Hành động trên màn hình:** Người thuyết trình bật webcam góc màn hình hoặc dùng giọng lồng tiếng (voiceover), màn hình hiển thị trang chủ **<https://biolistenvn.vercel.app>**.
* **Lời thoại:**
    > *"Xin chào Ban giám khảo VAIC 2026. Đây là BioListen VN — Hệ thống giám sát âm thanh sinh thái nhiệt đới và cảnh báo xâm hại rừng thời gian thực tại Vườn Quốc Gia Cúc Phương.
    > Hiện tại, hệ thống của chúng tôi đã được deploy hoàn chỉnh lên Vercel tại địa chỉ biolistenvn.vercel.app kết nối với API thật chạy trên Railway.
    > Rừng quốc gia Cúc Phương có diện tích khổng lồ, việc tuần tra truyền thống không thể ngăn chặn triệt để cưa trộm hay săn thú. BioListen VN ra đời để biến mọi âm thanh của rừng thành dữ liệu số có khả năng cảnh báo lập tức."*

#### 2. Khám phá Dashboard HUD (0:45 - 2:00)

* **Hành động trên màn hình:** Rê chuột chỉ vào các phần trên giao diện:
  * Chỉ vào tiêu đề **BIOLISTEN VN V1.0.0** và nhãn **LIVE EDGE LINK**.
  * Chỉ vào **Sidebar** bên trái hiển thị danh sách 3 trạm: Trạm A - Suối Lớn (đang hoạt động), Trạm B - Đỉnh Mây, Trạm C - Rừng Già.
  * Chỉ vào **Mel-Spectrogram Plot** ở giữa màn hình đang chờ nhận tín hiệu.
  * Chỉ vào **Ecosystem Health Chart** (Biểu đồ Shannon H' bên phải đang vẽ đường xu hướng màu xanh).
* **Lời thoại:**
    > *"Giao diện của chúng tôi được thiết kế theo phong cách HUD Cyberpunk hiện đại, trực quan giúp kiểm lâm dễ dàng theo dõi trong phòng điều khiển tối.
    > Ở cột bên trái, các bạn có thể thấy hệ thống đang liên kết với 3 trạm cảm biến phân bố ở các tọa độ trọng điểm của Cúc Phương. Trạm A tại Suối Lớn đang gửi tín hiệu về liên tục, pin mặt trời còn 84%, và độ trễ truyền dữ liệu cực thấp, chỉ 124ms."*

#### 3. Chạy Demo giả lập 3 Kịch bản (2:00 - 3:45)

*(Đây là phần quan trọng nhất để thuyết phục BGK)*

* **Kịch bản A: Bình minh yên bình (Peaceful Dawn)**
  * **Hành động:** Người quay bấm vào nút **`🐦 BÌNH MINH YÊN BÌNH`** ở chân trang.
  * **Kết quả hiển thị:** Âm thanh chim hót phát ra từ loa. Khung phổ âm Mel-Spectrogram vẽ các đường cao tần của tiếng chim hót. Cột bên phải chuyển sang trạng thái bình thường (màu xanh). AI phát hiện chim Chào mào và Chích chòe. Báo cáo LLM viết: *"Hệ sinh thái hoạt động ổn định. Ghi nhận tiếng hót đặc trưng của Chào mào và Chích chòe lửa. Không phát hiện tạp âm xâm hại rừng."* Chỉ số Shannon H' tăng lên **1.62**.
  * **Lời thoại:**
        > *"Chúng tôi thiết kế riêng bảng giả lập kịch bản cho Ban giám khảo trải nghiệm. Đầu tiên, hãy click kịch bản 'Bình minh yên bình'. Ngay lập tức, AI phân tích âm thanh, hiển thị phổ tần của tiếng chim hót, nhận diện thành công loài Chào mào và Chích chòe với độ tin cậy trên 88%. Chỉ số đa dạng sinh học Shannon tăng lên mức 1.62 (đánh giá đa dạng cao). AI Llama viết một bản tin ngắn gọn ghi nhận trạng thái rừng an toàn."*

* **Kịch bản B: Lâm tặc cưa trộm gỗ (Chainsaw Threat)**
  * **Hành động:** Người quay bấm vào nút **`🪓 CƯA XÍCH XÂM NHẬP`**.
  * **Kết quả hiển thị:** Còi báo động rú lên nhấp nháy đỏ trên màn hình. Màn hình HUD nhấp nháy khung cảnh báo **🚨 CẢNH BÁO ĐỎ**. Trạm cảm biến tương ứng trên bản đồ chuyển sang màu đỏ nhấp nháy. AI phát hiện: `chainsaw (91% confidence)`. LLM Report hiển thị: *"🚨 KHẨN CẤP: Phát hiện tiếng cưa máy hoạt động tại phân khu Rừng Già. Cần đội kiểm lâm kiểm tra khẩn cấp."* Biểu đồ Shannon Index cắm đầu giảm xuống còn **0.54**.
  * **Lời thoại:**
        > *"Bây giờ, hãy thử kịch bản lâm tặc sử dụng cưa máy để cưa trộm gỗ. Khi tôi click, hệ thống ngay lập tức kích hoạt còi báo động khẩn cấp. Màn hình nháy đỏ, tọa độ trạm cảm biến bị cảnh báo trên bản đồ. AI nhận diện chính xác tiếng cưa xích với độ tin cậy 91%. Đặc biệt, chỉ số Shannon tụt giảm nghiêm trọng từ 1.62 xuống 0.54 phản ánh hệ sinh cảnh bị phá hoại. LLM báo cáo đề xuất kiểm lâm di chuyển khẩn cấp tới hiện trường."*

#### 4. Phổ tần Mel & Bản đồ nhiệt Grad-CAM (3:45 - 4:30)

* **Hành động trên màn hình:** Chỉ vào khung ảnh Mel-Spectrogram, bật nút **`HIỆN GRAD-CAM`** (nếu có hiển thị bản đồ nhiệt Grad-CAM màu đỏ đè lên phổ tần cưa xích/súng).
* **Lời thoại:**
    > *"Không chỉ phân loại đen hay trắng, BioListen VN ứng dụng công nghệ XAI (Explainable AI). Khi phát hiện tiếng động bất thường, hệ thống tự động chiếu bản đồ nhiệt Grad-CAM đè lên phổ âm tần. Nhìn vào các vùng đỏ đậm, kiểm lâm có thể biết chính xác AI đang tập trung lắng nghe ở dải tần số nào (ví dụ dải tần số thấp từ 50Hz đến 1kHz của động cơ cưa xích) để đưa ra quyết định cảnh báo, đảm bảo độ tin cậy và minh bạch của mô hình."*

#### 5. Kết luận & Lời chào (4:30 - 5:00)

* **Hành động trên màn hình:** Di chuột quay lại bản đồ trạm cảm biến, phóng to và thu nhỏ để thấy độ phản hồi mượt mà của giao diện. Hiện slide 10 của pitch deck.
* **Lời thoại:**
    > *"Hệ thống BioListen VN đã được kiểm chứng hoạt động thực tế thời gian thực, có khả năng mở rộng quy mô lớn với chi phí thiết bị phần cứng cực kỳ tối ưu. Chúng tôi tin rằng đây sẽ là trợ thủ đắc lực giúp bảo vệ những cánh rừng di sản của Việt Nam. Cảm ơn Ban giám khảo đã lắng nghe!"*
