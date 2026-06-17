---
name: Gemini API Setup for Larry AI
description: Which Gemini model works, why others failed, and the rate limit behavior for the GEMINI_API_KEY in this project.
---

## Working model: `gemini-2.5-flash` on `v1beta`

URL pattern:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

**Why:**
- `gemini-1.5-flash` and `gemini-1.5-flash-latest` → 404 on v1beta (not available for this account)
- `gemini-2.0-flash` and `gemini-2.0-flash-lite` → 429 with `limit: 0` (free tier quota is zero for these models on this key)
- `gemini-2.5-flash` on v1 → 400 (v1 doesn't support `system_instruction` field)
- `gemini-2.5-flash` on v1beta → **works**, free tier limit is 5 req/min

**How to apply:** Always use v1beta + gemini-2.5-flash. The `system_instruction` field is only supported on v1beta.

## Rate limit
Free tier: 5 requests/minute per model. Fallback responses kick in gracefully when exceeded — this is fine for real user conversations.

## API key
Stored as `GEMINI_API_KEY` secret. Env var read in `artifacts/api-server/src/routes/chat.ts`.
