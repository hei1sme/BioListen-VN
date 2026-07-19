# 2. Live Pitch Script (Kịch bản thuyết trình Top 10)

Kịch bản thuyết trình trực tiếp trước Hội đồng Ban Giám khảo VAIC 2026.
*Quy tắc trình bày:* Giọng tự tin, dứt khoát. Nhấn mạnh từ khóa viết hoa hoặc **bôi đậm**. `[Pause]` thể hiện dừng nghỉ 1 giây để thu hút sự chú ý.

---

### [Slide 1: Bìa dự án]
**Speaker:**
"Kính chào Hội đồng Ban Giám khảo VAIC 2026. Chúng tôi là đội ngũ NeuraX.ai. Hôm nay, chúng tôi xin trình bày giải pháp **BioListen VN** — Hệ thống giám sát sinh thái & cảnh báo an ninh rừng thời gian thực. Dự án này được thiết kế nhằm giải quyết đề tài **Giám sát sinh thái** thuộc **Track Nông Nghiệp** do **Đại học Duy Tân** đặt ra, lấy bối cảnh áp dụng thực tế tại Vườn Quốc Gia Cúc Phương."

### [Slide 2: Đặt vấn đề]
**Speaker:**
"Thưa quý vị, tại sao một đề tài bảo vệ rừng lại nằm trong Track Nông Nghiệp? `[Pause]`
Bởi vì rừng đầu nguồn là lá phổi xanh bảo vệ, giữ nước và ngăn xói mòn đất cho toàn bộ vùng nông canh hạ lưu sông Hồng. Mất rừng đầu nguồn đồng nghĩa với việc nông nghiệp hạ lưu sẽ sụp đổ trước lũ lụt và hạn hán. 
Để chứng minh tính thực tiễn của giải pháp, chúng tôi lựa chọn bối cảnh thực địa tại VQG Cúc Phương — nơi có 22.000 ha rừng nguyên sinh mà việc tuần tra thủ công hiện tại hoàn toàn bất khả thi. Kiểm lâm đang bị **'mù dữ liệu sinh thái'** — chúng ta không có cách nào số hóa được biến động mật độ sinh vật và phát hiện tiếng súng, tiếng cưa xích kịp thời."

### [Slide 3: Giải pháp BioListen VN]
**Speaker:**
"Để giải quyết triệt để, BioListen VN xây dựng kiến trúc **Simulated Edge-to-Cloud**. Các trạm cảm biến tự cấp nguồn bằng năng lượng mặt trời sẽ không thu âm liên tục để tiết kiệm năng lượng, mà hoạt động theo chu kỳ (duty-cycling) ghi âm từng phân đoạn ngắn 10 giây. AI tại trạm lọc nhiễu, phân tích và chỉ truyền tải gói tin JSON cảnh báo siêu nhẹ (**dưới 20 Bytes**) qua sóng LoRaWAN về trung tâm. Giao diện HUD Dashboard trên Cloud sẽ hiển thị trực quan thông tin này."

### [Slide 4: Kiến trúc mô hình AI]
**Speaker:**
"Để cạnh tranh giải thưởng **PyTorch Award**, chúng tôi tuyên bố **KHÔNG sử dụng các API đóng hay wrapper**. Chúng tôi tự thiết kế mô hình **Multi-Task CNN** sử dụng thư viện **PyTorch `nn.Module`** nguyên bản.
Chúng tôi huấn luyện mô hình dựa trên tập dữ liệu kết hợp **ESC-50 & UrbanSound8K** cho các âm thanh đe dọa và tiếng ồn môi trường, cùng **Xeno-Canto** cho **3 nhóm sinh vật chỉ thị** đặc trưng (Chim, Ếch nhái, Côn trùng).
Toàn bộ dữ liệu âm thanh thô được chuẩn hóa về tần số **22.050 Hz**, trích xuất qua các phân đoạn **5.0 giây** thành phổ tần **Mel-spectrogram (3, 224, 224)**. Mô hình sau đó đóng băng các layer đầu của mạng backbone **EfficientNet-V2-S** để trích xuất đặc trưng và tách thành hai nhánh phân loại song song: Nhánh 1 nhận diện nhóm sinh vật chỉ thị, Nhánh 2 phát hiện tiếng cưa xích và súng săn sử dụng hàm **Weighted Cross-Entropy Loss** giúp giải quyết triệt để bài toán mất cân bằng dữ liệu."

### [Slide 5: Explainable AI & Lọc nhiễu tự nhiên]
**Speaker:**
"Hai thách thức lớn nhất của AI âm thanh trong rừng thực tế là: tiếng ồn tự nhiên (mưa lớn, sấm sét) và sự nghi ngờ từ kiểm lâm đối với AI.
Chúng tôi giải quyết bằng hai công nghệ PyTorch nâng cao:
Thứ nhất, chúng tôi áp dụng **MC-Dropout (Monte Carlo Dropout)** ở thời điểm chạy thực tế. Khi gặp tiếng mưa hay gió bão lớn tạo ra độ bất định cao vượt ngưỡng **15%**, mô hình sẽ tính toán khoảng tin cậy và báo cáo 'Không chắc chắn' thay vì báo động giả, giúp kiểm lâm không phải chạy bộ 5 cây số vô ích.
Thứ hai, chúng tôi tích hợp **Grad-CAM**. Khi có cảnh báo cưa xích, hệ thống sẽ chiếu bản đồ nhiệt đè lên phổ tần số để kiểm lâm biết chính xác AI đang 'nghe' dải tần số nào. Đây là cách chúng tôi đập tan hộp đen AI, tạo dựng lòng tin tuyệt đối cho lực lượng thực địa. Lưu ý: Grad-CAM chỉ chạy on-demand trên Cloud khi cần kiểm chứng lại file âm thanh truyền về sau để bảo toàn pin cho Edge node."

