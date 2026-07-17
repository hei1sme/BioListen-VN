# 1. Slide Visuals (Hướng dẫn Thiết kế Graphic & Layout)

**Nguyên tắc cốt lõi (Chuẩn mực Top 1 & PyTorch Award):**
- **Cực kỳ trực quan:** Sử dụng hình ảnh thực tế, sơ đồ kiến trúc, công thức toán học và các đoạn mã nguồn PyTorch làm trọng tâm.
- **Tiêu chuẩn văn bản:** Tối giản tối đa (dưới 15 từ mỗi slide). Các chi tiết chiều sâu sẽ được giải thích qua lời thoại thuyết trình.

---

### Slide 1: Bìa dự án (Title Slide)
*   **Visual chính:** Logo BioListen VN phát sáng trên nền tối (HUD glassmorphic Cyberpunk).
*   **Logo đính kèm:** Logo Đại học Duy Tân (DTU) và Logo PyTorch nằm ở góc phải phía trên.
*   **Chữ trên slide:**
    *   **BioListen VN**
    *   *Giám sát sinh thái & Cảnh báo an ninh rừng quốc gia thời gian thực*
    *   **Track Nông Nghiệp** - Thử thách đặt ra bởi **Đại học Duy Tân**
    *   Đội ngũ NeuraX.ai (Hackathon VAIC 2026)

### Slide 2: Đặt vấn đề (Lâm nghiệp & Nông nghiệp bền vững)
*   **Visual chính:** Sơ đồ nhân quả dạng infographic:
    `Phá rừng đầu nguồn (tiếng cưa xích/súng) -> Xói mòn đất & Mất nguồn nước -> Tàn phá nông nghiệp hạ lưu`
*   **Số liệu nổi bật:** **22.000 ha** (Rừng Cúc Phương) | **"Mù" dữ liệu sinh thái** (Tuần tra thủ công bất khả thi).
*   **Chữ trên slide:** "Rừng là lá chắn của Nông nghiệp" | "Mất rừng = Sụp đổ nguồn nước nông canh"

### Slide 3: Giải pháp BioListen VN (Simulated Edge-to-Cloud)
*   **Visual chính:** Sơ đồ luồng hoạt động 3 bước tinh gọn:
    1.  `[Trạm Edge AI tự cấp nguồn]` (ESP32-S3 + Solar) thu âm.
    2.  `[Sóng truyền tin LoRaWAN]` chuyển dữ liệu siêu nhẹ (< [Z] Bytes JSON).
    3.  `[Cloud HUD Dashboard]` vẽ phổ tần và Grad-CAM cảnh báo tức thì cho kiểm lâm.
*   **Chữ trên slide:** "Edge AI lọc nhiễu" | "Truyền sóng LoRaWAN cực đại" | "Cảnh báo khẩn cấp tức thời"

### Slide 4: Kiến trúc mô hình AI (Thuyết phục Giám khảo PyTorch)
*   **Visual chính:** Chia làm 2 cột:
    *   *Cột trái:* Sơ đồ luồng tensor: `Audio (5s)` -> `Mel-spectrogram (3, 224, 224)` -> `EfficientNet-V2 (Frozen Backbone)` -> Phân tách thành 2 nhánh MLP Heads (`Biodiversity Head` & `Threat Head`).
    *   *Cột phải:* **Đoạn code PyTorch thật** (Trực quan hóa đoạn `nn.Module` định nghĩa Multi-task model và loss kết hợp):
        ```python
        class BioListenModel(nn.Module):
            # Custom PyTorch Multi-Task Head
            def forward(self, x):
                features = self.backbone(x)
                species_out = self.species_head(features)
                threat_out = self.threat_head(features)
                return species_out, threat_out
        ```
*   **Chữ nhấn mạnh:** **PyTorch Native** | **Multi-Task learning** | **Loss weighting (Weighted Cross-Entropy)**

### Slide 5: Explainable AI (XAI) & Lọc nhiễu tự nhiên
*   **Visual chính (Chia 2 nửa):**
    *   *Nửa trái:* Hình ảnh bản đồ nhiệt **Grad-CAM** đỏ rực đè lên phổ tần số của tiếng cưa xích. (Chú thích: Trích xuất Activation Maps từ convolutional layers để minh bạch quyết định AI).
    *   *Nửa phải:* Đồ thị toán học thể hiện kỹ thuật **MC-Dropout** lúc Test-time để đo lường độ bất định (Uncertainty).
