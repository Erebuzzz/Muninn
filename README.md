<p align="center">
  <img src="frontend/public/cover_banner.jpg" alt="Muninn AI Living Memory" width="100%" />
</p>

# Muninn

> **A living memory for your work**: captures conversations you choose, connects the decisions, problems, tasks, and people inside them, and tells you what is still unfinished and why.

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Website](https://img.shields.io/badge/Website-muninn--nmk.pages.dev-orange.svg)](https://muninn-nmk.pages.dev)
[![API Status](https://img.shields.io/badge/API-muninn--api.workers.dev-brightgreen.svg)](https://muninn-api.kshitiz23kumar.workers.dev/api/health)
[![Pitch Deck](https://img.shields.io/badge/Pitch%20Deck-Google%20Slides-4285f4.svg)](https://docs.google.com/presentation/d/1BJt_kQttHV79CScvn4gGHwbHylm2Beor8tE13aguJwA/edit)
[![Cloudflare Workers](https://img.shields.io/badge/Runtime-Cloudflare%20Workers-f38020.svg)](https://workers.cloudflare.com)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-black.svg)](https://nextjs.org)
[![Capacitor Android](https://img.shields.io/badge/Android-Mobile%20%26%20Tablet%20APK-3ddc84.svg)](https://github.com/Erebuzzz/Muninn/releases)
[![AssemblyAI](https://img.shields.io/badge/Speech-AssemblyAI%2024kHz-0052ff.svg)](https://www.assemblyai.com)

---

### About Muninn
Muninn is inspired by one of Odin's two sacred raven messengers from Norse mythology, whose name translates from Old Norse to *"memory"* or *"mind"*. It serves as an active cognitive companion that captures technical engineering discussions (via real-time 24kHz AudioWorklet stream or 1-tap quick voice memos), isolates verifiable ground-truth claims with turn-by-turn timestamps, weaves a recursive relational knowledge graph, and proactively resurfaces unfinished work, unblocked tasks, and conflicting decisions.

- **Live Production Application**: [https://muninn-nmk.pages.dev](https://muninn-nmk.pages.dev)
- **Cloudflare Global Edge API**: [https://muninn-api.kshitiz23kumar.workers.dev](https://muninn-api.kshitiz23kumar.workers.dev)
- **Interactive Documentation Codex**: [https://muninn-nmk.pages.dev/docs](https://muninn-nmk.pages.dev/docs)
- **Slide Presentation (Pitch Deck)**: [Google Slides Pitch Deck](https://docs.google.com/presentation/d/1BJt_kQttHV79CScvn4gGHwbHylm2Beor8tE13aguJwA/edit)
- **Android Mobile & Tablet APK**: [Muninn GitHub Releases](https://github.com/Erebuzzz/Muninn/releases)
- **Web Storage**: Ephemeral guest sandbox in session storage; persistent cloud retention upon optional sign-in.
- **Mobile Storage**: Local-first hardware persistence via Android SharedPreferences; zero mandatory cloud account.
- **Repository Topics**: `memory-system`, `audio-transcription`, `assemblyai`, `hono`, `nextjs15`, `cloudflare-workers`, `android`, `local-first`, `proactive-resurfacing`, `ai-companion`, `knowledge-graph`
- **Security Policy**: [SECURITY.md](SECURITY.md)
- **Privacy Policy**: [PRIVACY.md](PRIVACY.md)
- **License**: [MIT License](LICENSE)

---

## 1. System Philosophy

1. **Capture is opt-in, per session**: No ambient or always-on listening. The user initiates a Muninn session explicitly, like starting a voice memo or architecture huddle.
2. **Triage happens inside the session**: Not everything said is equally durable, and some content is sensitive. Triage is a post-hoc filter on consented data:
   > *"You decide what gets heard. We decide what is worth remembering."*
3. **Core Cognitive Loop**:
   ```
   TALK -> UNDERSTAND -> CONNECT -> REMEMBER -> NOTICE SOMETHING IMPORTANT -> TELL ME
   ```
4. **Verifiable Provenance**: Every stored claim retains its origin (source conversation, speaker, turn timestamp, and confidence status).
5. **Zero Cold-Start Edge Execution**: The primary backend runs on Cloudflare Workers with Hono and Neon Serverless PostgreSQL (`@neondatabase/serverless`), guaranteeing sub-millisecond response times without container spin-down delays.

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Capture [Voice Capture Layer]
        A[User starts capture session] --> B[Browser or Android AudioWorklet 24 kHz]
        B -->|PCM16 Stream| C[AssemblyAI Voice Agent API]
        C -->|Co-Pilot audio feedback or Scribe silent buffering| B
        C -->|Session Artifacts: Audio & Timeline| D[Cloudflare Worker / Hono API]
    end

    subgraph Extraction [Extraction & Triage Engine]
        D --> E[Extraction Agent: LLM Gateway / Workers AI]
        E --> F1[Entities: project / component / person / vendor]
        E --> F2[Claims: observation / hypothesis / decision / task / question]
        E --> F3[Relationships: blocks / depends_on / resolves]
        E --> F4[Sensitivity Flags: none / flagged]
        F4 --> G{Sensitivity Check}
        G -->|none| H[(Neon PostgreSQL + pgvector)]
        G -->|flagged| I[Consent & Sensitivity Review Gate]
        I -->|User Confirms Store| H
        I -->|User Discards or Dismisses| J[Discarded Claim Store]
    end

    subgraph MemoryEngine [Living Memory Graph]
        H --> K[Context & Resurfacing Engine]
        K --> L1[Open-Work Detector]
        K --> L2[Recursive CTE Dependency Resolver]
        K --> L3[Semantic Precedent Suggester]
    end

    subgraph UserInterface [Workspace Interface]
        L1 --> M1[Resurfacing Feed: You Left This Behind]
        L2 --> M2[Provenance & Relationship Inspector]
        L3 --> M3[Living Memory Chat with Ground-Truth Citations]
        L2 --> M4[Sovereign Deletion: Session & Node Cascades]
    end
```

---

## 3. Dual-Mode Voice Agent Architecture

Muninn offers two distinct runtime modes to fit different engineering contexts:

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> CoPilotMode: User selects Co-Pilot Mode
    Idle --> ScribeMode: User selects Scribe Mode

    state CoPilotMode {
        [*] --> BidirectionalAudio
        BidirectionalAudio --> ActiveDialogue: Engineer speaks problem or question
        ActiveDialogue --> SpokenFeedback: Voice Agent replies with direct technical clarification
        SpokenFeedback --> BidirectionalAudio
    }

    state ScribeMode {
        [*] --> SilentBuffering
        SilentBuffering --> AudioWorkletAccumulation: Captures conversation turns without interruption
        AudioWorkletAccumulation --> SilentBuffering
    }

    CoPilotMode --> ExtractionPipeline: End Session Triggered
    ScribeMode --> ExtractionPipeline: End Session Triggered

    state ExtractionPipeline {
        [*] --> DissectTurns: Speaker diarization & turn segregation
        DissectTurns --> ClassifyClaims: Categorize into 5 atomic claim types
        ClassifyClaims --> LinkEntities: Connect to people, components, and projects
        LinkEntities --> PersistGraph: Save to Neon PostgreSQL with pgvector
        PersistGraph --> CheckResurfacing: Evaluate unblocked tasks and conflicts
    }

    ExtractionPipeline --> Idle: Living Memory Updated
```

### Mode Comparison

| Feature | Co-Pilot Mode | Scribe Mode |
|---|---|---|
| **Intended Context** | Architecture whiteboarding, 1-on-1 problem solving, design reviews | Team standups, multi-speaker meetings, long discussions |
| **Agent Behavior** | Active verbal collaborator with concise spoken replies | Completely silent background listener |
| **Audio Pipeline** | Bidirectional 24kHz PCM stream via AssemblyAI WebSocket | Unidirectional 24kHz stream buffering via AudioWorklet |
| **Interruption Handling** | Native voice activity detection (VAD) | Passive buffering without interruption |
| **Memory Output** | Turn-by-turn timestamps, structured claims, graph edges | Turn-by-turn timestamps, structured claims, graph edges |

---

## 4. Data Model

The relational graph is persisted in Neon Serverless PostgreSQL with `pgvector` for semantic precedent matching and recursive common table expressions (CTEs) for multi-depth dependency chains.

```mermaid
erDiagram
    users ||--o{ conversations : owns
    users ||--o{ entities : owns
    users ||--o{ resurfacing_events : receives
    conversations ||--o{ speakers : contains
    conversations ||--o{ claims : contains
    claims ||--o{ claim_entities : references
    entities ||--o{ claim_entities : categorized_in
    claims ||--o| task_state : tracks
    claims ||--o{ relationships : from_claim
    claims ||--o{ relationships : to_claim

    conversations {
        uuid id PK
        uuid user_id FK
        text title
        timestamptz started_at
        timestamptz ended_at
        text audio_url
        jsonb raw_transcript
        text status
    }

    claims {
        uuid id PK
        uuid conversation_id FK
        uuid speaker_id FK
        text type
        text text
        text confidence
        text sensitivity
        timestamptz timestamp
        vector embedding
    }

    entities {
        uuid id PK
        uuid user_id FK
        text type
        text name
        timestamptz first_seen_at
    }

    relationships {
        uuid id PK
        uuid from_claim_id FK
        uuid to_claim_id FK
        text relation_type
    }

    task_state {
        uuid claim_id PK
        text status
        uuid blocked_by FK
        timestamptz[] resurfaced_at
    }

    resurfacing_events {
        uuid id PK
        uuid user_id FK
        uuid triggered_by_conv FK
        uuid subject_claim_id FK
        text message
        text reason
        timestamptz created_at
        boolean dismissed
    }
```

---

## 5. Sovereign Memory Deletion & Cascade Architecture

You retain complete sovereignty over your cognitive vault. Deletion operations execute transactional cascading cleanups:

```mermaid
flowchart TD
    DelTrigger[User Triggers Delete Session] --> AuthCheck{Verify Ownership}
    AuthCheck -->|Unauthorized| Denied[404 Access Denied]
    AuthCheck -->|Authorized| CascadeStep1[1. Delete resurfacing_events referencing conversation]
    
    CascadeStep1 --> CascadeStep2[2. Delete relationships involving session claims]
    CascadeStep2 --> CascadeStep3[3. Delete claim_entities joins]
    CascadeStep3 --> CascadeStep4[4. Delete task_state records]
    CascadeStep4 --> CascadeStep5[5. Delete claims records]
    CascadeStep5 --> CascadeStep6[6. Delete speaker diarization records]
    CascadeStep6 --> CascadeStep7[7. Delete conversation record]
    CascadeStep7 --> CascadeStep8[8. Clean up orphan entities not referenced by other claims]
    CascadeStep8 --> Complete[200 OK: Complete Cascade Cleanup]
```

---

## 6. The Four Agent Subsystems

1. **The Voice Agent (AssemblyAI)**:
   - Real-time 24kHz PCM16 bidirectional streaming via `wss://agents.assemblyai.com/v1/ws`.
   - Dual personality routing: active Co-Pilot vs unobtrusive Scribe.
   - Dynamic keyterm biasing loaded from the user's `entities` table to prevent specialized component jargon from mishearing.
2. **The Extraction Agent (LLM Gateway / Workers AI)**:
   - Converts timestamped, speaker-tagged transcripts into structured JSON claims.
   - Classifies claims into five atomic types (`observation`, `hypothesis`, `decision`, `task`, `question`) and maps direct non-hallucinated relationships (`blocks`, `depends_on`, `resolves`).
3. **The Resurfacing Agent ("You Left This Behind")**:
   - Compares entities in the active session against candidate open tasks and questions.
   - Fires ambient notes when a newly discussed change unblocks a stale task from weeks ago or conflicts with a prior decision.
4. **The Precedent Suggester & Living Memory Chat**:
   - Queries historical claims with verified provenance citations `[Citation: <uuid>]` that link back to the exact turn and timestamp.

---

## 7. Dual Storage Privacy Models

```mermaid
flowchart LR
    subgraph WebMode [Web Application]
        W1[Guest User] --> W2[sessionStorage and Tab Memory]
        W2 --> W3[Destroyed on Tab Close]
        W1 -.->|Optional Sign-In| W4[Cloud Retention in Neon PostgreSQL]
    end

    subgraph AndroidMode [Android Mobile and Tablet APK]
        A1[User on Device] --> A2[Android SharedPreferences Hardware Storage]
        A2 --> A3[Persisted Across Reboots and Offline States]
        A2 -.->|Optional Sign-In| A4[Cloud Vault Synchronization]
    end
```

### Web Ephemeral Sandbox (Guest Mode)
- Sign-in and sign-up are completely optional.
- Unauthenticated web sessions run as one-time sandboxes. Extracted claims and graphs exist strictly in your browser tab memory (`sessionStorage`) and are cleared when the tab closes.
- Registering or signing in is only required if you choose to permanently retain and synchronize your memory graph across devices in the cloud.

### Mobile & Tablet Android APK (Local-First Storage)
- Sign-in is 100% optional on native Android hardware.
- Captured sessions, claims, and graphs are saved directly to local flash storage on your mobile or tablet device (`@capacitor/preferences` / Android `SharedPreferences`).
- Data is retained locally across app restarts, system reboots, and offline states without requiring any cloud account.
- If you subsequently choose to sign in, your local records can synchronize back to your personal cloud vault.

### Privacy Review Gate
- Utterances marked as sensitive (financial terms, confidential personnel discussions, off-the-record comments) are sequestered in the Privacy Review Gate.
- Under the **Default-Discard** policy, flagged items are discarded unless explicitly confirmed by the user.

---

## 8. Mobile & Tablet Android APK Architecture

To eliminate the session expiration and tab-discard issues common to mobile web browsers under memory pressure, Muninn includes a dedicated Android APK build with a native Foreground Audio Service and local-first storage engine.

```mermaid
flowchart TD
    subgraph AndroidApp [Muninn Android APK: Phone and Tablet]
        A[User starts capture] --> B[Capacitor Bridge: ForegroundRecordingPlugin]
        B --> C[Android Foreground Service: RecordingForegroundService]
        C -->|startForeground + Ongoing Notification| D[Android OS Low-Memory Killer Protection]
        C -->|WakeLock: PARTIAL_WAKE_LOCK| E[CPU and Audio Keep-Alive]
        
        A --> F[Local-First Storage: LocalStorageManager]
        F -->|Draft Utterances| G[(Device Local Flash Storage)]
        G -->|Auto-recovery on reload| A
        
        A --> H[AudioWorklet 24 kHz]
        H -->|Streaming PCM16| I[AssemblyAI Gateway / Backend Sync]
        
        I -.->|Network Drop| J[Offline Sync Queue]
        J --> G
        G -.->|Network Restored| K[Background Ingestion to Neon PG]
    end
```

### Key Advantages over Mobile Web:
1. **Low-Memory Killer (LMK) Resilience**: `RecordingForegroundService` binds with `FOREGROUND_SERVICE_TYPE_MICROPHONE` and an ongoing persistent notification, preventing the Android operating system from killing the audio pipeline when RAM runs low.
2. **Local-First Draft Durability**: All turns and transcripts write to local flash storage immediately as spoken, allowing seamless instant recovery even if the app process restarts.
3. **Offline Buffering**: When internet drops or bandwidth fluctuates, completed sessions and claim drafts queue locally on the device and sync to the backend upon reconnection.

---

## 9. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- Wrangler CLI 4+ (`npm install -g wrangler` or via `npx wrangler`)
- Neon PostgreSQL connection string (configured with `pgvector`)
- AssemblyAI API Key

### Primary Backend Setup: Cloudflare Workers (TypeScript + Hono)
```bash
cd worker
npm install

# Copy example dev variables
cp .dev.vars.example .dev.vars
# Add your DATABASE_URL and ASSEMBLYAI_API_KEY in .dev.vars

# Run locally on port 8000
npm run dev

# Deploy to Cloudflare Workers global network
npm run deploy
```

### Frontend Setup (Next.js 15)
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the Muninn Studio.

### Android Build & Emulation
```bash
# Sync web export to native Android project
cd frontend
npm run build
npx cap sync

# Assemble Debug APK using Gradle
cd android
./gradlew assembleDebug

# Run on Android Emulator (e.g., MuninnTablet)
android run --device=emulator-5554
```

---

## 10. Developer Details

- **Author**: Kshitiz Kumar
- **GitHub**: [github.com/Erebuzzz](https://github.com/Erebuzzz)
- **Contact Email**: [kshitiz23kumar@gmail.com](mailto:kshitiz23kumar@gmail.com)
