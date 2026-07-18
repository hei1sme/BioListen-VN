# BioListen VN — Quy trình & Thiết kế Kiến trúc Huấn luyện Mô hình Multi-task

Tài liệu này đóng vai trò báo cáo kỹ thuật và nhật ký ghi chú (take notes) toàn bộ thiết kế hệ thống huấn luyện, quy trình phối hợp dữ liệu Multi-task, cùng các phân tích ưu/nhược điểm phục vụ dự án **BioListen VN**.

---

## 🗺️ Quy trình Huấn luyện & Đánh giá (Training Workflow)

```mermaid
flowchart TD
    %% Dataset Inputs
    Sub1["Tập FSC22 Chính (Processed .pt) <br> Nhãn: 27 lớp gốc (8 lớp threat thực tế + background)"]
    Sub2["Tập RFCx TP/FP (Processed .pt) <br> Nhãn: s0 -> s23 (Loài chim/ếch)"]
    Sub3["Tập ESC-50 Phụ Trợ (Processed .pt) <br> Nhãn: Tăng cường dữ liệu cho các lớp threat"]
    
    %% DataLoader
    DataLoader["Multi-task DataLoader <br> (Trộn & phân phối Batch cân bằng)"]
    Sub1 & Sub2 & Sub3 --> DataLoader
    
    %% Backbone
    Backbone["Shared Backbone <br> (Baseline: EfficientNet-V2-B0 <br> Advanced: EfficientNet-V2-S/M)"]
    DataLoader -->|RGB Tensors 3, 224, 224| Backbone
    
    %% GAP
    GAP["Global Average Pooling (GAP) <br> Output Vector (1280)"]
    Backbone --> GAP
    
    %% Multi-task Heads
    GAP --> Head1["species_head <br> (Phân loại 24 loài)"]
    GAP --> Head2["human_head <br> (Phát hiện 8 mối đe dọa thực tế)"]
    
    %% Loss & Updates
    LossCalc["Tính Multi-task Loss thích ứng <br> (Chỉ tính Loss cho nhánh có nhãn thực tế)"]
    Head1 & Head2 --> LossCalc
    
    %% Optimizer
    Opt["Optimizer & Scheduler <br> (Cập nhật trọng số Backbone & Heads)"]
    LossCalc --> Opt
    
    %% Output
    Opt --> BestModel["best_model.pt <br> (Early Stopping)"]
    
    %% Post-Processing
    BestModel --> MCDropout["MC-Dropout <br> (Inference: Ước lượng độ bất định STD)"]
    BestModel --> GradCAM["Grad-CAM <br> (XAI: Bản đồ nhiệt tần số-thời gian)"]
```

---

## 1. Phân tích Ưu & Nhược điểm của Mô hình Multi-task

Chúng ta sử dụng chung một Backbone **EfficientNet-V2** và chia thành hai nhánh dự đoán song song (`species_head` và `human_head`). Dưới đây là phân tích chi tiết:

### 1.1. Ưu điểm (Lợi ích chính)
* **Tối ưu hóa tài nguyên:** Giảm dung lượng mô hình lưu trữ và giảm tải bộ nhớ RAM khi chạy suy luận (chỉ nạp một Backbone thay vì hai).
* **Hỗ trợ đặc trưng (Shared Representation Learning):** Các bộ lọc tích chập ban đầu (cạnh, sọc, vân Spectrogram) được dùng chung, giúp mô hình học các cấu trúc âm học nền (tiếng mưa, gió, tiếng côn trùng hót nền) tốt hơn, tăng tính tổng quát hóa.

### 1.2. Nhược điểm (Thách thức kỹ thuật & Giải pháp)
* **Sự can thiệp chéo của tác vụ (Negative Transfer / Task Interference):** 
  * *Vấn đề:* Hai tác vụ yêu cầu các đặc trưng tần số khác nhau. Nhánh con người (`human_head`) quan tâm dải tần thấp đến trung bình ($50\text{ Hz} - 4000\text{ Hz}$) với biến thiên năng lượng xung kích lớn (tiếng súng, cưa xích). Nhánh loài vật (`species_head`) quan tâm dải tần cao đến rất cao ($3000\text{ Hz} - 13000\text{ Hz}$) dạng vân cong uốn lượn. Việc cập nhật gradient cho tác vụ này có thể làm giảm độ chính xác của tác vụ kia.
  * *Giải pháp:* Thiết lập tốc độ học (Learning Rate) nhỏ hơn cho Backbone và lớn hơn cho các Head. Sử dụng kỹ thuật đóng băng (freeze) Backbone ở các epoch đầu để giữ vững đặc trưng học chuyển vị (Transfer Learning) từ ImageNet, sau đó mới fine-tune toàn bộ đồ thị.
