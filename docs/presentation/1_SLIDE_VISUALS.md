# 1. Slide Visuals (Hướng dẫn Thiết kế Graphic & Layout)

**Hệ thống thiết kế (Design System - Premium Organic & Clean Eco):**
- **Nền (Background):** Nền kem sáng ấm (#FAF9F5) tạo cảm giác tự nhiên, sinh thái và sang trọng.
- **Màu chủ đạo (Primary Color):** Xanh lá đậm rừng già (#122915) dùng cho tiêu đề chính, các khối cấu trúc lớn.
- **Màu nhấn (Accent Color):** Vàng cát/vàng đất ấm (#D4A373) dùng cho điểm nhấn thông số kỹ thuật, số liệu nổi bật.
- **Màu cảnh báo (Alert Color):** Đỏ cam đất (#E63946) dùng riêng cho cảnh báo cưa xích/súng.
- **Font chữ:** Tiêu đề lớn dùng font có chân Serif cao cấp (`Playfair Display`); Nội dung dùng font không chân Sans-serif (`Inter` hoặc `Outfit`) để tối ưu hiển thị.
- **Hiệu ứng Inversion:** Slide bìa sử dụng nền tối màu xanh rừng già (#122915) chữ màu kem để tạo ấn tượng ban đầu cực kỳ chuyên nghiệp và chiều sâu sinh thái.
- **Hybrid Tech Card:** Các phần hiển thị code PyTorch hoặc HUD Dashboard được đặt trong khung nền tối (màu sắc mô phỏng phòng giám sát kiểm lâm) để làm nổi bật tính công nghệ.

---

### Slide 1: Bìa dự án (Title Slide)

* **Visual chính:** Logo BioListen VN phát sáng tinh tế trên nền tối màu xanh rừng sâu (#122915) với các đường lưới HUD vàng cát mỏng nghệ thuật.
- **Logo đính kèm:** Logo Đại học Duy Tân (DTU) và Logo PyTorch nằm ở góc phải phía trên với tông màu kem/vàng cát đồng bộ.
- **Chữ trên slide:**
  - **BioListen VN**
  - *Giám sát sinh thái & Cảnh báo an ninh rừng quốc gia thời gian thực*
  - **Track Nông Nghiệp** - Thử thách đặt ra bởi **Đại học Duy Tân**
  - Đội ngũ NeuraX.ai (Hackathon VAIC 2026)

### Slide 2: Đặt vấn đề (Lâm nghiệp & Nông nghiệp bền vững)

* **Visual chính:** Sơ đồ nhân quả dạng infographic tối giản trên nền kem:
    `Phá rừng đầu nguồn (tiếng cưa xích/súng) -> Xói mòn đất & Mất nguồn nước -> Tàn phá nông nghiệp hạ lưu`
- **Số liệu nổi bật (Đặt trong card màu đỏ cam đất nhạt):** **22.000 ha** (Rừng Cúc Phương) | **"Mù" dữ liệu sinh thái** (Tuần tra thủ công bất khả thi).
- **Chữ trên slide:** "Rừng là lá chắn của Nông nghiệp" | "Mất rừng = Sụp đổ nguồn nước nông canh"

### Slide 3: Giải pháp BioListen VN (Simulated Edge-to-Cloud)

* **Visual chính:** Sơ đồ luồng hoạt động 3 bước kết nối bởi nét vẽ vàng cát thanh lịch trên nền kem:
    1. `[Trạm Edge AI tự cấp nguồn]` (ESP32-S3 + Solar) thu âm.
    2. `[Sóng truyền tin LoRaWAN]` chuyển dữ liệu siêu nhẹ (dưới 20 Bytes JSON).
    3. `[Cloud HUD Dashboard]` vẽ phổ tần và Grad-CAM cảnh báo tức thì cho kiểm lâm.
- **Chữ trên slide:** "Edge AI lọc nhiễu" | "Truyền sóng LoRaWAN cực đại" | "Cảnh báo khẩn cấp tức thời"

### Slide 4: Kiến trúc mô hình AI (Thuyết phục Giám khảo PyTorch)

* **Visual chính:** Chia làm 2 cột:
  - *Cột trái:* Sơ đồ luồng tensor thiết kế bằng các khối màu xanh lá đậm và kem: 
    * **Tập dữ liệu:** Kết hợp **BioListen VN Grouping Species** & **FSC22 Forest Sounds** (Các loài đặc hữu và dữ liệu âm thanh môi trường).
    * **Tiền xử lý:** Audio (5.0s, resample 22,050Hz) -> 2D Mel-spectrogram -> resize (3, 224, 224).
    * **Mô hình:** `EfficientNet-V2-S (Frozen Backbone)` -> Phân tách thành 2 nhánh MLP Heads (`Biodiversity Head` & `Threat Head`).
  - *Cột phải (Khung Dark Mode Card):* **Đoạn code PyTorch thật** (Trực quan hóa đoạn `nn.Module` định nghĩa Multi-task model và loss kết hợp):

        ```python
        class BioListenModel(nn.Module):
            # Custom PyTorch Multi-Task Head
            def forward(self, x):
                features = self.backbone(x)
                species_out = self.species_head(features)
                threat_out = self.threat_head(features)
                return species_out, threat_out
        ```

* **Chữ nhấn mạnh:** **PyTorch Native** | **Multi-Task learning** | **Loss weighting (Weighted Cross-Entropy)**

### Slide 5: Explainable AI (XAI) & Lọc nhiễu tự nhiên

* **Visual chính (Chia 2 nửa):**
  - *Nửa trái:* Hình ảnh bản đồ nhiệt **Grad-CAM** màu đỏ rực đè lên phổ tần số của tiếng cưa xích trên nền tối của biểu đồ quang phổ.
  - *Nửa phải:* Đồ thị toán học thể hiện kỹ thuật **MC-Dropout** lúc Test-time để đo lường độ bất định (Uncertainty), vùng bất định được tô màu vàng cát nhạt.
- **Chữ trên slide:** "Grad-CAM: Đập tan hộp đen AI" | "MC-Dropout: Triệt tiêu báo động giả do mưa/gió"

### Slide 6: Số hóa sức khỏe hệ sinh thái (Thuyết phục Giáo sư DTU)

* **Visual chính:** Công thức toán học chỉ số Shannon-Wiener nổi bật ở trung tâm trên nền khung xanh rừng già nhạt:
    $$H' = -\sum_{i=1}^{S} p_i \ln p_i$$
    *Dưới công thức là biểu đồ Recharts mô phỏng biến động H' tăng/giảm theo từng giờ, cột H18 tụt sâu được tô màu đỏ cam đất cảnh báo.*
- **Chữ trên slide:** "Shannon-Wiener H' thời gian thực" | "Số hóa mật độ loài" | "Đo lường sức khỏe sinh cảnh tự động"

### Slide 7: Kết quả thử nghiệm (Metrics)

* **Visual chính:** Bảng grid 4 cột thể hiện rõ nét các thông số kỹ thuật then chốt sử dụng thẻ chờ:
  - **Độ chính xác (Accuracy):** **94.6%** (Nhận diện tiếng cưa/súng & 3 nhóm loài đặc hữu).
  - **Độ trễ (Inference Latency):** **< 30 ms** (Tối ưu hóa chạy trên CPU Edge).
  - **Dữ liệu truyền (Payload Size):** **< 20 Bytes** (Băng thông siêu nhẹ cho LoRaWAN).
  - **Tỷ lệ bất định (Uncertainty Rate):** **< 15%** (MC-Dropout triệt tiêu báo động giả).
- **Chữ trên slide:** "Độ tin cậy vượt trội - Tối ưu hóa cực hạn cho thiết bị biên"

### Slide 8: Thương mại hóa & Simulated Edge (Dành cho Senior Judge)

* **Visual chính:** Biểu đồ so sánh chi phí thiết bị dạng thanh ngang:
  - `Thiết bị sinh học tiêu chuẩn (AudioMoth): > $100` (Không có Edge AI xử lý tại chỗ).
  - `Trạm BioListen VN: < $15 USD` (Mạch ESP32-S3 + Mic I2S chạy ONNX Quantized).
- **Sơ đồ minh họa:** `Audio gốc nặng -> Xử lý Edge -> Chỉ gửi JSON payload dưới 20 Bytes qua LoRa`.
- **Chữ trên slide:** "Inference ONNX Runtime trên CPU giá rẻ" | "Tiết kiệm 80% chi phí phần cứng"

### Slide 9: Lộ trình phát triển thực tế (Agile Roadmap)

* **Visual chính:** Trục thời gian 3 mốc rõ ràng được trình bày bằng các thẻ màu kem/xanh rừng thanh lịch:
  - **Tháng 1:** Hoàn thiện thiết kế PCB & vỏ hộp chống nước tiêu chuẩn IP67.
  - **Tháng 3:** Triển khai thử nghiệm trạm POC đầu tiên tại Phân khu Rừng Già Cúc Phương để thu tập dữ liệu thực địa.
  - **Tháng 6:** Gọi vốn Seed vòng 1 để sản xuất và phủ sóng 50 trạm toàn phân khu.
- **Chữ trên slide:** "Mạch PCB IP67" -> "Pilot Cúc Phương" -> "Thương mại hóa diện rộng"

### Slide 10: Đội ngũ & Q&A

* **Visual chính:** Ảnh 3 thành viên đội ngũ NeuraX.ai kèm vòng tròn gold bao quanh và vai trò rõ ràng:
  - **Lê Nguyễn Gia Hưng:** UI/UX & AI System Integration.
  - **Huỳnh Quốc Việt:** AI Model Architect (PyTorch).
  - **Hồ Minh Hiếu:** Cloud Deploy & IoT Engineer.
- *Mã QR lớn màu xanh rừng già dẫn link trực tiếp tới GitHub Repository và Live URL để Giám khảo quét tại chỗ.*
- **Chữ trên slide:** "Sẵn sàng bảo tồn và chuyển đổi số Lâm nghiệp Việt Nam." | "Q&A"
