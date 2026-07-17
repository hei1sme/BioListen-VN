# AI Collaboration Log — VAIC 2026
**Team:** NeuraX.ai  
**Track:** Nông nghiệp (Biodiversity monitoring through Ecological acoustics - BioListen VN)  
**Period:** 17–19/07/2026 (48 giờ)

---

## Nguyên Tắc Sử Dụng AI

- AI là **pair programmer & thought partner**, không phải thay thế hoàn toàn
- Mọi AI output đều được **human review** trước khi commit
- Dùng AI để **tăng tốc**, không dùng để **copy-paste** thiếu hiểu biết
- Code do AI sinh ra → team phải **hiểu và có thể giải thích** khi bị hỏi

---

## Công Cụ AI Sử Dụng

| Tool | Mục đích |
|------|----------|
| Antigravity AI (Gemini) | Code generation, UI development, architecture planning |
| Cursor / Copilot | In-editor autocomplete |
| Groq + Llama 3.1 | LLM inference trong sản phẩm (Bản tin kiểm lâm khẩn cấp) |
| PyTorch + HuggingFace | Core AI models |
| Whisper | Speech-to-text |

---

## Log Chi Tiết

| Timestamp | Tool | Prompt / Task | Used? | Human Decision |
|-----------|------|---------------|-------|----------------|
| [11:00 17/07] | - | Nhận đề bài, brainstorm | - | Chọn track: BioListen VN ( Ecological Acoustics ) |
| [14:28 17/07] | Antigravity | Triển khai Phase 1: Mở rộng ApiClient và dựng giao diện Next.js Technical HUD | ✅ | Chấp thuận kế hoạch và mã nguồn giao diện tích hợp Web Audio & Recharts. |

---

## Kiến Trúc AI Trong Sản Phẩm

**PyTorch components:**
- **BioListenModel:** Dual-head audio classifier built on top of an EfficientNet-V2-S backbone. It takes log-mel spectrogram representations of 5-second audio clips and outputs:
  1. Species identification (Species Head - 5 classes)
  2. Threat classification (Threat Head - Chainsaw, Gunshot, and Background Noise)
- **MC-Dropout Uncertainty Quantification:** Run multiple forward passes under active dropout to assess predictions variance for AI Safety assurance.
- **Grad-CAM Spectrogram Heatmap:** Computing pixel importance to visually highlight exactly where/when the model detected the acoustics trigger.

**LLM components:**
- **Groq Llama 3.1 70B Engine:** Translates raw class coordinates and confidence scores outputted by PyTorch heads into a concise, readable, and action-oriented park ranger emergency bulletin in Vietnamese.

**AI-Native justification:**
> BioListen VN relies entirely on PyTorch CNN heads to extract high-dimensional acoustic features from forest recordings that are imperceptible or exhausting for humans to listen to continuously. By processing audio triggers natively on the edge (ONNX CPU) and summarizing critical situations through the LLM layer, the system enables an automated, real-time alert loop that would be impossible without model inference.

---

## Key Decisions Log

| Time | Decision | Reason |
|------|----------|--------|
| [14:30 17/07] | Sử dụng Web Audio API để giả lập tiếng còi báo động và kịch bản | Đảm bảo tính hoạt động 100% của demo trong điều kiện mất internet/không tải được asset bên ngoài. |
| [14:32 17/07] | Dùng SVG cho Bản đồ cảm biến thay vì Leaflet | Tránh tải chậm tệp CSS lớn ngoài và loại bỏ rủi ro về CORS / API keys của bản đồ nền. |
