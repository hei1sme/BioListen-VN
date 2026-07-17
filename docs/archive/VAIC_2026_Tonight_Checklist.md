# 🚀 VAIC 2026 — Checklist Chuẩn Bị Tổng Thể
**Team NeuraX.ai** | Huỳnh Quốc Việt · Lê Nguyễn Gia Hưng · Hồ Minh Hiếu | FPT University

> Thời điểm check: **16/07/2026 tối** — Ngày mai là D-Day!

---

## ✅ STATUS: Đã xong
- [x] Đăng ký & tài khoản platform
- [x] GitHub repo boilerplate (backend + frontend + PyTorch components + AI collab log)
- [x] Vật dụng cá nhân

---

## 🔑 API KEYS — Xác nhận có đủ chưa?

| Key | Lấy ở đâu | Priority | Ai giữ |
|-----|-----------|----------|--------|
| **Groq API Key** | https://console.groq.com | 🔴 BẮT BUỘC | Việt |
| **Supabase** | https://supabase.com | 🟡 Nên có | Hưng |
| Google Gemini | https://aistudio.google.com | 🟢 Optional | - |
| OpenAI | https://platform.openai.com | 🟢 Optional | - |

> ⚠️ Groq miễn phí, tốc độ cực nhanh (Llama 3.1) — **phải có trước khi đi**.  
> Copy API keys vào `.env` ngay tối nay, test chạy được không.

---

## 💻 SOFTWARE — Cài & Test ngay tối nay

### Việt (AI Lead — laptop chính chạy PyTorch)
- [ ] `conda activate vaic2026` chạy được
- [ ] `python backend/services/pytorch_components.py` → in ra "PyTorch components ready ✓"
- [ ] Test PhoBERT chạy được (sẽ download ~500MB lần đầu — tải trước!)
- [ ] Test Whisper `base` model (download ~140MB — tải trước!)
- [ ] Test EfficientNet load được
- [ ] `uvicorn main:app --reload` → vào `localhost:8000` thấy JSON

### Hưng (AI All-round — backup + frontend)
- [ ] Clone repo, `conda activate vaic2026` chạy được trên máy mình
- [ ] `cd frontend && npm install && npm run dev` → thấy Next.js page ở `localhost:3000`
- [ ] Test gọi `api.health()` từ frontend đến backend thành công