* **Xung đột Gradient (Gradient Conflict):**
  * *Vấn đề:* Gradient từ nhánh `species_head` và `human_head` có thể ngược chiều nhau, làm Backbone mất định hướng khi hội tụ.
  * *Giải pháp:* Áp dụng trọng số Loss thích ứng ($\alpha, \beta$) hoặc sử dụng kỹ thuật cân bằng loss đơn giản để đảm bảo không nhánh nào áp đảo nhánh còn lại.
* **Mất cân bằng dữ liệu giữa các tập (Dataset Imbalance):**
  * *Vấn đề:* Kích thước các tập dữ liệu khác nhau (RFCx TP + FP có hơn 9,000 mẫu, FSC22 có khoảng 2,025 mẫu, ESC-50 có 2,000 mẫu).
  * *Giải pháp:* Cấu hình Batch Sampler của PyTorch để trộn đều tỷ lệ mẫu từ các tập dữ liệu trong mỗi Batch huấn luyện (ví dụ: 40% từ RFCx, 40% từ FSC22 và 20% từ tập phụ trợ ESC-50).

---

## 2. Kế hoạch Phát triển & Nâng cấp Mô hình

Chúng ta sẽ tiến hành phát triển mô hình theo lộ trình từ nhỏ đến lớn để dễ dàng đánh giá:

1. **Giai đoạn Baseline (Mô hình nhỏ):**
   * **Backbone:** Sử dụng `efficientnet_v2_b0` (phiên bản nhỏ nhất, nhẹ, hội tụ nhanh).
   * **Mục tiêu:** Kiểm tra và hoàn thiện toàn bộ luồng code huấn luyện, DataLoader, cơ chế Multi-task Loss, tích hợp MC-Dropout và Grad-CAM. Chạy thử nghiệm nhẹ trên Google Colab để kiểm tra độ chính xác nền tảng (Baseline Accuracy).
2. **Giai đoạn Advanced (Mô hình lớn):**
   * **Backbone:** Nâng cấp lên `efficientnet_v2_s` (Small) hoặc `efficientnet_v2_m` (Medium).
   * **Mục tiêu:** Huấn luyện chính thức với số epochs lớn trên **FPT AI Factory**, tối ưu hóa độ chính xác mà không cần quá lo lắng về giới hạn phần cứng Edge (do hiện tại chưa triển khai thực địa).

---

## 3. Cơ chế Đánh giá và Giải thích Mô hình

### 3.1. MC-Dropout (Đo lường độ bất định)
* Kích hoạt Dropout trong suốt quá trình suy luận (Inference) bằng cách thiết lập các tầng Dropout hoạt động độc lập với chế độ `model.eval()`.
* Chạy forward pass $K = 15$ lần cho mỗi mẫu Spectrogram đầu vào.
* Tính giá trị trung bình (mean probability) để làm nhãn dự đoán và tính độ lệch chuẩn (standard deviation - STD) để biểu thị độ bất định. Nếu STD lớn hơn ngưỡng đặt trước ($\sigma > 0.15$), mô hình sẽ cảnh báo mẫu âm thanh này cần giám sát thủ công.

### 3.2. Grad-CAM (Giải thích vùng tập trung)
* Grad-CAM sẽ trích xuất activation map tại khối tích chập cuối cùng của EfficientNet-V2.
* Tạo bản đồ nhiệt 2D (heatmap) kích thước `(224, 224)`.
* Chồng heatmap này lên spectrogram đầu vào để chỉ rõ:
  * **Trục hoành (Thời gian):** Tại giây thứ mấy tiếng kêu/mối đe dọa xuất hiện khiến AI đưa ra quyết định.
  * **Trục tung (Tần số):** Dải tần số nào ($50\text{ Hz} - 15000\text{ Hz}$) đang kích hoạt mạng nơ-ron mạnh nhất.

## 4. Quyết định Thiết kế & Cấu hình Nhãn Huấn luyện (Confirmed Design Decisions)

Dựa trên sự thống nhất phương án kỹ thuật, các tham số và cấu trúc đầu ra của mô hình Multi-task được cấu hình chính thức như sau:

