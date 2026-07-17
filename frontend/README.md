# Frontend — VAIC 2026

Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript

## Dev

```bash
cp .env.example .env.local    # set NEXT_PUBLIC_API_URL
npm install
npm run dev                   # http://localhost:3000
```

## Env

| Variable | Value (local) | Value (prod) |
|----------|---------------|--------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Railway URL |

## Structure

```
src/
  app/          App Router pages
  lib/
    api.ts      API client — tất cả calls tới backend đi qua đây
```

## Deploy → Vercel

1. Import GitHub repo
2. Set **Root Directory** = `frontend`
3. Add env var `NEXT_PUBLIC_API_URL` = Railway backend URL
4. Deploy

> **Note:** Sau khi biết track, sửa `src/app/page.tsx` và thêm route/component mới.

