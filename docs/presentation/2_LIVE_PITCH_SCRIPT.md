# 2. Live Pitch Script (Kịch bản thuyết trình Top 10)

Kịch bản thuyết trình trực tiếp trước Hội đồng Ban Giám khảo VAIC 2026.
*Quy tắc trình bày:* Giọng tự tin, dứt khoát. Nhấn mạnh từ khóa viết hoa hoặc **bôi đậm**. `[Pause]` thể hiện dừng nghỉ 1 giây để thu hút sự chú ý.

---

### [Slide 1: Bìa dự án]
**Speaker:**
"Kính chào Hội đồng Ban Giám khảo VAIC 2026. Chúng tôi là đội ngũ NeuraX.ai. Hôm nay, chúng tôi xin trình bày giải pháp **BioListen VN** — Hệ thống giám sát sinh thái & cảnh báo an ninh rừng quốc gia thời gian thực. Dự án này được thiết kế để giải quyết trực tiếp đề tài Giám sát sinh thái thuộc **Track Nông Nghiệp** do **Đại học Duy Tân** đặt ra."

### [Slide 2: Đặt vấn đề]
**Speaker:**
"Thưa quý vị, tại sao một đề tài bảo vệ rừng lại nằm trong Track Nông Nghiệp? `[Pause]`
Bởi vì rừng Cúc Phương là lá phổi xanh bảo vệ, giữ nước và ngăn xói mòn đất cho toàn bộ vùng nông canh hạ lưu sông Hồng. Mất rừng đầu nguồn đồng nghĩa với việc nông nghiệp hạ lưu sẽ sụp đổ trước lũ lụt và hạn hán. 
Tuy nhiên, với 22.000 ha rừng nguyên sinh, việc tuần tra thủ công hiện tại hoàn toàn bất khả thi. Kiểm lâm đang bị **'mù dữ liệu sinh thái'** — chúng ta không có cách nào số hóa được biến động mật độ sinh vật và phát hiện tiếng súng, tiếng cưa xích kịp thời."

### [Slide 3: Giải pháp BioListen VN]
**Speaker:**
"Để giải quyết triệt để, BioListen VN xây dựng kiến trúc **Simulated Edge-to-Cloud**. Các trạm cảm biến tự cấp nguồn bằng năng lượng mặt trời sẽ thu âm 24/7. AI tại trạm sẽ lọc nhiễu, phân tích âm thanh và chỉ truyền tải các gói dữ liệu cảnh báo siêu nhẹ thông qua sóng truyền tin tầm xa LoRaWAN về trung tâm kiểm lâm. Dữ liệu sau đó được hiển thị trực quan dạng HUD Dashboard trên Cloud."

### [Slide 4: Kiến trúc mô hình AI]
**Speaker:**
"Để cạnh tranh giải thưởng **PyTorch Award**, chúng tôi tuyên bố **KHÔNG sử dụng các API đóng hay wrapper**. Chúng tôi tự thiết kế mô hình **Multi-Task CNN** sử dụng thư viện **PyTorch `nn.Module`** nguyên bản.
Chúng tôi đóng băng các layer đầu của mạng backbone EfficientNet-V2 để trích xuất đặc trưng âm thanh (Mel-spectrogram). Sau đó, mô hình tách thành hai nhánh phân loại song song: Nhánh 1 nhận diện 5 loài động vật đặc hữu, Nhánh 2 phát hiện tiếng cưa xích và súng săn. 
Chúng tôi thiết lập **Weighted Cross-Entropy Loss** cho PyTorch để huấn luyện. Kỹ thuật này giúp giải quyết triệt để bài toán mất cân bằng dữ liệu khi tiếng cưa xích hay súng săn trong tự nhiên có tần suất xuất hiện cực kỳ hiếm so với tiếng chim hót."

