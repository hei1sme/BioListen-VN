@../CLAUDE.md

<!-- Frontend-specific notes for AI agents -->
# Frontend — Next.js 16 (App Router) + Tailwind CSS v4

## ⚠️ Breaking Changes vs older Next.js
- **App Router only** — không dùng `pages/` directory
- **Tailwind v4** — config bằng CSS `@import "tailwindcss"`, không dùng `tailwind.config.js`
- **React 19** — Server Components là default, thêm `"use client"` chỉ khi cần
- **`next/font`** — import font từ `next/font/google`, không dùng `<link>` tag

## File Conventions
```
src/app/
  layout.tsx        ← Root layout (Server Component)
  page.tsx          ← Home page — viết lại sau khi biết track
  globals.css       ← @import "tailwindcss" ở đầu
  [feature]/
    page.tsx        ← Route mới
src/lib/
  api.ts            ← API client — dùng `api.methodName()`, không fetch trực tiếp
```

## Styling
- Tailwind v4 utility classes — không viết CSS tùy tiện ngoài `globals.css`
- Dark mode: `dark:` variants tự động theo system preference
- Không dùng inline styles

## API Calls
```typescript
import api from "@/lib/api";   // ← luôn import từ đây

// Client component
"use client";
const result = await api.analyzeText(userInput);

// Server component / Server Action
const result = await api.health(); // ok vì API_URL là server-side
```

