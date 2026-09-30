# Getting Started & Deployment Guide

This guide details how to configure, develop, build, and deploy the entire Muninn ecosystem across Cloudflare Workers, Next.js Cloudflare Pages, Neon PostgreSQL, and Android mobile hardware.

---

## Architecture Topology

```mermaid
flowchart LR
    subgraph ClientLayer["Client Interfaces"]
        WebClient["Next.js Web (Cloudflare Pages)"]
        TabletClient["Android Tablet APK (Native)"]
    end

    subgraph EdgeLayer["Edge Compute Layer"]
        Worker["Cloudflare Worker (Hono REST & WS API)"]
    end

    subgraph ServiceLayer["External AI Services"]
        AAI["AssemblyAI (Realtime 24kHz & LLM)"]
    end

    subgraph DataLayer["Storage Layer"]
        Neon["Neon Serverless PostgreSQL (pgvector)"]
        LocalPrefs["Android SharedPreferences (Offline)"]
    end

    WebClient -->|HTTPS / WSS| Worker
    TabletClient -->|Local Storage| LocalPrefs
    TabletClient -.->|Optional Sync| Worker
    Worker -->|WSS Audio & Chunks| AAI
    Worker -->|SQL over HTTP / WebSocket| Neon
```

---

## 1. Prerequisites

Before setting up Muninn locally, ensure the following tooling is installed:

- **Node.js**: Version 20.x or higher
- **Package Manager**: `pnpm` (version 9+) or `npm`
- **Wrangler CLI**: Cloudflare developer tooling (`npm install -g wrangler`)
- **Neon Account**: A serverless Postgres database with the `pgvector` extension enabled
- **AssemblyAI Key**: API token from [assemblyai.com](https://www.assemblyai.com)
- **JDK & Android SDK** (Optional, for Android build): Java JDK 17 and Android Studio

---

## 2. Environment Configuration

### Backend Worker Configuration (`backend/.dev.vars`)

Create a `.dev.vars` file in the `backend/` directory for local development with Wrangler:

```bash
# Neon PostgreSQL pooled connection string
DATABASE_URL="postgres://username:password@ep-sample-project.region.neon.tech/neondb?sslmode=require"

# AssemblyAI API key for transcription and LLM inference
ASSEMBLYAI_API_KEY="your_assemblyai_api_key_here"

# Runtime Environment
NODE_ENV="development"
```

In production on Cloudflare Workers, configure secrets via Wrangler:

```bash
wrangler secret put DATABASE_URL
wrangler secret put ASSEMBLYAI_API_KEY
```

### Frontend Configuration (`frontend/.env.local`)

Create `.env.local` inside `frontend/`:

```bash
# Backend Edge API URL (local dev or production)
NEXT_PUBLIC_API_URL="http://127.0.0.1:8787"

# Production Pages configuration points to:
# NEXT_PUBLIC_API_URL="https://muninn-api.kshitiz23kumar.workers.dev"
```

---

## 3. Database Initialization

Execute the schema migrations on your Neon database:

```bash
# Using psql or Neon SQL Editor
psql "$DATABASE_URL" -f backend/src/db/schema.sql
```

The migration automatically creates:
- `vector` extension (`CREATE EXTENSION IF NOT EXISTS vector;`)
- `sessions`, `claims`, `claim_relations`, `resurfacing_alerts`, `activity_log`, and `audio_chunks` tables
- Cascade foreign keys and compound timestamp indexes

---

## 4. Local Development

### Running the Edge Backend

```bash
cd backend
pnpm install
pnpm dev
```
The Hono backend will run at `http://127.0.0.1:8787`.

### Running the Web Frontend

```bash
cd frontend
pnpm install
pnpm dev
```
The Next.js client interface will open at `http://localhost:3000`.

---

## 5. Production Deployments

### Cloudflare Workers (Backend)

```bash
cd backend
wrangler deploy
```
Outputs the global edge endpoint (e.g., `https://muninn-api.kshitiz23kumar.workers.dev`).

### Cloudflare Pages (Frontend)

```bash
cd frontend
pnpm build
npx wrangler pages deploy out --project-name muninn
```
Deploys static edge-rendered assets to Cloudflare Pages (e.g., `https://muninn-nmk.pages.dev`).

### Android APK Build

```bash
cd android
./gradlew assembleRelease
```
The signed APK will be generated at `android/app/build/outputs/apk/release/app-release.apk`.
Install onto your tablet or device via:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 6. Verification and Health Check

Verify your edge deployment status:

```bash
curl -i https://muninn-api.kshitiz23kumar.workers.dev/health
```

Expected response:
```json
{"status":"healthy","version":"1.5.0","timestamp":"2026-09-30T12:00:00.000Z"}
```
