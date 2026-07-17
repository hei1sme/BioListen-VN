# 3. Demo Video Plan (Kịch bản Video 5 Phút Nộp Bài)

**Quy định nộp bài VAIC:** Video trình bày dài tối đa 5 phút.
**Mục tiêu:** Video này dùng để qua vòng loại (lọt vào Top 10). Phải tập trung thuyết phục nhóm **Technical Judge** và **Domain Expert** bằng việc show code PyTorch thật, show Dashboard chạy thật, và phân tích các chỉ số một cách khoa học.

---

## ⏱️ Timeline Storyboard (0:00 - 5:00)

### Phần 1: Giới thiệu, Đề bài & Show code PyTorch (0:00 - 1:15)
*   **On-Screen Action (Hành động trên màn hình):**
    *   0:00 - 0:15: Hiện slide bìa của BioListen VN (có logo Đại học Duy Tân, PyTorch, Track Nông nghiệp).
    *   0:15 - 0:35: Mở sơ đồ liên kết Nông nghiệp - Lâm nghiệp (Slide 2).
    *   0:35 - 1:15: Mở VS Code, lướt qua file `pytorch_components.py`. Zoom cận cảnh vào class `BioListenModel` kế thừa từ `nn.Module`, đoạn code khởi tạo `EfficientNet-V2` backbone và hai nhánh linear output song song, kèm dòng code tính `WeightedCrossEntropyLoss`.
*   **Voiceover (Giọng đọc):**
    > "Chào Ban giám khảo. Đây là BioListen VN, giải pháp giải quyết đề tài Giám sát sinh thái thuộc Track Nông nghiệp do Đại học Duy Tân đặt ra. Chúng tôi kết hợp chặt chẽ việc bảo vệ rừng Cúc Phương với sự bền vững nông canh vùng hạ lưu. 
    > Về mặt AI, chúng tôi sử dụng mô hình PyTorch Multi-Task CNN nguyên bản tự thiết kế, huấn luyện với kỹ thuật Weighted Cross-Entropy Loss để khắc phục vấn đề mất cân bằng dữ liệu của các loài trong tự nhiên."

### Phần 2: Demo thực tế trạm Edge & Chỉ số Shannon H' (1:15 - 2:30)
*   **On-Screen Action:**
    *   Chuyển sang trình duyệt chạy trang web online: `https://biolistenvn.vercel.app`.
    *   Click nút `[BÌNH MINH YÊN BÌNH]`.
    *   Màn hình load spectrogram. Dưới bảng kết quả hiển thị phát hiện Chim và Khỉ (Macaque).
    *   Chỉ vào biểu đồ Shannon-Wiener Index đang tăng lên mức [Index].
*   **Voiceover:**
    > "Đây là giao diện giám sát Cyberpunk HUD của chúng tôi. Khi chạy kịch bản rừng yên bình, micro thu tiếng động vật, mô hình thực hiện inference dưới [Y] ms để nhận diện các loài chim thú mục tiêu. 
    > Đồng thời, hệ thống tự động tính toán chỉ số đa dạng sinh học Shannon-Wiener theo thời gian thực và vẽ biểu đồ xu hướng sức khỏe sinh thái trực quan."

### Phần 3: Cảnh báo Lâm tặc & AI Agent Action (2:30 - 3:45)
*   **On-Screen Action:**
    *   Click nút `[CƯA XÍCH XÂM NHẬP]`.
    *   Hệ thống chuyển trạng thái Báo động Đỏ 🚨. Bản đồ Cúc Phương nhấp nháy đỏ tại vị trí Trạm A.
    *   Zoom vào khung Báo cáo AI Agent (Groq Llama 3.1 70B) đang tự động sinh báo cáo hành động tiếng Việt cho kiểm lâm.
*   **Voiceover:**
    > "Khi phát hiện âm thanh đe dọa như tiếng cưa xích, hệ thống lập tức kích hoạt còi hú và báo động đỏ vị trí trạm trên bản đồ. Thay vì bắt kiểm lâm đọc các chỉ số AI phức tạp, AI Agent tích hợp sẽ tự động sinh báo cáo khẩn cấp bằng tiếng Việt đề xuất phương án tác chiến tức thì."

### Phần 4: Giải thích Khoa học - Grad-CAM & MC-Dropout (3:45 - 4:30)
*   **On-Screen Action:**
    *   Bật toggle `[Show Grad-CAM]`. Màn hình hiển thị bản đồ nhiệt Grad-CAM đè lên spectrogram tiếng cưa xích.
    *   Hiện sơ đồ giải thích khoảng tin cậy của MC-Dropout lọc nhiễu sấm sét/mưa rào.
*   **Voiceover:**
    > "Để đảm bảo tính minh bạch, Grad-CAM giúp kiểm lâm nhìn thấy chính xác dải tần số AI tập trung lắng nghe để đưa ra quyết định. Thêm vào đó, thuật toán MC-Dropout giúp đo lường độ bất định khi trời mưa bão lớn, ngăn ngừa báo động giả làm hao tổn lực lượng tuần tra."

### Phần 5: Simulated Edge & Khả năng Thương mại (4:30 - 5:00)
*   **On-Screen Action:**
    *   Show file model `.onnx` siêu nhẹ và cấu trúc bản tin JSON gửi qua mạng LoRaWAN (< [Z] Bytes).
    *   Hiện Slide lộ trình Agile (PCB -> Pilot -> Scale [N] trạm).
*   **Voiceover:**
    > "Bằng cách tối ưu xuất mô hình sang chuẩn ONNX Runtime, BioListen VN chạy mượt mà trên chip ESP32-S3 với tổng giá thành phần cứng dưới [Cost] đô la, chỉ gửi dữ liệu JSON siêu nhẹ qua LoRa. Đây là giải pháp thực tế, chi phí thấp, sẵn sàng triển khai diện rộng trên toàn bộ 34 Vườn Quốc Gia của Việt Nam. Cảm ơn Ban giám khảo."