### [Slide 5: Explainable AI & Lọc nhiễu tự nhiên]
**Speaker:**
"Hai thách thức lớn nhất của AI âm thanh trong rừng thực tế là: tiếng ồn tự nhiên (mưa lớn, sấm sét) và sự nghi ngờ từ kiểm lâm đối với AI.
Chúng tôi giải quyết bằng hai công nghệ PyTorch nâng cao:
Thứ nhất, chúng tôi áp dụng **MC-Dropout (Monte Carlo Dropout)** ở thời điểm chạy thực tế. Khi gặp tiếng mưa hay gió bão lớn tạo ra độ bất định cao, mô hình sẽ tính toán khoảng tin cậy và báo cáo 'Không chắc chắn' thay vì báo động giả, giúp kiểm lâm không phải chạy bộ 5 cây số vô ích.
Thứ hai, chúng tôi tích hợp **Grad-CAM**. Khi có cảnh báo cưa xích, hệ thống sẽ chiếu bản đồ nhiệt đè lên phổ tần số để kiểm lâm biết chính xác AI đang 'nghe' dải tần số nào. Đây là cách chúng tôi đập tan hộp đen AI, tạo dựng lòng tin tuyệt đối cho lực lượng thực địa."

### [Slide 6: Số hóa sức khỏe hệ sinh thái]
**Speaker:**
"Đối với các Giáo sư và Chuyên gia đến từ Đại học Duy Tân, chúng tôi mang tới một bước đột phá trong phương pháp luận sinh thái: Tự động hóa tính toán chỉ số đa dạng sinh học **Shannon-Wiener (H')** theo thời gian thực.
Hệ thống đếm tần suất xuất hiện của các loài chim, ếch, khỉ trong từng giờ và tự động vẽ đường xu hướng sức khỏe sinh thái lên biểu đồ. Khi chỉ số này tụt dốc, đó là cảnh báo sớm cho thấy sinh cảnh đang bị tàn phá nặng nề."

### [Slide 7: Kết quả kiểm chứng thực nghiệm]
**Speaker:**
"Về mặt hiệu năng, giải pháp của chúng tôi đạt độ chính xác phân loại tổng thể trên **92%**. `[Pause]` Tốc độ chạy mô hình thực tế (Inference Latency) cực kỳ nhanh, dưới **150ms** cho mỗi khung âm thanh 5 giây, hoàn hảo để nhúng trực tiếp vào các phần cứng Edge."

### [Slide 8: Bài toán kinh tế & simulated Edge]
**Speaker:**
"Một dự án khoa học chỉ có giá trị khi nó có khả năng thương mại hóa thực tế. Thiết bị sinh học truyền thống như AudioMoth có giá hơn 100 đô la nhưng không có AI xử lý tại chỗ.
Với BioListen VN, chúng tôi tối ưu mô hình PyTorch, xuất ra chuẩn **ONNX Runtime** để chạy trực tiếp trên vi điều khiển giá rẻ ESP32-S3 với tổng chi phí linh kiện **dưới 15 đô la**. Đồng thời, thay vì stream file âm thanh nặng nề làm cạn kiệt băng thông, thiết bị Edge chỉ gửi gói JSON **dưới 100 Bytes** qua sóng LoRaWAN. Đây chính là công thức giúp hệ thống tồn tại bền bỉ ngoài thực địa bằng pin mặt trời nhỏ."

### [Slide 9: Lộ trình phát triển thực tế]
**Speaker:**
"Chúng tôi không vẽ lộ trình viễn vông. Kế hoạch Agile của chúng tôi rất rõ ràng:
- **Tháng thứ 1:** Hoàn thiện bản vẽ mạch PCB và in 3D vỏ hộp IP67 chống nước chịu nhiệt ngoài trời.
- **Tháng thứ 3:** Phối hợp cùng BQL Cúc Phương triển khai thí điểm 1 trạm POC thực tế để thu thập dữ liệu thật, từ đó fine-tune lại mô hình PyTorch.
- **Tháng thứ 6:** Gọi vốn Seed vòng 1 để sản xuất hàng loạt 50 trạm, hướng tới phủ sóng toàn bộ phân khu rừng đặc dụng."

### [Slide 10: Đội ngũ & Lời cảm ơn]
**Speaker:**
"BioListen VN được phát triển bởi đội ngũ NeuraX.ai với các vai trò chuyên biệt từ AI, Phần cứng cho đến UI/UX. Chúng tôi sẵn sàng mang công nghệ này bảo vệ các cánh rừng di sản của Việt Nam. 
Kính mời Ban giám khảo quét mã QR trên slide để trải nghiệm trực tiếp mã nguồn PyTorch và Dashboard online. Chúng tôi đã sẵn sàng cho phần câu hỏi Q&A. Xin cảm ơn!"
