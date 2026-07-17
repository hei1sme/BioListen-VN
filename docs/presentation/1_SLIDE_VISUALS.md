# 1. Slide Visuals (Hướng dẫn Thiết kế Graphic)

**Nguyên tắc cốt lõi (Theo chuẩn Top 1 Hackathon):** 
- KHÔNG BÊ NGUYÊN ĐOẠN VĂN VÀO SLIDE.
- Tối đa 15 chữ / Slide. 
- Sử dụng Hình ảnh (Mockup UI, Sơ đồ khối, Biểu đồ) làm trung tâm. Mọi giải thích chi tiết sẽ nằm ở `2_LIVE_PITCH_SCRIPT.md`.

---

### Slide 1: Bìa dự án (Title Slide)
*   **Visual chính:** Logo BioListen VN ở giữa, bao quanh bởi giao diện HUD màu tối phát sáng (Cyberpunk neon `#39FF14`).
*   **Chữ trên slide:** 
    *   BioListen VN 
    *   Lắng nghe hơi thở của rừng sâu bằng Trí tuệ Nhân tạo.
    *   NeuraX.ai — VAIC 2026

### Slide 2: Đặt vấn đề (Pain Points)
*   **Visual chính:** 3 icon to, rõ ràng đặt trên 3 cột.
    1.  [Icon Rừng lớn] -> Tuần tra thủ công bất khả thi.
    2.  [Icon Đồng hồ cát hết giờ] -> Phát hiện quá muộn (Lâm tặc đã tẩu thoát).
    3.  [Icon Biểu đồ đi xuống] -> Thiếu dữ liệu sinh thái thời gian thực.
*   **Chữ trên slide:** "Tuần tra thủ công" | "Phát hiện muộn" | "Mù dữ liệu sinh thái"

### Slide 3: Giải pháp BioListen VN
*   **Visual chính:** Một sơ đồ (Mockup) 3 bước đơn giản nằm ngang:
    `[Mic Năng lượng mặt trời] -> [Mạng LoRa] -> [Màn hình HUD Cảnh báo đỏ]`
*   **Chữ trên slide:** "100% Tự động" | "Bảo vệ 24/7" | "Cảnh báo tức thời"

### Slide 4: Kiến trúc AI Cốt lõi (Dành cho Giám khảo PyTorch)
*   **Visual chính:** Sơ đồ Architecture của mạng Neural.
    *   Bên trái: `Audio 5s` -> `Mel-spectrogram (3, 224, 224)`
    *   Ở giữa: `EfficientNet-V2 (PyTorch nn.Module) - Frozen Backbone`
    *   Bên phải tách làm 2 nhánh (Custom MLP Heads):
        *   Nhánh 1: Biodiversity (Chim, Khỉ, Ếch...)
        *   Nhánh 2: Threat (Cưa xích, Súng)
*   **Chữ nhấn mạnh (Bôi đậm):** "PyTorch Native" | "Multi-Task CNN" | "MC-Dropout (Uncertainty)" | "PyTorch AMP"

### Slide 5: Explainable AI & Sinh thái (Dành cho Chuyên gia Rừng)
*   **Visual chính (Chia 2 nửa màn hình):**
    *   *Nửa trái:* Hình ảnh bản đồ nhiệt **Grad-CAM** đỏ rực đè lên phổ tần số của tiếng cưa xích. (Chú thích: Phá vỡ hộp đen AI).
    *   *Nửa phải:* Biểu đồ đường của **Shannon-Wiener Index (H')** đi lên/đi xuống.
*   **Chữ trên slide:** "Grad-CAM: Độ tin cậy tuyệt đối" | "Shannon-Wiener H': Số hóa độ trù phú"

### Slide 6: Giao diện HUD Dashboard (Live Demo Preview)
*   **Visual chính:** Chụp màn hình (Screenshot) toàn cảnh giao diện web Next.js đang chạy thật (Có biểu đồ, có sidebar, có bản đồ Cúc Phương). Có thể để dưới dạng Mockup gắn vào màn hình Laptop.
*   **Chữ trên slide:** "Live Edge Dashboard" | "Trực quan" | "Tốc độ phản hồi <150ms"

### Slide 7: Kết quả thử nghiệm (Metrics)
*   **Visual chính:** 3 con số siêu to khổng lồ nằm giữa màn hình.
    *   **92%** (Accuracy trên ESC-50 & 5 loài đặc hữu)
    *   **< 150ms** (Độ trễ Inference)
    *   **< 100 Bytes** (JSON Payload truyền qua LoRa)
*   **Chữ trên slide:** Không có chữ thừa, chỉ để Label dưới các con số.

### Slide 8: Thương mại hóa & Simulated Edge (Dành cho Senior Judge)
*   **Visual chính:** Đồ thị so sánh chi phí hoặc bảng so sánh.
    *   `AudioMoth (Cũ): >$100`
    *   `BioListen VN (Mới): <$15 (ESP32-S3 + Mic I2S)`
*   **Chữ trên slide:** "Kiến trúc Simulated Edge: Sẵn sàng On-device" | "Chi phí giảm 85%"

### Slide 9: Lộ trình phát triển (Roadmap)
*   **Visual chính:** Timeline mũi tên 3 mốc thời gian:
    *   Mốc 1 (Hiện tại): Live Web Prototype.
    *   Mốc 2 (3-6 tháng): Phần cứng chống nước + Chip STM32/Nuvoton.
    *   Mốc 3 (12 tháng): Triển khai 10 trạm tại Rừng Già Cúc Phương.
*   **Chữ trên slide:** "Prototype" -> "Hardware Build" -> "Pilot Cúc Phương"

### Slide 10: Lời cảm ơn & Q&A
*   **Visual chính:** Tên và hình ảnh 3 thành viên team NeuraX.ai kèm mã QR dẫn đến Github/Live Demo.
*   **Chữ trên slide:** "Sẵn sàng bảo vệ rừng di sản Việt Nam." | "Q&A"
