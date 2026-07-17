# 🎯 VAIC 2026 — Chiến Lược Cho NeuraX.ai Team

> **Team:** Việt (AI Leader) · Hưng (AI All-around) · Hiếu (SE)  
> **Target:** 🥇 Top 1 ($10K) + 🔥 Best PyTorch Award ($5K)  
> **Deadline phân tích:** Hôm nay 16/07 — quyết định trước khi đi ngủ!

---

## 🧠 PHÂN TÍCH CHỌN TRACK

### Ma trận lợi thế theo track

| Track | PyTorch use case tự nhiên | Ít đội cạnh tranh | Team strength fit | Score |
|---|---|---|---|---|
| **Ngân hàng & Tài chính** | Fraud detection, time series | ❌ Nhiều team đi | ✅ Tốt | ⭐⭐⭐ |
| **Y tế & Sức khỏe** | Medical imaging (CV), vitals TS | ✅ Ít team dám đi | ✅ CV/multimodal | ⭐⭐⭐⭐⭐ |
| **Giáo dục & Đào tạo** | Speech/pronunciation (audio) | ❌ Demo WS3 đã làm rồi | ⚠️ Cạnh tranh cao | ⭐⭐ |
| **Phòng chống Thiên tai** | Satellite image analysis (CV) | ✅ Rất ít team | ✅ Computer Vision | ⭐⭐⭐⭐ |
| **SME Năng suất** | LLM-based agents | ❌ Đông nhất | ⚠️ Khó differentiate | ⭐⭐ |
| **Nông nghiệp** | Crop disease detection (CV) | ✅ Ít team | ✅ CV rõ ràng | ⭐⭐⭐⭐ |
| **Chính phủ Thông minh** | NLP/document processing | ⚠️ Trung bình | ⚠️ ít PyTorch hook | ⭐⭐ |

### 🏆 Khuyến nghị Top 2 Track nên chọn

---

#### 🥇 Option A: Y Tế & Sức Khỏe (KHUYẾN NGHỊ NHẤT)

**Lý do chiến lược:**
- **PyTorch hook tự nhiên nhất**: Medical imaging (X-ray, skin lesion, ECG) → CNN/ViT/ResNet = PyTorch core
- **Ít team cạnh tranh**: Healthcare phức tạp → nhiều team sợ → ít đối thủ mạnh
- **WOW factor cao với giám khảo**: "AI chẩn đoán bệnh" gây ấn tượng mạnh hơn "chatbot hỗ trợ KH"
- **Business viability dễ pitch**: Bệnh viện = khách hàng rõ ràng, bác sĩ = user, admin = customer
- **Data có sẵn trên HuggingFace**: NIH Chest X-Ray, ISIC skin dataset, MIT-BIH ECG → không cần scrape

**PyTorch use case cụ thể (chuẩn bị sẵn):**
```
ResNet/EfficientNet fine-tuning → classification
ViT (Vision Transformer) → medical image analysis  
LSTM/Transformer → ECG time series anomaly detection
Custom loss functions (focal loss cho imbalanced medical data)
```

---

#### 🥈 Option B: Phòng Chống Thiên Tai

**Lý do chiến lược:**
- **PyTorch hook**: Satellite image segmentation (UNet, DeepLab) → cực kỳ technical
- **Zero competition**: Rất ít team có skill và dám đi track này
- **Tính thời sự**: Thiên tai ở VN đang hot topic
- **Data**: Sentinel-2 satellite data, OpenStreetMap

---

## 🔥 CHIẾN LƯỢC PYTORCH ĐỂ WIN AWARD

> PyTorch Award = "đội thi có **kỹ thuật công nghệ xuất sắc nhất** sử dụng PyTorch"

### Không làm (sẽ thua):
```python
# ❌ Chỉ gọi API, không thực sự dùng PyTorch
import openai
response = openai.chat(...)
```

### Phải làm (để win):
```python
# ✅ PyTorch là core của giải pháp
import torch
import torch.nn as nn
from torchvision import models, transforms

# 1. Custom model với PyTorch
class MedicalDiagnosisModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = models.efficientnet_b0(pretrained=True)
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(1000, 256),
            nn.ReLU(),
            nn.Linear(256, num_classes)
        )
    
    def forward(self, x):
        features = self.backbone(x)
        return self.classifier(features)

# 2. Custom training loop
# 3. Inference pipeline với confidence scores
# 4. Uncertainty quantification (bonus!)
```

### Điểm khác biệt để THỰC SỰ thắng PyTorch Award:
1. **Fine-tuning thực sự** (không chỉ zero-shot)
2. **Custom loss function** phù hợp với domain
3. **Uncertainty estimation** (bayesian / MC dropout)
4. **ONNX export** → deploy production-ready
5. **Gradio/Streamlit demo** với live inference từ PyTorch model

---

## 🛠️ TECH STACK CHUẨN BỊ NGAY HÔM NAY

### Core Stack (AI Layer)
```
PyTorch 2.x              → core model
torchvision / torchaudio → data transforms
HuggingFace Transformers → pretrained backbones
ONNX Runtime             → fast inference
Groq API (Llama 3.1)     → LLM layer (free, fast)
```

### Backend
```
FastAPI                  → REST API (Hiếu handle)
Docker                   → containerization
Railway / Render         → deploy (free tier, fast)
```

### Frontend
```
Next.js + Tailwind       → dashboard UI (Hưng handle UI)
Gradio hoặc Streamlit    → quick demo nếu cần
```

