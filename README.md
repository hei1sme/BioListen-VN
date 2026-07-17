# VAIC 2026 — NeuraX.ai

> Vietnam AI Innovation Challenge 2026 | 17–19/07/2026 | FPT Tower, Hà Nội  
> **48-hour AI-Native Hackathon** · Target: 🥇 Top 1 + 🔥 Best PyTorch Award

---

## Team

| Member | Role |
|--------|------|
| Huỳnh Quốc Việt | AI Lead / PyTorch Engineer |
| Lê Nguyễn Gia Hưng | AI Engineer / All-round |
| Hồ Minh Hiếu | Software Engineer / Backend & Deploy |

> FPT University · Team NeuraX.ai

---

## Project: BioListen VN
- **Track:** Nông nghiệp (Biodiversity monitoring through Ecological acoustics)
- **Technical Plan:** [docs/BIOLISTEN_PLAN.md](./docs/BIOLISTEN_PLAN.md)
- **Active Task Board:** [docs/tasks/TASKS.md](./docs/tasks/TASKS.md)

---

## Architecture

```
frontend/   Next.js 16 + Tailwind v4   → Deploy: Vercel
backend/    FastAPI (Python 3.11)      → Deploy: Railway
            ├── PyTorch models (core AI)
            ├── HuggingFace Transformers
            └── Groq API (LLM layer)
docs/       AI Collaboration Log (required submission)
```

---

## Quick Start

```bash
# 1. Backend
conda activate vaic2026        # hoặc: conda env create -f environment.yml
cd backend
cp .env.example .env           # điền GROQ_API_KEY
uvicorn main:app --reload      # http://localhost:8000

# 2. Frontend
cd frontend
cp .env.example .env.local     # điền NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev                    # http://localhost:3000
```

---

## Deliverables (nộp trước 11:00 ngày 19/07)

- [ ] Presentation slides
- [ ] Demo video (≤ 5 phút)
- [ ] GitHub repository (public) ← repo này
- [ ] Live deployed URL
- [ ] AI Collaboration Log → [`docs/ai_collab_log.md`](./docs/ai_collab_log.md)

---

## Links

| Resource | URL |
|----------|-----|
| 🌐 Live URL | _[update sau khi deploy]_ |
| 🎬 Demo Video | _[update sau khi record]_ |
| 📊 Pitch Deck | _[link Google Slides]_ |
| 📝 AI Collab Log | [docs/ai_collab_log.md](./docs/ai_collab_log.md) |
| 🏆 Competition | https://www.vietnamaichallenge.com |

---

## Contact

support@vietnamaichallenge.com