*   **Chữ trên slide:** "Grad-CAM: Đập tan hộp đen AI" | "MC-Dropout: Triệt tiêu báo động giả do mưa/gió"

### Slide 6: Số hóa sức khỏe hệ sinh thái (Thuyết phục Giáo sư DTU)
*   **Visual chính:** Công thức toán học chỉ số Shannon-Wiener to, rõ ở trung tâm:
    $$H' = -\sum_{i=1}^{S} p_i \ln p_i$$
    *Dưới công thức là biểu đồ đường Recharts mô phỏng biến động H' tăng/giảm theo từng giờ dựa trên số lượng đếm loài chim của AI.*
*   **Chữ trên slide:** "Shannon-Wiener H' thời gian thực" | "Số hóa mật độ loài" | "Đo lường sức khỏe sinh cảnh tự động"

### Slide 7: Kết quả thử nghiệm (Metrics)
*   **Visual chính:** Bảng so sánh các thông số đo lường hiệu năng (Placeholder):
    | Chỉ số | Kết quả thực nghiệm | Ý nghĩa |
    | :--- | :--- | :--- |
    | **Accuracy** | **[X]%** | Đạt chuẩn nhận diện tiếng cưa/súng & 5 loài động vật mục tiêu |
    | **Inference Latency** | **< [Y] ms** | Tối ưu hóa cực hạn để chạy trên CPU Edge |
    | **Uncertainty Rate** | **< [U]%** | Giảm thiểu tối đa sai sót nhờ MC-Dropout |
*   **Chữ trên slide:** "Chính xác cao - Phản hồi thời gian thực"

### Slide 8: Thương mại hóa & Simulated Edge (Dành cho Senior Judge)
*   **Visual chính:** Biểu đồ cột so sánh chi phí thiết bị:
    *   `Thiết bị sinh học tiêu chuẩn (AudioMoth): > $100` (Không có Edge AI xử lý tại chỗ).
    *   `Trạm BioListen VN: < $[Cost]` (Mạch ESP32-S3 + Mic I2S chạy ONNX).
*   **Sơ đồ minh họa:** `Audio gốc nặng -> Xử lý Edge -> Chỉ gửi JSON payload < [Z] Bytes qua LoRa`.
*   **Chữ trên slide:** "Inference ONNX Runtime trên CPU giá rẻ" | "Tiết kiệm [W]% chi phí phần cứng"

### Slide 9: Lộ trình phát triển thực tế (Agile Roadmap)
*   **Visual chính:** Trục thời gian 3 mốc rõ ràng, hướng đến thương mại hóa:
    *   **Tháng 1:** Hoàn thiện thiết kế PCB & vỏ hộp chống nước tiêu chuẩn IP67.
    *   **Tháng 3:** Triển khai thử nghiệm trạm POC đầu tiên tại Phân khu Rừng Già Cúc Phương để thu thập tập dữ liệu thực địa.
    *   **Tháng 6:** Gọi vốn Seed vòng 1 để sản xuất và phủ sóng [N] trạm toàn phân khu.
*   **Chữ trên slide:** "Mạch PCB IP67" -> "Pilot Cúc Phương" -> "Thương mại hóa diện rộng"

### Slide 10: Đội ngũ & Q&A
*   **Visual chính:** Ảnh 3 thành viên đội ngũ NeuraX.ai kèm vai trò rõ ràng:
    *   **Lê Nguyễn Gia Hưng:** UI/UX & AI System Integration.
    *   **Nguyễn Anh Việt:** AI Model Architect (PyTorch).
    *   **Hồ Minh Hiếu:** Cloud Deploy & IoT Engineer.
*   *Mã QR lớn dẫn link trực tiếp tới GitHub Repository và Live URL để Giám khảo quét tại chỗ.*
*   **Chữ trên slide:** "Sẵn sàng bảo tồn và chuyển đổi số Lâm nghiệp Việt Nam." | "Q&A"
