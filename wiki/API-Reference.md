# API Reference

The production API is hosted on Cloudflare Workers at `https://muninn-api.kshitiz23kumar.workers.dev`. All endpoints support JSON payloads and cross-origin resource sharing (CORS).

---

## Base URLs
- **Production Edge API**: `https://muninn-api.kshitiz23kumar.workers.dev/api`
- **Health Check**: `GET /api/health`

---

## Authentication Endpoints (`/api/auth`)

Authentication uses Web Crypto PBKDF2 (100,000 iterations with SHA-256) and returns standard JWT Bearer tokens with 30-day validity.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account with email and password | No |
| `POST` | `/api/auth/login` | Authenticate with email/password and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch profile details for authenticated token | Yes (Bearer) |
| `POST` | `/api/auth/reset-password-request` | Request password reset code via Resend email | No |
| `POST` | `/api/auth/reset-password-confirm` | Confirm password reset using code and new password | No |

---

## Conversation Sessions (`/api/sessions`)

| Method | Endpoint | Description | Rate Limit |
|---|---|---|---|
| `GET` | `/api/sessions/token` | Vend temporary AssemblyAI Voice Agent token (`mode=copilot` or `mode=scribe`) | 15 req/min |
| `GET` | `/api/sessions` | List conversations for requesting user (or default sample vault for guests) | None |
| `POST` | `/api/sessions` | Initialize a new active conversation session | 20 req/min |
| `GET` | `/api/sessions/:id` | Retrieve session detail, claims, entities, and speaker tags | None |
| `POST` | `/api/sessions/:id/complete` | Complete session and trigger claim extraction pipeline | 10 req/min |
| `POST` | `/api/sessions/quick-note` | Synchronous voice memo transcription via AssemblyAI STT + claim extraction | 6 req/min |
| `POST` | `/api/sessions/extract-raw` | Extract claims directly from raw transcript text | 10 req/min |
| `DELETE` | `/api/sessions/:id` | Permanently delete session and cascade-delete all referencing claims & events | 30 req/min |

---

## Claims & Memory Nodes (`/api/claims`)

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/claims` | `conversation_id`, `entity_name`, `claim_type`, `sensitivity`, `limit`, `offset` | Query structured claims with optional filters |
| `GET` | `/api/claims/:id` | None | Get claim detail with direct entity linkages and task status |
| `DELETE` | `/api/claims/:id` | None | Delete an individual claim node, its relationships, and prune orphan entities |

---

## Knowledge Graph (`/api/graph`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/graph` | Returns nodes (claims and entities) and edges (typed relationships) for canvas rendering |

---

## Proactive Resurfacing (`/api/resurfacing`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resurfacing` | List active "You Left This Behind" unblocking and conflict alerts |
| `POST` | `/api/resurfacing/:id/dismiss` | Dismiss an ambient resurfacing alert |

---

## Living Memory Chat (`/api/chat`)

| Method | Endpoint | Payload | Description |
|---|---|---|---|
| `POST` | `/api/chat` | `{"query": string}` | Ask natural language questions; returns answer with ground-truth claim citation IDs |
