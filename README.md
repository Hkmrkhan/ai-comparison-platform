# AI Comparison Platform

A Next.js + Supabase application to compare multiple AI models side by side with a single prompt, including per-user prompt history.

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure environment variables in `.env.local`

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (recommended, used in password reset redirects)

3. Run required SQL migration in Supabase

- Execute `supabase-migration-prompt-history.sql`

4. Start dev server

```bash
npm run dev
```

5. Open app

- `http://localhost:3000`

## Core Features

- Authentication (signup/login/reset/update password)
- Onboarding to select preferred AI models
- API key management per provider
- Multi-model parallel comparison
- Prompt history save/load/delete

## Project Documentation

- Architecture + flow + maintenance guide: `PROJECT_GUIDE.md`
- API flow visual notes: `API_FLOW_DIAGRAM.md`
- History API implementation notes: `API_HISTORY_IMPLEMENTATION.md`
- History setup quick start: `QUICK_START_HISTORY.md`

## Main App Routes

- `/` landing
- `/auth/login`
- `/auth/signup`
- `/auth/reset-password`
- `/auth/update-password`
- `/onboarding`
- `/compare`

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint codebase
