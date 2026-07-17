# 3. Demo Video Plan (Kịch bản Video 5 Phút Nộp Bài)

**Quy định nộp bài VAIC:** Video trình bày dài tối đa 5 phút. 
**Mục tiêu:** Video này dùng để qua vòng loại (lọt vào Top 10). Khác với Live Pitch, video này cần Show Code, Show Demo và các hành động trên màn hình (Screen Recording) rõ nét nhất có thể.

---

## ⏱️ Timeline Storyboard (0:00 - 5:00)

### Phần 1: Giới thiệu & Show Kiến trúc (0:00 - 1:00)
*   **On-Screen Action (Hành động trên màn hình):**
    *   0:00 - 0:15: Mở slide bìa và slide Đặt vấn đề.
    *   0:15 - 0:40: Mở nhanh Visual Studio Code (hoặc GitHub) lướt qua file `pytorch_components.py` để giám khảo thấy team tự code PyTorch thật sự chứ không gọi API ngoài. Dừng màn hình 2 giây ở đoạn code có chữ `nn.Module` và `EfficientNet`.
    *   0:40 - 1:00: Mở trình duyệt, truy cập thẳng vào Live URL: `https://biolistenvn.vercel.app`.
*   **Voiceover (Giọng đọc):**
    > "Chào Ban giám khảo. Đây là hệ thống BioListen VN. Thay vì dùng API đám mây, chúng tôi tự xây dựng một mô hình Multi-Task CNN bằng PyTorch từ đầu để nhận diện chim thú và tiếng cưa xích. Và đây là hệ thống Dashboard thời gian thực của chúng tôi đang chạy Live trên server."

### Phần 2: Demo tính năng 1 - Hệ sinh thái yên bình (1:00 - 2:00)
*   **On-Screen Action:**
    *   Chuột click vào nút `[BÌNH MINH YÊN BÌNH]` trên Forest Simulator.
    *   Trình phát audio chạy (có âm thanh chim hót).
    *   Biểu đồ Mel-Spectrogram load ảnh.
    *   Chuột khoanh vùng bảng kết quả: Hiển thị Khỉ (Macaque) & Chim.
    *   Chuột khoanh vùng Biểu đồ Shannon Index tăng lên (xanh lá).
*   **Voiceover:**
    > "Khi rừng yên bình, micro thu được tiếng động vật. Mô hình PyTorch phân tích Audio thành phổ tần Mel-Spectrogram trong chưa tới 150ms. AI nhận diện được tiếng Khỉ và tiếng Chim. Chỉ số sức khỏe sinh thái Shannon lập tức được tính toán và vẽ lên biểu đồ để kiểm lâm theo dõi."

### Phần 3: Demo tính năng 2 - Báo động Lâm tặc (2:00 - 3:15)
*   **On-Screen Action:**
    *   Chuột click vào nút `[CƯA XÍCH XÂM NHẬP]`.
    *   Giao diện nhấp nháy ĐỎ 🚨. Tiếng còi hú kêu lên.
    *   Bản đồ Cúc Phương bên trái nháy đỏ tại Trạm A.
    *   Zoom cận cảnh vào báo cáo của LLM: "Phát hiện tiếng cưa máy..."
*   **Voiceover:**
    > "Khi lâm tặc xuất hiện, AI ngay lập tức phát hiện tiếng cưa xích. Màn hình HUD chuyển trạng thái Báo động Đỏ. LLM Agent của chúng tôi sẽ dịch dữ liệu thô thành một bản báo cáo khẩn cấp bằng tiếng Việt để điều động lực lượng kiểm lâm."

### Phần 4: Demo tính năng 3 - Explainable AI (Grad-CAM) (3:15 - 4:15)
*   **On-Screen Action:**
    *   Bật toggle switch `[Show Grad-CAM]`.
    *   Màn hình đè lớp bản đồ nhiệt đỏ/vàng lên ảnh phổ tần của tiếng cưa xích. Chuột chỉ vào vùng màu đỏ sậm nhất.
*   **Voiceover:**
    > "Để đảm bảo AI không báo động giả, chúng tôi tích hợp Grad-CAM. Bản đồ nhiệt này trích xuất từ các layer của mạng CNN, chỉ đích danh vùng tần số thấp của động cơ cưa xích mà AI đã lắng nghe. Kiểm lâm hoàn toàn có thể nhìn vào đây để xác nhận trực quan trước khi ra quyết định."

### Phần 5: Simulated Edge & Kết luận (4:15 - 5:00)
*   **On-Screen Action:**
    *   Mở Terminal, gõ lệnh `ls` hoặc show file `model.onnx` dung lượng cực nhẹ. Hoặc show một đoạn JSON log rất ngắn.
    *   Quay lại trang Dashboard, lướt tổng thể.
*   **Voiceover:**
    > "Cuối cùng, kiến trúc Simulated Edge của chúng tôi cho phép mô hình chạy mượt mà trên chuẩn ONNX, phù hợp với phần cứng siêu rẻ như ESP32. Thiết bị tại rừng chỉ cần gửi 1 chuỗi JSON chưa tới 100 bytes qua mạng LoRaWAN, giải quyết triệt để bài toán về pin mặt trời và băng thông. Xin cảm ơn Ban giám khảo."
