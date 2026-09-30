# System Architecture

Muninn is engineered as a high-performance edge cognitive layer that connects real-time acoustic speech to structured relational memory.

---

## Architectural Overview

```mermaid
flowchart TD
    subgraph ClientLayer [Client Execution Layer]
        A1[Web Next.js 15 App] --> B[AudioWorklet 24kHz PCM16 Stream]
        A2[Android Native Tablet APK] --> B
        A2 --> C[Foreground Audio Service Keep-Alive]
    end

    subgraph SpeechPipeline [Speech & Transcription Pipeline]
        B -->|WebSocket wss://agents.assemblyai.com| D[AssemblyAI Voice Agent API]
        D -->|Spoken Feedback in Co-Pilot Mode| A1
        D -->|Session End Artifacts: Audio & Turn Timeline| E[Cloudflare Edge Worker]
    end

    subgraph ExtractionEngine [Extraction & Triage Engine]
        E --> F[Claude 3.5 Sonnet / Llama 70B via LLM Gateway]
        F --> G1[Claim Classification: 5 Types]
        F --> G2[Entity Extraction & Linking]
        F --> G3[Sensitivity Detection: Default Discard]
    end

    subgraph StorageLayer [Living Memory Storage]
        G1 --> H[(Neon PostgreSQL + pgvector)]
        G2 --> H
        H --> I1[Recursive CTE Dependency Resolver]
        H --> I2[Open Work & Conflict Detection]
    end

    subgraph WorkspaceDelivery [Workspace Presentation]
        I2 --> J1[Proactive Feed: You Left This Behind]
        I1 --> J2[Living Memory Chat with Provenance Citations]
        H --> J3[Interactive SVG / Canvas Constellation Graph]
    end
```

---

## The Monorepo Component Breakdown

```mermaid
flowchart LR
    Root["Muninn Monorepo"] --> FE["/frontend: Next.js 15, Tailwind, Anime.js"]
    Root --> WR["/worker: Cloudflare Workers + Hono (Production Backend)"]
    Root --> BE["/backend: FastAPI + SQLAlchemy (Alternative Reference Backend)"]
    Root --> AD["/frontend/android: Capacitor Android Shell & Foreground Service"]
```

### 1. `/worker` (Primary Production Runtime)
- **Framework**: Hono running on Cloudflare Workers edge nodes worldwide.
- **Database Driver**: `@neondatabase/serverless` using zero cold-start HTTP connection pooling.
- **Authentication**: Web Crypto PBKDF2 (100,000 iterations) with Hono JWT (HS256).
- **Latency**: Sub-15 millisecond execution time from global edge points.

### 2. `/frontend` (Mythic Interface Shell)
- **Framework**: Next.js 15 with React 19.
- **Theming**: Celestial dual-mode system (Nyx obsidian/violet vs Helios amber/gold).
- **Acoustic Worklet**: `public/pcm-processor.js` capturing 24kHz mono PCM16 audio chunks.
- **Animation**: Anime.js physics powering celestial orb transitions, runic compass rotations, and faceted svg strokes.

### 3. `/frontend/android` (Local-First Android APK)
- **Engine**: Capacitor with bespoke native plugin `ForegroundRecordingPlugin`.
- **Audio Durability**: `RecordingForegroundService` with `FOREGROUND_SERVICE_TYPE_MICROPHONE` and an ongoing persistent notification to defeat the Android Low-Memory Killer (LMK).
- **Storage**: Native `SharedPreferences` for 100% on-device offline persistence.