### 4.1. Nhánh mối đe dọa con người (`human_head`)
* **Tổng số lớp đầu ra:** 9 lớp (0 đến 8).
* **Cơ chế ánh xạ nhãn chính từ FSC22 (kèm phụ trợ ESC-50):**
  * 8 lớp mối đe dọa thực tế trọng tâm được ánh xạ thành nhãn từ `0` đến `7` theo bảng sau:
    1. Nhãn `0`: `Fire` (Tiếng cháy rừng - Ánh xạ từ FSC22 `Fire` và ESC-50 `crackling_fire`)
    2. Nhãn `1`: `Chainsaw` (Tiếng cưa xích - Ánh xạ từ FSC22 `Chainsaw` và ESC-50 `chainsaw`)
    3. Nhãn `2`: `Handsaw` (Tiếng cưa tay - Ánh xạ từ FSC22 `Handsaw` và ESC-50 `hand_saw`)
    4. Nhãn `3`: `Helicopter` (Tiếng trực thăng - Ánh xạ từ FSC22 `Helicopter` và ESC-50 `helicopter`)
    5. Nhãn `4`: `VehicleEngine` (Tiếng động cơ xe thâm nhập - Ánh xạ từ FSC22 `VehicleEngine`/`Generator` và ESC-50 `engine`)
    6. Nhãn `5`: `Axe` (Tiếng rìu chặt cây - Ánh xạ từ FSC22 `Axe` và `WoodChop`)
    7. Nhãn `6`: `Gunshot` (Tiếng súng nổ - Ánh xạ từ FSC22 `Gunshot` và các nguồn súng nổ bổ sung)
    8. Nhãn `7`: `Footsteps` (Tiếng bước chân người thâm nhập - Ánh xạ từ FSC22 `Footsteps` và ESC-50 `footsteps`)
  * **Lớp nền an toàn (Background/Safe):** Tất cả các lớp không thuộc 8 mối đe dọa trên trong FSC22 (ví dụ: Rain, Wind, BirdChirping, Insect...) và các lớp còn lại của ESC-50 được gom chung thành nhãn thứ `8` tên là **`background_normal`**.
* **Hàm Loss:** Sử dụng **CrossEntropyLoss** trên 9 lớp này.

### 4.2. Nhánh loài tự nhiên (`species_head`)
* **Tổng số loài đầu ra:** 24 loài (tương ứng từ `s0` đến `s23` trong metadata).
* **Cơ chế phân loại:** **Multi-label Classification** (Phân loại đa nhãn). Cho phép nhận diện nhiều loài chim/ếch cùng xuất hiện và kêu đồng thời trong một khung cửa sổ âm thanh 5 giây.
* **Hàm kích hoạt đầu ra (Activation):** **Sigmoid** cho từng đơn vị đầu ra.
* **Hàm Loss:** Sử dụng **BCEWithLogitsLoss** (Binary Cross Entropy).

---

## 5. Kết quả Triển khai & Tương thích Hạ tầng

### 5.1. Tương thích Đa Môi trường (Colab & FPT AI Factory)
Notebooks được tinh chỉnh tích hợp khả năng nhận diện môi trường thông minh (`google.colab` auto-detect):
* **Trên Google Colab:** Tự động mount Google Drive và sao chép metadata về máy ảo `/content`.
* **Trên FPT AI Factory (JupyterLab):** Sử dụng cấu hình đường dẫn tương đối `./data` và nạp trực tiếp từ SSD để tối ưu hóa hiệu năng I/O.
* **Đường truyền tốc độ cao (Direct Cloud-to-Cloud):** Sử dụng tiện ích `gdown` để chuyển dữ liệu processed từ Google Drive trực tiếp sang FPT AI Factory không qua trung gian ổ cứng laptop, tránh quá tải dung lượng cục bộ.

### 5.2. Theo dõi và Trực quan hóa Kết quả
* **Verbose/Progress:** Tiến trình huấn luyện được trực quan hóa thời gian thực bằng thanh tiến trình `tqdm` và in chi tiết các giá trị Loss (Total Multi-task Loss, Species Loss, Human Threat Loss) trên từng batch.
* **Lưu trữ Phase tăng dần:** Các lượt huấn luyện được lưu trữ riêng biệt tại `models/phase_XX/` (tự động phát hiện và tăng số phase) để tránh ghi đè kết quả cũ.
* **Results Visualizer:** Tích hợp cell vẽ biểu đồ Loss Curves (train/val của 3 chỉ số loss qua các epochs) bằng `matplotlib` và `seaborn` ở cuối mỗi đợt chạy để đánh giá trực quan mức độ hội tụ của mô hình.

### 5.3. Xuất mô hình ONNX hoàn chỉnh
* Hoàn thành file kịch bản **[export_onnx.py](file:///c:/INDIVIDUALS/VAIC2026/BioListen-VN/training/export_onnx.py)**.
* **Đặc tính mô hình ONNX xuất ra:**
  * **Tích hợp Activation Functions:** Nhúng trực tiếp hàm toán học `Sigmoid` (loài) và `Softmax` (đe dọa) vào đồ thị ONNX, đầu ra trả về trực tiếp xác suất `[0.0, 1.0]`.
  * **Standard Evaluation:** Dropout bị vô hiệu hóa cho kết quả suy luận ổn định và tốc độ tối đa.
  * **Dynamic Axes:** Kích hoạt dynamic batch size trên chiều `0` cho phép suy luận 1 tệp tin đơn lẻ hoặc phân tích lô tệp tin đồng thời.
  * **Độ tin cậy:** Đã được kiểm tra xác thực thông qua `onnx.checker` và cho kết quả graph hoàn toàn hợp lệ.

