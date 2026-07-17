# 2. Live Pitch Script (Kịch bản thuyết trình Top 10)

Đây là kịch bản người thuyết trình sẽ **nói trực tiếp** trước Ban Giám khảo (Bao gồm Senior Judges, AI Labs, Domain Experts).
*Quy tắc:* Nói to, rõ, nhấn mạnh vào các Keyword in đậm. Dừng 1 giây ở các thẻ `[Pause]`.

---

### [Slide 1: Bìa dự án]
**Speaker:**
"Kính chào Ban Giám khảo VAIC 2026. Chúng tôi là đội NeuraX.ai. Hôm nay, chúng tôi mang đến giải pháp **BioListen VN** — Hệ thống giúp chúng ta *lắng nghe hơi thở của rừng sâu* bằng Trí tuệ Nhân tạo."

### [Slide 2: Đặt vấn đề]
**Speaker:**
"Rừng quốc gia Cúc Phương có diện tích 22.000 hecta. `[Pause]`. Tuần tra thủ công là bất khả thi. Khi kiểm lâm nghe thấy tiếng cưa máy hay súng săn bằng tai thường... thì lâm tặc đã tẩu thoát từ lâu. Hơn nữa, chúng ta đang bị mù dữ liệu sinh thái: không ai biết thực sự mật độ chim thú đang tăng hay giảm theo thời gian thực."

### [Slide 3: Giải pháp BioListen VN]
**Speaker:**
"BioListen VN giải quyết bài toán này bằng mạng lưới trạm cảm biến âm thanh năng lượng mặt trời. Hệ thống thu âm 24/7 và biến âm thanh thành ảnh phổ tần số. Từ đó, AI sẽ đóng vai trò như đôi tai siêu phàm của rừng, tự động lọc tiếng ồn và phân loại âm thanh ngay tức khắc."

### [Slide 4: Kiến trúc AI Cốt lõi]
**Speaker:**
"Để chinh phục giới hạn công nghệ, chúng tôi KHÔNG sử dụng các API đóng sẵn. Cốt lõi của chúng tôi là một mô hình **Multi-Task CNN** tự thiết kế hoàn toàn bằng **PyTorch**. Chúng tôi đóng băng các layer trích xuất đặc trưng của EfficientNet-V2, và xây dựng các **Custom MLP Heads** để vừa nhận diện 5 loài động vật mục tiêu, vừa phát hiện tiếng cưa xích, súng săn cùng lúc. 
Đặc biệt, để đảm bảo AI không 'nhận diện bừa' khi gặp tiếng sấm sét, chúng tôi tích hợp kỹ thuật **MC-Dropout** của PyTorch để đo lường độ bất định (Uncertainty). `[Pause]` Đây là một hệ thống AI Native, an toàn và tối ưu."

### [Slide 5: Explainable AI & Sinh thái]
**Speaker:**
"Về mặt sinh thái, chúng tôi là hệ thống đầu tiên tính toán **Chỉ số Shannon-Wiener** theo thời gian thực để số hóa mức độ trù phú của rừng. 
Nhưng quan trọng hơn, khi báo động vang lên, làm sao kiểm lâm dám tin AI? Chúng tôi sử dụng **Grad-CAM**. Bản đồ nhiệt này sẽ tô đỏ chính xác dải tần số mà AI đã nghe thấy tiếng cưa xích, đập tan hoàn toàn 'hộp đen' của mô hình AI, mang lại sự tin tưởng tuyệt đối cho người dùng cuối."

### [Slide 6: Giao diện HUD Dashboard]
**Speaker:**
"Tất cả dữ liệu được đổ về Trung tâm giám sát HUD Cyberpunk mà quý vị đang thấy ở đây. Báo cáo từ AI Agent Llama 3.1 70B sẽ tự động dịch các cảnh báo thô thành lệnh điều động tuần tra bằng tiếng Việt ngay lập tức."

### [Slide 7: Kết quả thử nghiệm]
**Speaker:**
"Kết quả? Mô hình của chúng tôi đạt độ chính xác lên tới **92%**. `[Pause]` Tốc độ phản hồi Inference dưới **150ms**."

### [Slide 8: Thương mại hóa & Simulated Edge]
**Speaker:**
"Nhiều người sẽ hỏi: Chạy AI nặng như vậy trên rừng bằng cách nào? 
Đó là lý do chúng tôi thiết kế kiến trúc **Simulated Edge**. Bằng cách xuất model sang chuẩn `.onnx`, hệ thống chạy mượt mà trên các chip vi điều khiển cực rẻ như ESP32-S3 với tổng giá trị chưa tới 15 đô la. Và thay vì gửi file âm thanh làm sập mạng, thiết bị chỉ gửi một chuỗi JSON siêu nhỏ dưới 100 bytes qua sóng LoRaWAN. Rẻ, bền bỉ, và sẵn sàng nhân rộng."

### [Slide 9: Lộ trình phát triển]
**Speaker:**
"Hiện tại, hệ thống Web và AI Core đã hoàn thiện 100%. Trong 6 tháng tới, chúng tôi sẽ đóng gói phần cứng chống nước và triển khai thí điểm 10 trạm đầu tiên tại phân khu Rừng Già Cúc Phương. Từ đó, nhân bản ra 34 Vườn Quốc Gia trên cả nước."

### [Slide 10: Lời cảm ơn]
**Speaker:**
"Đó là BioListen VN. Rất mong nhận được câu hỏi từ Ban giám khảo để chúng tôi làm rõ hơn về giải pháp PyTorch Native này. Xin cảm ơn!"
