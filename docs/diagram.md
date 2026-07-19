# BioListen VN — Sơ đồ Kiến trúc Hệ thống & Mô hình Multi-task (Model Architecture)

Tài liệu này chứa sơ đồ kiến trúc hệ thống xử lý dữ liệu và thiết kế chi tiết mạng nơ-ron của dự án **BioListen VN** từ nguồn dữ liệu đầu vào cho đến định dạng ONNX xuất ra phục vụ biên dịch chạy thực tế trên thiết bị Edge.

---

## 📐 1. Quy trình Tiền xử lý & Trích xuất Đặc trưng (Preprocessing & Feature Extraction)

Sơ đồ dưới đây mô tả chi tiết các bước biến đổi vật lý một tệp tin âm thanh thô (.wav, .flac) thành các đặc trưng spectrogram 3 kênh chuẩn hóa đầu vào mô hình:

```mermaid
flowchart TD
    %% Inputs
    Audio["Tệp tin Âm thanh Đầu vào <br> (.wav hoặc .flac)"]
    
    %% Preprocessing Steps
    Mono["Mono Standardize <br> (Tính trung bình cộng các kênh)"]
    Resample["Resampling <br> (Đưa về tần số lấy mẫu 32,000 Hz)"]
    Align["Temporal Alignment <br> (Định vị 5.0 giây / 160,000 samples)"]
    Mel["Log-Mel Spectrogram <br> (n_fft=2048, hop_length=512, n_mels=128)"]
    dB["Amplitude to DB Scale <br> (Nén dải động về dB)"]
    MinMax["Min-Max Normalization <br> (Chuẩn hóa pixel về [0.0, 1.0])"]
    Resize["Bilinear Resize <br> (Nội suy ảnh về 224 x 224)"]
    
    %% Channel Expansion Decision
    Expand{"Kênh màu đầu vào <br> (Channel Expansion)"}
    RGB["Kênh RGB giống nhau <br> (Sao chép 3 kênh màu giống nhau)"]
    Delta["Kênh RGB nâng cao <br> (R = Mel, G = Delta, B = Delta-Delta)"]
    
    %% Output Tensor
    Output["PyTorch Feature Tensor <br> Shape: (3, 224, 224)"]
    
    %% Connections
    Audio --> Mono
    Mono --> Resample
    Resample --> Align
    Align --> Mel
    Mel --> dB
    dB --> MinMax
    MinMax --> Resize
    Resize --> Expand
    Expand -->|Nhánh Loài - RFCx| RGB
    Expand -->|Nhánh Đe dọa - FSC22 / ESC-50| Delta
    RGB & Delta --> Output
```

---

## 🧠 2. Kiến trúc Mạng Nơ-ron Multi-task (`BioListenModel`)

Sơ đồ dưới đây mô tả cách mô hình Multi-task dùng chung Backbone trích xuất đặc trưng và phân nhánh ra hai tác vụ song song, bao gồm cả bước xuất sang định dạng ONNX có nhúng hàm kích hoạt:

```mermaid
flowchart TD
    %% Input Tensor
    InputTensor["Đặc trưng Spectrogram Đầu vào <br> Shape: (B, 3, 224, 224)"]
    
    %% Backbone
    subgraph Backbone["Shared Feature Extractor (EfficientNet)"]
        B0["EfficientNet-B0 (Baseline) <br> hoặc <br> EfficientNet-V2-S (Advanced)"]
        GAP["Global Average Pooling (GAP) <br> Shape: (B, 1280, 1, 1) -> (B, 1280)"]
        B0 --> GAP
    end
    InputTensor --> Backbone
    
    %% Heads Branching
    subgraph SpecBranch["Nhánh phân loại Loài (species_head)"]
        FC1_Spec["Linear Layer (1280 -> 256)"]
        ReLU_Spec["ReLU Activation"]
        Drop_Spec["Dropout (p=0.3) <br> (MC-Dropout Active during Inference)"]
        FC2_Spec["Linear Layer (256 -> 3)"]
        
        FC1_Spec --> ReLU_Spec --> Drop_Spec --> FC2_Spec
    end
    
    subgraph ThreatBranch["Nhánh phân loại Đe dọa (human_head)"]
        FC1_Threat["Linear Layer (1280 -> 128)"]
        ReLU_Threat["ReLU Activation"]
        Drop_Threat["Dropout (p=0.3)"]
        FC2_Threat["Linear Layer (128 -> 9)"]
        
        FC1_Threat --> ReLU_Threat --> Drop_Threat --> FC2_Threat
    end
    
    GAP --> FC1_Spec
    GAP --> FC1_Threat
    
    %% Training Phase
    subgraph TrainingPhase["Huấn luyện (Adaptive Loss)"]
        LossCalc["Tính Multi-task Loss thích ứng"]
        BCELoss["BCEWithLogitsLoss <br> (Chỉ tính cho tập grouping loài)"]
        CELoss["CrossEntropyLoss <br> (Chỉ tính cho tập FSC22/ESC-50 đe dọa)"]
        
        LossCalc --> BCELoss & CELoss
    end
    FC2_Spec --> LossCalc
    FC2_Threat --> LossCalc
    
    %% ONNX Export Output
    subgraph ONNXWrapper["ONNX Export Wrapper (Model Deployment)"]
        Sigmoid["Sigmoid Function <br> (Nhúng vào đồ thị ONNX)"]
        Softmax["Softmax Function (dim=1) <br> (Nhúng vào đồ thị ONNX)"]
        
        ONNXOutput1["Species Probabilities <br> Shape: (B, 3) <br> Giá trị: [0.0, 1.0]"]
        ONNXOutput2["Threat Probabilities <br> Shape: (B, 9) <br> Giá trị: [0.0, 1.0]"]
        
        Sigmoid --> ONNXOutput1
        Softmax --> ONNXOutput2
    end
    
    FC2_Spec -->|ONNX Export| Sigmoid
    FC2_Threat -->|ONNX Export| Softmax
```

---

## 📈 3. Chi tiết các thành phần trong Graph

### 3.1. Phân phối đặc trưng qua các lớp (Tensors Flow):
1. **Spectrogram Input:** Mỗi batch gồm $B$ mẫu, kích thước hình ảnh $224 \times 224$ với 3 kênh đặc trưng.
2. **Backbone Conv Features:** Trải qua các khối Mobile Inverted Bottleneck Conv (MBConv) của EfficientNet, thu về Feature Map cuối cùng kích thước `(B, 1280, 7, 7)`.
3. **GAP Output (Embedding):** Lớp Global Average Pooling triệt tiêu chiều cao và rộng của ảnh, đưa về vector embedding biểu diễn ngữ cảnh âm thanh cô đọng kích thước `(B, 1280)`.
4. **Species Head Output:** Trải qua tầng tuyến tính thu hẹp chiều, đưa ra 3 logits đại diện cho 3 nhóm loài lớn (Chim, Ếch, Côn trùng).
5. **Human Threat Head Output:** Đưa ra 9 logits đại diện cho 8 mối đe dọa thực tế + 1 lớp nền an toàn.

### 3.2. Cấu hình triển khai ONNX Runtime:
* **Tối ưu hóa:** Bật Constant Folding để hợp nhất các toán tử tĩnh trong backbone.
* **Suy luận linh hoạt:** Kích hoạt trục động `dynamic_axes` trên chiều Batch (chiều 0) giúp mô hình tự thích ứng với các độ dài mảng đầu vào khác nhau của client.
