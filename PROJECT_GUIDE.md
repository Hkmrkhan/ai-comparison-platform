# AI Comparison Platform - Project Guide

This guide explains how the project works today, where key logic lives, and how to safely extend it.

## 1. What This Project Does

The app lets a signed-in user:

- Select AI models during onboarding
- Store provider API keys in their own preferences
- Send one prompt to multiple models in parallel
- View responses side by side with timing + word count metadata
- Save and reload previous prompt runs from history

## 2. Tech Stack

- Next.js App Router (React 19 + TypeScript)
- Supabase Auth + Postgres
- Tailwind CSS + custom UI components
- Server routes in Next.js for provider proxy calls and history CRUD

Main package details are in `package.json`.

## 3. High-Level Architecture

There are two core backend paths:

1. Chat execution path
- Client page posts to `/api/chat`
- API route forwards request to Groq/OpenAI/Google/Anthropic based on provider
- Route normalizes provider response and returns `{ response, usage }` or `{ error }`

2. Prompt history path
- Client uses `authenticatedFetch` helper
- Requests include bearer token from Supabase session
- `/api/history` handles GET + POST
- `/api/history/[id]` handles DELETE
- API routes verify the user token and only operate on that user

## 4. Main Runtime Flow

### 4.1 Authentication and entry points

- Landing page: `src/app/page.tsx`
- Login: `src/app/auth/login/page.tsx` using `src/components/auth/login-form.tsx`
- Signup: `src/app/auth/signup/page.tsx` using `src/components/auth/signup-form.tsx`
- Password reset flow:
  - request link: `src/app/auth/reset-password/page.tsx`
  - set new password: `src/app/auth/update-password/page.tsx`

Supabase client is configured in `src/lib/supabase.ts`.

### 4.2 Onboarding

File: `src/app/onboarding/page.tsx`

- User chooses models (2-7 enforced by UI logic)
- Saves into `user_preferences.selected_models`
- Sets `onboarding_completed = true`
- Redirects to compare page

### 4.3 Compare page

File: `src/app/compare/page.tsx`

On load, it:

- verifies authenticated user
- loads `user_preferences` (selected models + API keys)
- redirects to onboarding if not completed
- loads prompt history through `/api/history`

When user clicks Compare:

- filters selected models that have a key in `api_keys[provider]`
- performs parallel requests via `Promise.allSettled`
- each request posts to `/api/chat` with:
  - `model`
  - `prompt`
  - `provider`
  - `apiKey`
- formats model responses for UI display
- saves prompt + responses into history via `/api/history`

### 4.4 API route: chat proxy

File: `src/app/api/chat/route.ts`

Responsibilities:

- validates required fields
- maps provider to endpoint + auth headers + payload shape
- supports provider-specific parsing differences (notably Google)
- returns normalized response content to frontend

Provider behavior currently implemented:

- Groq: OpenAI-compatible chat completions
- OpenAI: chat completions
- Google: `generateContent` format
- Anthropic: messages API with required headers

### 4.5 API routes: history

Files:

- `src/app/api/history/route.ts` (GET, POST)
- `src/app/api/history/[id]/route.ts` (DELETE)

Pattern used in both:

- read `Authorization` bearer token
- create Supabase client with global auth header
- call `supabase.auth.getUser()` to validate token
- enforce user isolation in query filters (`user_id = user.id`)

## 5. Data Model Expectations

The code expects at least these tables:

1. `user_preferences`
- Required by onboarding and compare page
- Expected fields:
  - `user_id` (UUID, linked to auth user)
  - `selected_models` (JSON or JSONB array)
  - `api_keys` (JSON or JSONB object, keyed by provider)
  - `onboarding_completed` (boolean)

2. `prompt_history`
- Migration file exists: `supabase-migration-prompt-history.sql`
- Expected fields from app usage:
  - `id`, `user_id`, `prompt`, `responses`, `created_at`
- RLS policies should allow only owner access

## 6. Environment Variables

The app uses these variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (used for password reset redirect)

Set them in `.env.local`.

## 7. Important Code Notes (Analysis)

These are useful observations when maintaining this codebase:

1. Active comparison logic is in page-level code
- The compare page directly calls `/api/chat`.
- `src/lib/ai-service.ts`, `src/lib/groq-service.ts`, and `src/components/model-selector.tsx` are currently not part of the main compare flow.

2. Multiple model lists exist
- Model definitions are repeated in onboarding + compare page and separately in `src/lib/ai-models.ts`.
- If adding/removing models, update all relevant places or refactor to one shared source.

3. Security model for API keys
- Keys are stored in `user_preferences.api_keys` and sent from client to `/api/chat` at request time.
- This works functionally, but you may later choose encryption-at-rest for keys in DB.

4. UX details
- Landing page links to `/login` and `/dashboard`, while auth routes are under `/auth/*` and compare route is `/compare`.
- If the landing buttons are actively used, align links with actual routes.

## 8. Common Change Recipes

### Add a new AI model

Update both:

- `src/app/onboarding/page.tsx` in `AVAILABLE_MODELS`
- `src/app/compare/page.tsx` in `AVAILABLE_MODELS`

Ensure provider value matches `/api/chat` provider handling.

### Add a new AI provider

1. Extend provider handling in `src/app/api/chat/route.ts`:
- endpoint URL
- request headers
- request body shape
- response parsing logic

2. Add models for that provider in onboarding + compare model lists.

3. Verify API key entry appears in compare page modal (`getUniqueProviders()` path).

### Change history payload shape

Update all three together:

- compare page response formatting
- `ModelResponse` interfaces in compare/history code
- DB JSON assumptions in docs/migrations

## 9. Local Development Checklist

1. Install and run
- `npm install`
- `npm run dev`

2. Configure Supabase auth + URL keys in `.env.local`

3. Run SQL for prompt history
- Execute `supabase-migration-prompt-history.sql` in Supabase SQL editor

4. Ensure `user_preferences` table exists with expected columns

5. Test full flow
- signup/login
- onboarding model selection
- save API keys
- compare prompt
- load/delete prompt history

## 10. Suggested Refactor Priorities

If you want to clean up architecture incrementally:

1. Centralize model catalog into one source file used by onboarding + compare.
2. Move compare-page API call code into a single client service module.
3. Introduce DB encryption strategy for stored provider keys.
4. Remove or integrate legacy/unused files (`ai-service.ts`, `groq-service.ts`, `model-selector.tsx`, `page1.tsx`).

---

If you are new to this codebase, start reading in this order:

1. `src/app/compare/page.tsx`
2. `src/app/api/chat/route.ts`
3. `src/app/api/history/route.ts`
4. `src/app/api/history/[id]/route.ts`
5. `src/app/onboarding/page.tsx`