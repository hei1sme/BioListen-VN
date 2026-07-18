# BioListen VN — Quy trình & Thiết kế Kiến trúc Huấn luyện Mô hình Multi-task

Tài liệu này đóng vai trò báo cáo kỹ thuật và nhật ký ghi chú (take notes) toàn bộ thiết kế hệ thống huấn luyện, quy trình phối hợp dữ liệu Multi-task, cùng các phân tích ưu/nhược điểm phục vụ dự án **BioListen VN**.

---

## 🗺️ Quy trình Huấn luyện & Đánh giá (Training Workflow)

```mermaid
flowchart TD
    %% Dataset Inputs
    Sub1["Tập FSC22 Chính (Processed .pt) <br> Nhãn: 27 lớp gốc (8 lớp threat thực tế + background)"]
    Sub2["Dữ liệu gộp nhóm (grouping/ .pt) <br> Nhãn: Bird, Frog, Insect"]
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
    GAP --> Head1["species_head <br> (Phân loại 4 nhóm: <br> Chim, Ếch, Côn trùng, Dơi*)"]
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
* **Bảng Ánh xạ Nhãn Chi tiết (FSC22 & ESC-50 sang 9 lớp đầu ra):**

| Chỉ số Lớp (Class Index) | Tên Mối đe dọa | Nguồn Nhãn từ FSC22 (`Class Name`) | Nguồn Nhãn từ ESC-50 (`category`) |
|:---:|:---|:---|:---|
| **`0`** | `Fire` | `Fire` | `crackling_fire` |
| **`1`** | `Chainsaw` | `Chainsaw` | `chainsaw` |
| **`2`** | `Handsaw` | `Handsaw` | `hand_saw` |
| **`3`** | `Helicopter` | `Helicopter` | `helicopter` |
| **`4`** | `VehicleEngine` | `VehicleEngine`, `Generator` | `engine` |
| **`5`** | `Axe` | `Axe`, `WoodChop` | *Không có* |
| **`6`** | `Gunshot` | `Gunshot` | `gun_shot` |
| **`7`** | `Footsteps` | `Footsteps` | `footsteps` |
| **`8`** | `background_normal` | Toàn bộ các lớp khác (Rain, Wind, BirdChirping, Speak...) | Toàn bộ các lớp khác (dog, cat, rain, wind...) |

* **Hàm Loss:** Sử dụng **CrossEntropyLoss** trên 9 lớp này.

* **Bằng chứng Triển khai (Implementation Code Proof):**
  Dưới đây là phần code ánh xạ nhãn được lấy chính xác tại cell 2 của file **[training_model.ipynb](file:///c:/INDIVIDUALS/VAIC2026/BioListen-VN/training/training_model.ipynb)** chứng minh tính nhất quán của hệ thống:

  ```python
  # Định nghĩa 8 lớp đe dọa thực tế chính
  THREAT_CLASSES = [
      'Fire', 'Chainsaw', 'Handsaw', 'Helicopter', 'VehicleEngine', 
      'Axe', 'Gunshot', 'Footsteps'
  ]
  threat_to_idx = {name: idx for idx, name in enumerate(THREAT_CLASSES)}
  BACKGROUND_CLASS_IDX = 8

  # Ánh xạ các nhãn phụ trợ của ESC-50 sang nhãn mối đe dọa chung
  esc50_threat_map = {
      'crackling_fire': 0, # Fire
      'chainsaw': 1,       # Chainsaw
      'hand_saw': 2,       # Handsaw
      'helicopter': 3,     # Helicopter
      'engine': 4,         # VehicleEngine
      'gun_shot': 6,       # Gunshot
      'footsteps': 7       # Footsteps
  }
  ```

  Và logic trích xuất nhãn trong hàm `__getitem__` đối với tác vụ con người (`human`):
  
  ```python
  if task_type == 'human':
      # 1. Tải tensor đặc trưng
      if dataset_name == 'fsc22':
          pt_path = os.path.join(self.fsc22_dir, sample['processed_pt_filename'])
          tensor = torch.load(pt_path)
          category = sample['Class Name']
          # Ánh xạ động qua dict threat_to_idx (mặc định về lớp 8 background_normal)
          threat_label = threat_to_idx.get(category, BACKGROUND_CLASS_IDX)
      else:  # esc50
          pt_path = os.path.join(self.esc50_dir, sample['processed_pt_filename'])
          tensor = torch.load(pt_path)
          category = sample['category']
          # Ánh xạ động qua dict esc50_threat_map (mặc định về lớp 8 background_normal)
          threat_label = esc50_threat_map.get(category, BACKGROUND_CLASS_IDX)
  ```


### 4.2. Nhánh loài tự nhiên (`species_head`)
* **Tổng số nhóm đầu ra:** 4 nhóm lớn (tiết kiệm tài nguyên và tăng độ chính xác thay vì 24 loài đơn lẻ).
* **Cơ chế phân loại:** **Multi-label Classification** (Phân loại đa nhãn) hoặc **Multi-class Classification** tùy theo phân loại thực tế.
* **Hàm kích hoạt đầu ra (Activation):** **Sigmoid** hoặc **Softmax** tùy thuộc vào phương pháp kết hợp batch.
* **Hàm Loss:** Sử dụng **BCEWithLogitsLoss** hoặc **CrossEntropyLoss**.

* **Bảng Phân nhóm Dữ liệu & Ánh xạ Dashboard (4 nhóm chính):**
  Dữ liệu sau khi giải nén nhị phân in-memory trên Colab thông qua notebook `notebooks/grouping_data.ipynb` được lưu trực tiếp vào 3 thư mục chính trong `BioListenVN/grouping/` trên Google Drive:

| Chỉ số nhóm | Tên tiếng Việt | Tên tiếng Anh | Nguồn dữ liệu & Ánh xạ species_id |
|:---:|:---|:---|:---|
| **`0`** | **Chim** | Bird | Các loài chim từ RFCx TP (ngoại trừ species_id `0, 2, 4, 12, 13, 15, 18, 19, 20`) |
| **`1`** | **Ếch / Lưỡng cư** | Frog / Amphibian | Các loài ếch từ RFCx TP có species_id `[0, 2, 4, 12, 13, 15, 18, 19, 20]` |
| **`2`** | **Côn trùng** | Insect | Toàn bộ 459 loài từ tập dữ liệu Zenodo (InsectSet459) |
| **`3`** | **Dơi** (Future Work) | Bat | Nhãn chờ phục vụ nâng cấp dữ liệu sóng siêu âm dơi |

* **Python Dictionary phục vụ Backend / Dashboard API:**
  Đoạn dictionary được rút gọn từ 24 lớp xuống còn 4 nhóm lớn phục vụ API route:

  ```python
  BIOLISTEN_GROUPS_MAP = {
      0: {"id": "bird", "english": "Bird", "vietnamese": "Chim"},
      1: {"id": "frog", "english": "Frog", "vietnamese": "Ếch / Lưỡng cư"},
      2: {"id": "insect", "english": "Insect", "vietnamese": "Côn trùng"},
      3: {"id": "bat", "english": "Bat", "vietnamese": "Dơi (Phát triển sau)"}
  }
  ```


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

