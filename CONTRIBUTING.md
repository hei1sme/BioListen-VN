# Contributing — NeuraX.ai VAIC 2026

> Hackathon context: ưu tiên speed & working product. Keep it simple.

---

## Git Workflow

```
main              ← stable branch, chỉ merge khi code chạy được
feature/ai        ← Việt (PyTorch models, inference)
feature/api       ← Hiếu (FastAPI routes, deploy pipeline)
feature/ui        ← Hưng (Next.js UI, LLM integration)
```

### Làm việc hàng ngày

```bash
git checkout feature/ai         # switch sang branch của mình
git pull origin main            # sync latest trước khi làm

# ... làm xong ...

git add .
git commit -m "[ai] add EfficientNet predict endpoint"
git push origin feature/ai

# Khi ready merge → tạo PR hoặc merge thẳng nếu cả team OK
git checkout main
git merge feature/ai
git push origin main
```

### Commit Convention

```
[ai]  — PyTorch models, inference, AI pipeline
[api] — FastAPI routes, backend logic, deploy
[ui]  — Frontend components, pages, styling
[fix] — Bug fixes
[doc] — Documentation, AI collab log
```

---

## Checkpoint Deadlines

| Deadline | Nộp gì | Ai chịu trách nhiệm |
|----------|--------|---------------------|
| **11:00 18/07** (Checkpoint 1) | Project name + description | Việt (Team Lead) |
| **23:00 18/07** (Checkpoint 2) | Live URL + GitHub link | Hiếu (Deploy) |
| **11:00 19/07** (Final) | 5 deliverables đầy đủ | Cả team |

---

## 5 Deliverables — Ai Làm Gì

| Deliverable | Người chịu trách nhiệm |
|-------------|----------------------|
| Presentation slides | Hưng (AI collab) |
| Demo video (≤ 5 min) | Hưng record, Việt review |
| GitHub repo (public) | Hiếu verify repo public |
| Live deployed URL | Hiếu |
| AI Collaboration Log | **Cả team** update realtime |

---

## AI Collaboration Log

**BẮT BUỘC** — mỗi người tự update sau mỗi lần dùng AI tool:

```markdown
| [HH:MM DD/07] | Claude Code | Viết PyTorch model cho track Y tế | ✅ | Chọn EfficientNet |
```

→ File: [`docs/ai_collab_log.md`](./docs/ai_collab_log.md)

---

## Liên Lạc Emergency

| Tình huống | Action |
|------------|--------|
| Deploy lỗi | Hiếu fix, backup: ngrok tunnel |
| Model quá chậm | Dùng Groq API thuần |
| WiFi chậm | Mobile hotspot |
| Cần GPU | Google Colab free tier |