### [Slide 6: Số hóa sức khỏe hệ sinh thái]
**Speaker:**
"Đối với các Giáo sư và Chuyên gia đến từ Đại học Duy Tân, chúng tôi mang tới một bước đột phá trong phương pháp luận sinh thái: Tự động hóa tính toán chỉ số đa dạng sinh học **Shannon-Wiener (H')** theo thời gian thực.
Hệ thống đếm tần suất xuất hiện của các loài chim, ếch, khỉ trong từng giờ và tự động vẽ đường xu hướng sức khỏe sinh thái lên biểu đồ. Khi chỉ số này tụt dốc, đó là cảnh báo sớm cho thấy sinh cảnh đang bị tàn phá nặng nề."

### [Slide 7: Kết quả kiểm chứng thực nghiệm]
**Speaker:**
"Về mặt hiệu năng, giải pháp của chúng tôi đạt độ chính xác phân loại tổng thể trên **94.6%** dựa trên tập dữ liệu thử nghiệm. `[Pause]` Tốc độ chạy mô hình thực tế (Inference Latency) cực kỳ nhanh, dưới **30 ms** cho mỗi khung âm thanh 5 giây, hoàn hảo để nhúng trực tiếp vào các phần cứng Edge."

### [Slide 8: Bài toán kinh tế & simulated Edge]
**Speaker:**
"Một dự án khoa học chỉ có giá trị khi nó có khả năng thương mại hóa thực tế. Thiết bị sinh học truyền thống như AudioMoth có giá hơn 100 đô la nhưng không có Edge AI xử lý tại chỗ.
Với BioListen VN, chúng tôi tối ưu mô hình PyTorch, xuất ra chuẩn **ONNX Runtime** để chạy trực tiếp trên vi điều khiển giá rẻ ESP32-S3 với tổng chi phí linh kiện **dưới 15 USD**. Đồng thời, thay vì stream file âm thanh nặng nề làm cạn kiệt băng thông, thiết bị Edge chỉ gửi gói JSON **dưới 20 Bytes** qua sóng LoRaWAN. Đây chính là công thức giúp hệ thống tồn tại bền bỉ ngoài thực địa bằng pin mặt trời nhỏ.

*BOM (Bill of Materials) chi tiết thiết bị biên dưới 15 USD:*
- *Vi xử lý:* ESP32-S3 (Dual-core LX7, 8MB PSRAM, tích hợp tập lệnh tăng tốc AI vector)
- *Cảm biến âm thanh:* Microphone kỹ thuật số I2S MEMS (INMP441) chống ẩm
- *Truyền thông:* Module thu phát sóng vô tuyến LoRa RFM95W (915MHz)
- *Năng lượng:* Tấm pin mặt trời 5V-2W + Mạch sạc TP4056 tự động ngắt
- *Lưu trữ điện:* Pin Lithium-ion 18650 dung lượng 2600mAh hoạt động ban đêm
- *Vỏ hộp & Ăng-ten:* Vỏ in 3D chống nước IP67 + Ăng-ten LoRa"

### [Slide 9: Hướng phát triển tương lai]
**Speaker:**
"Đối với một giải pháp bảo vệ rừng đặc dụng, chúng tôi xác định các bước đi tiếp theo phải thực tế và phối hợp chặt chẽ với cơ quan chuyên trách:
- **Thứ nhất, tối ưu hóa thiết bị thực địa:** Phối hợp cùng các đối tác lâm nghiệp thử nghiệm đóng gói phần cứng trong vỏ bảo vệ kháng nước IP67 tiêu chuẩn để chống chịu tốt khí hậu ẩm ướt nhiệt đới.
- **Thứ hai, nâng cấp mô hình phân loại loài:** Thu thập thêm tiếng kêu thực địa tại Cúc Phương để nâng cấp mô hình phân loại chi tiết đến từng loài sinh học đơn lẻ (individual species detection) thay vì dừng ở cấp độ nhóm sinh vật chỉ thị như hiện tại.
- **Thứ ba, tích hợp sâu vào quy trình kiểm lâm:** Liên kết luồng dữ liệu cảnh báo từ Cloud Dashboard thẳng tới hệ thống báo động trực ca của BQL Vườn Quốc Gia để thử nghiệm phản ứng nhanh thực địa."

### [Slide 10: Đội ngũ & Lời cảm ơn]
**Speaker:**
"BioListen VN được phát triển bởi đội ngũ NeuraX.ai với các vai trò chuyên biệt từ AI, Phần cứng cho đến UI/UX. Chúng tôi sẵn sàng mang công nghệ này bảo vệ các cánh rừng di sản của Việt Nam. 
Kính mời Ban giám khảo quét mã QR trên slide để trải nghiệm trực tiếp mã nguồn PyTorch và Dashboard online. 
 
`[Hành động Demo Live tại chỗ]`
`[Pause]`. Bây giờ, để chứng minh hệ thống đang chạy realtime hoàn chỉnh, tôi xin phép phát một tệp âm thanh tiếng cưa xích từ điện thoại của mình trước micro của máy tính đang chạy Dashboard... `[Bấm nút ghi âm Mic trên web ➔ Phát tiếng cưa xích trên đt ➔ Dừng ghi âm]`. 
Như quý vị có thể thấy, còi báo động đỏ lập tức hú vang trên màn hình và tọa độ trạm A nhấp nháy đỏ trên bản đồ! 
Chúng tôi đã sẵn sàng cho phần câu hỏi Q&A. Xin cảm ơn!"