### AI Collaboration Log (bắt buộc nộp)
Tạo file này ngay, update liên tục trong 48h:
```markdown
# AI Collaboration Log — NeuraX.ai Team

## Session 1 — Problem Analysis
Tool: Claude 3.5 Sonnet
Prompt: [paste prompt]
Output: [summary]
Decision made: [what we decided]

## Session 2 — Architecture Design
...
```

---

## ⚡ KẾ HOẠCH 48 GIỜ CHO TEAM 3 NGƯỜI

### 11:00 17/07 — Nhận đề bài (30 phút quyết định)

**KHÔNG được lan man. Quy trình:**
1. Đọc đề bài Y tế (hoặc track đã chuẩn bị)
2. Đánh giá: Có thể apply PyTorch model không? → YES → chốt ngay
3. Assign roles ngay lập tức (xem bên dưới)

### Phân công trong 48h

| Người | Role chính | Role phụ |
|---|---|---|
| **Việt** (AI Leader) | PyTorch model (training, fine-tune, inference) | Review overall architecture |
| **Hưng** (AI All-around) | LLM layer, prompt engineering, API integration | Support Việt với data preprocessing |
| **Hiếu** (SE) | FastAPI backend + Deploy pipeline + GitHub | Frontend integration |

### Timeline execution

| Thời gian | Việt | Hưng | Hiếu |
|---|---|---|---|
| T+0 (11:00) | Research dataset, chọn model architecture | Design system prompt, LLM pipeline | Setup repo, FastAPI skeleton |
| T+3 (14:00) | First model running (even if bad accuracy) | LLM answering first query | API endpoint hoạt động |
| T+6 (17:00) | Model fine-tuned, inference API | Full LLM pipeline integrated | Deploy lên Railway/Render |
| **T+24 (11:00 18/07)** | **CHECKPOINT 1** — nộp project name + description | | |
| T+30 (17:00) | Model optimized, uncertainty scores | Polish UX, AI collab log | Frontend UI hoàn chỉnh |
| **T+36 (23:00 18/07)** | **CHECKPOINT 2** — nộp live URL + GitHub | | |
| T+40 (03:00) | Ngủ 4-5 tiếng | | |
| T+44 (07:00) | Dậy, fix bugs, polish demo | Chuẩn bị pitch deck | |
| T+48 (11:00 19/07) | Nộp bài đầy đủ 5 items | | |

---

## 📊 PITCH FRAMEWORK (PHẢI CHUẨN BỊ TRƯỚC)

Dùng framework này bất kể track nào:

```
1. HOOK (30 giây)
   "X triệu người VN đang gặp vấn đề Y. Chi phí Z tỷ/năm."

2. PROBLEM (1 phút)  
   "Quy trình hiện tại: [manual, chậm, tốn tiền]"
   "Bottleneck cụ thể tại bước: [...]"

3. SOLUTION (2 phút)
   "PyTorch model làm [điều này] → từ [A phút] xuống [B giây]"
   "Tốt hơn 10x vì: [lý do cụ thể]"

4. DEMO LIVE (1.5 phút)
   → Mở live URL
   → Demo inference realtime với sample input
   → Highlight confidence score / uncertainty

5. BUSINESS CASE (1 phút)
   "Customer: [ai trả tiền]"
   "Pilot: nội bộ → 5% → 10% → 100%"
   "Metrics: [số cụ thể]"

6. ASK (30 giây)
   "Team: AI + SE. Stack: PyTorch + FastAPI. Sẵn sàng pilot."
```

---

## ✅ CHECKLIST KỸ THUẬT CHUẨN BỊ NGAY HÔM NAY

### Setup (Việt + Hưng làm ngay tối nay)
- [ ] Tạo GitHub repo (public) — đặt tên sẵn
- [ ] Setup Python env: `pip install torch torchvision fastapi uvicorn`
- [ ] Test PyTorch GPU/CPU: `torch.cuda.is_available()`
- [ ] Lấy Groq API key: https://console.groq.com
- [ ] Tạo Railway/Render account, test deploy 1 FastAPI app nhỏ
- [ ] Download 1-2 dataset candidate từ HuggingFace (sẵn sàng fine-tune)
- [ ] Tạo AI Collaboration Log template

### Dataset candidates (download ngay để khỏi phụ thuộc internet tại venue)
```
Y tế:    NIH Chest X-Ray14 (chest xray)
         ISIC 2020 (skin lesion)  
         MIT-BIH Arrhythmia (ECG)
         
Thiên tai: UC Merced Land Use (satellite)

Tất cả available trên HuggingFace:
pip install datasets
from datasets import load_dataset
```

### Template chuẩn bị (Hiếu làm ngay tối nay)
- [ ] FastAPI template với `/predict` endpoint
- [ ] Docker Compose file
- [ ] GitHub Actions CI/CD (auto deploy khi push)
- [ ] Pitch deck template (10 slides blank, fill in ngày mai)

---

## 🚨 NHỮNG SAI LẦM THƯỜNG GẶP (PHẢI TRÁNH)

1. ❌ **Chọn track bị đông** → mất differentiation
2. ❌ **Dùng PyTorch chỉ như decoration** → thua PyTorch Award ngay
3. ❌ **Deploy bị lỗi lúc demo** → mất 20đ Presentation
4. ❌ **Pitch theo ngôn ngữ kỹ thuật** → giám khảo non-tech không hiểu
5. ❌ **Quên AI Collaboration Log** → mất điểm tư cách nộp bài
6. ❌ **Model chạy local không có live URL** → không đủ điều kiện nộp bài

---

*Cập nhật: 16/07/2026 — chiến lược cho NeuraX.ai team*