### Hiếu (SE — deploy pipeline)
- [ ] Tạo account **Railway** (https://railway.app) — chưa có thì tạo ngay
- [ ] Tạo account **Vercel** (https://vercel.com) — link GitHub org vào
- [ ] Test deploy backend FastAPI lên Railway (dùng Dockerfile đã có)
- [ ] Test deploy frontend Next.js lên Vercel
- [ ] Verify backend URL và update `vercel.json` → `NEXT_PUBLIC_API_URL`
- [ ] Cả 2 đều respond: backend `/health` = `{"status":"healthy"}`, frontend load được

> 🎯 **Mục tiêu tối nay:** `live deployed URL` hoạt động trước khi đi ngủ.  
> Ngày mai nhận đề bài chỉ cần thêm logic, không cần setup deploy từ đầu.

---

## 🧠 MENTAL PREP — Thảo luận với nhau tối nay

### Quyết định Track trong 30 phút (11:00 ngày mai)
Khi nhận đề bài, team cần quyết định theo framework này:

```
CÂU HỎI 1: Track nào dùng PyTorch tự nhiên nhất?
  → Computer Vision (ảnh) → EfficientNet/ViT sẵn
  → Audio → Whisper sẵn
  → Text tiếng Việt → PhoBERT sẵn

CÂU HỎI 2: Data có sẵn hay phải tự tạo?
  → HuggingFace có dataset không? → ưu tiên
  → Phải synthetic data → có thể làm nhanh không?

CÂU HỎI 3: Business case có rõ không?
  → Ai là customer? Ai là user?
  → "Tiết kiệm X% thời gian" nói được ngay không?

→ Track đáp ứng cả 3 = CHỌN NGAY
```

### Assign Checkpoint ngay khi chọn track (T+1h)
Không được để T+12h mới biết ai làm gì.

| Người | Làm gì trong 6h đầu |
|-------|---------------------|
| Việt | PyTorch model chạy được inference đầu tiên |
| Hưng | LLM pipeline + prompt system + data preprocessing |
| Hiếu | API endpoint `/predict` nhận request từ frontend |

### Nguyên tắc "Done > Perfect"
- T+12h: có model chạy được dù accuracy thấp > không có model
- T+24h: deploy live dù UI xấu > chạy local đẹp
- T+36h: polish UI/UX, cải thiện accuracy
- T+44h: fix bugs, chuẩn bị demo flow

---

## 📋 ACCOUNTS & TOOLS — Check list cuối

### Tài khoản cần login sẵn trên trình duyệt
- [ ] GitHub (org repo đã có quyền write)
- [ ] Railway (deploy backend)
- [ ] Vercel (deploy frontend)
- [ ] Supabase (database nếu cần)
- [ ] HuggingFace (download models/datasets)
- [ ] Groq Console (xem usage, lấy key)
- [ ] Google Colab (backup nếu cần GPU miễn phí)

### VS Code / Cursor extensions (cài sẵn)
- [ ] Python + Pylance
- [ ] ESLint + Prettier
- [ ] GitHub Copilot hoặc Claude extension
- [ ] Docker (để debug Dockerfile)
- [ ] REST Client (test API không cần Postman)

---

## 📦 DOWNLOAD TRƯỚC (tránh phụ thuộc WiFi venue)

Tải về tối nay, save vào thư mục local:

```python
# Chạy script này tối nay — download models về cache
from transformers import AutoTokenizer, AutoModel
AutoTokenizer.from_pretrained("vinai/phobert-base-v2")
AutoModel.from_pretrained("vinai/phobert-base-v2")

import whisper
whisper.load_model("base")  # 140MB
# Nếu muốn chắc hơn:
whisper.load_model("small")  # 460MB

import torchvision.models as models
models.efficientnet_v2_s(weights=models.EfficientNet_V2_S_Weights.IMAGENET1K_V1)
```

**Dataset candidates** (tải sẵn nếu biết track):
```python
from datasets import load_dataset
# Y tế
ds = load_dataset("alkzar90/NIH-Chest-X-ray-dataset", split="train[:100]")
# Giáo dục / Text tiếng Việt
ds = load_dataset("bkai-foundation-models/vi-news-summarization", split="train[:100]")
```

---

## 🎤 PITCH PREP — Chuẩn bị template tối nay

Tạo Google Slides với 10 slide blank, đặt tên sections:
1. **Hook** — vấn đề + số liệu impact
2. **Problem** — pain point cụ thể
3. **Solution** — "AI Native" architecture diagram
4. **PyTorch Core** — show model, không chỉ nói
5. **Demo** — link live URL
6. **Business Case** — user vs customer, pilot roadmap
7. **Metrics** — tiết kiệm X%, X phút → Y giây
8. **Tech Stack** — 1 slide diagram
9. **Team** — NeuraX.ai, FPT University
10. **Ask / Next Steps**

> Nội dung fill vào ngày mai sau khi biết đề, nhưng cấu trúc phải sẵn.

---

## ⏰ SCHEDULE TỐI NAY (16/07)

| Thời gian | Việc |
|---|---|
| **Ngay bây giờ** | Mỗi người tự test môi trường local (conda/npm) |
| **Trước 21:00** | Hiếu deploy backend + frontend lên Railway/Vercel, test live URL |
| **Trước 22:00** | Việt chạy script download models (PhoBERT + Whisper + EfficientNet) |
| **Trước 22:30** | Team họp nhanh 15 phút: confirm deploy ok, quy ước git workflow, ai ngủ trước |
| **22:30** | Chuẩn bị đồ, ngủ sớm — ngày mai cần tỉnh táo |

---

## 🔄 GIT WORKFLOW TRONG 48H

Simple, không over-engineer:
```
main          ← stable, chỉ merge khi chạy được
feature/ai    ← Việt làm (PyTorch model, inference)
feature/api   ← Hiếu làm (FastAPI routes, deploy)
feature/ui    ← Hưng làm (Next.js components, LLM)
```

Commit thường xuyên — mỗi 1-2h push lên.  
Commit message: `[ai] add EfficientNet inference endpoint` hoặc `[ui] add result display component`

---

## 🚨 CONTINGENCY — Nếu xảy ra vấn đề ngày mai

| Vấn đề | Backup |
|---|---|
| WiFi venue chậm | Hotspot điện thoại (3 máy share) |
| PyTorch model quá nặng | Dùng Groq API thuần (không có PyTorch local) |
| Railway/Vercel lỗi | Ngrok tunnel local ra ngoài (`ngrok http 8000`) |
| Dataset không có | Dùng synthetic data bằng LLM generate |
| Hết token Groq | Chuyển sang Gemini Flash (miễn phí, nhanh) |
| Deploy fail | Replit hoặc HuggingFace Spaces làm backend |

---

*NeuraX.ai — FPT University · VAIC 2026*
