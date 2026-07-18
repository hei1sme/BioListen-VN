# BioListen VN — AI Lead (Việt) Task Board & Guidelines

**Role:** Huỳnh Quốc Việt (AI Lead) | **Branch:** `feature/ai`  
**Core Stack:** PyTorch, Torchaudio, ONNX, MC-Dropout, Grad-CAM, Google Colab + Google Drive, Local Debugging, FPT AI Factory  
**Technical Plan:** [docs/BIOLISTEN_PLAN.md](../BIOLISTEN_PLAN.md)

---

## 📅 Quy trình phát triển & Workflow chung (AI & Data Pipeline)

### Phase 1: Data Collection & Storage (Google Colab & Drive)
- [ ] **1. Thiết lập môi trường lưu trữ & phát triển:**
  - Kết nối Google Colab với Google Drive (sử dụng Google Pro 5TB) để lưu trữ dữ liệu raw và lưu weights trong quá trình train.
  - Đồng bộ mã nguồn về môi trường Local để thực hiện viết code, debug và trực quan hóa dữ liệu (Visualization).
- [ ] **2. Thu thập và chuẩn bị các bộ Datasets chính:**
  - Tải tập dữ liệu **FSC22** cho nhánh `human_head` (các hoạt động của con người: súng - guns, phương tiện - vehicles, cưa xích - chainsaw,...).
  - Tải tập dữ liệu **RFCx** cho nhánh `species_head` (phân loại các loài Chim - Bird và Ếch - Frog).
- [ ] **3. Chuẩn bị các bộ Datasets phụ (Bổ sung khi imbalance):**
  - Tải tập dữ liệu **Anuraset** (bổ sung cho Frog Species).
  - Tải tập dữ liệu **Zenodo** (bổ sung cho Bird Species).

### Phase 2: EDA & Preprocessing Pipeline
- [ ] **1. Kiểm tra chất lượng và trực quan hóa dữ liệu (EDA):**
  - Phân tích phân phối lớp, độ dài file, chất lượng âm thanh của hai bộ dữ liệu chính **FSC22** và **RFCx**.
  - Trực quan hóa dữ liệu âm thanh (Waveform, Spectrogram) trước và sau khi tiền xử lý (Preprocessing) tại môi trường Local để kiểm tra trực quan.
- [ ] **2. Thiết kế Preprocessing Pipeline riêng biệt:**
  - Xây dựng 2 luồng tiền xử lý (preprocessing) riêng: một cho `human_head` (đặc trưng tiếng súng, cưa xích...) và một cho `species_head` (đặc trưng tiếng chim, tiếng ếch...) do sự khác biệt lớn về tần số và đặc tính âm học.
- [ ] **3. Xử lý mất cân bằng (Imbalance Handling) và tích hợp tập phụ:**
  - Nếu dữ liệu loài (RFCx) bị thiếu hụt hoặc mất cân bằng, tiến hành tích hợp thêm **Anuraset** (Ếch) và **Zenodo** (Chim).
  - Đảm bảo tiền xử lý (preprocessing) các bộ bổ sung này đồng bộ hoàn toàn với bộ chính RFCx.
- [ ] **4. Xây dựng PyTorch Data Pipeline:**
  - Triển khai class `AudioDataset` và `DataLoader` để tối ưu hóa việc đọc/ghi và tải dữ liệu từ Google Drive vào model PyTorch.

### Phase 3: Baseline Model Architecture
- [ ] **1. Thiết kế Mô hình Multi-Task (PyTorch):**
  - Xây dựng kiến trúc `BioListenModel` sử dụng chung một Backbone trích xuất đặc trưng (ví dụ: EfficientNet-V2-S hoặc một CNN Backbone phù hợp).
  - Thiết kế 2 heads riêng biệt:
    - `species_head`: Phát hiện và phân loại các loài (Chim & Ếch).
    - `human_head`: Phát hiện và phân loại các âm thanh đe dọa từ con người (súng, cưa, xe cộ,...).

### Phase 4: Training & Evaluation
- [ ] **1. Kiểm thử mã nguồn huấn luyện (Light Epochs):**
  - Chạy thử nghiệm các cell train model với số lượng epochs rất nhỏ (light epochs) tại Local hoặc Google Colab để kiểm tra tính đúng đắn của pipeline, đảm bảo không gặp lỗi runtime hay OOM trước khi đem đi huấn luyện lớn.
  - Đánh giá nhanh các chỉ số cơ bản (Accuracy, F1-Score).
- [ ] **2. Huấn luyện chính thức trên FPT AI Factory:**
  - Sau khi code chạy ổn định, đẩy mô hình lên hệ thống **FPT AI Factory** (sử dụng gói credit $30 được tài trợ cho đội thi VAIC2026) để huấn luyện chính thức với số epochs lớn hơn trên tài nguyên GPU hiệu năng cao.
  - Tích hợp **Early Stopping** dựa trên validation loss/accuracy để tối ưu thời gian train, tránh lãng phí credit và chống overfitting.
- [ ] **3. Giải thích mô hình (Explainable AI - XAI):**
  - Áp dụng **Grad-CAM** lên lớp convolutional cuối của backbone để xuất spectrogram heatmap, chỉ rõ khu vực thời gian-tần số nào quyết định việc AI phân loại loài hoặc mối đe dọa.

### Phase 5: Optimization & Deployment
- [ ] **1. Tối ưu hóa Model & Hyperparameters:**
  - Tìm kiếm và tinh chỉnh các hyperparameters (Learning rate, Batch size, Optimizer).
  - Thực hiện các kỹ thuật tối ưu hóa mô hình (ví dụ: Pruning hoặc Quantization).
- [ ] **2. Export ONNX và Giả lập Edge Inference:**
  - Xuất mô hình PyTorch sang định dạng `.onnx` (`models/biolisten_edge.onnx`).
  - Viết/Cập nhật class `ONNXAudioService` (`backend/services/onnx_service.py`) chạy suy luận trên CPU (giả lập Raspberry Pi).
- [ ] **3. Bayesian Uncertainty (MC-Dropout):**
  - Chạy mô hình nhiều lần với Dropout bật (`model.train()`) để đo lường độ tin cậy của dự đoán, gán nhãn "Độ tin cậy thấp" nếu độ lệch chuẩn (std) vượt quá ngưỡng cho phép.

---

## 🛠️ Cheat Sheet Kỹ thuật nhanh cho Agent của Việt

Khi Việt dùng AI Agent hỗ trợ code model, hãy bảo Agent của mình:
- **Đọc kỹ file:** `backend/services/pytorch_components.py` để sử dụng đúng cách lazy loading của repo.
- **Cấu hình Audio Mel-spectrogram:** (Cần được thảo luận và tối ưu hóa tùy thuộc vào đặc tính tần số của chim/ếch vs súng/cưa).
```python
AUDIO_CONFIG = {
    "sample_rate": 22050,
    "duration_sec": 5,
    "n_fft": 2048,
    "hop_length": 512,
    "n_mels": 128,
}
```
- **Lưu ý Fallback:** Luôn theo dõi độ hội tụ của mô hình trên tập validation. Nếu có vấn đề với các đặc trưng quá phức tạp, điều chỉnh tham số FFT và Mel bins.
