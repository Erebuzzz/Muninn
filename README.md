# Muninn

A living memory for your work: captures conversations you choose, connects the decisions, problems, tasks, and people inside them, and tells you what is still unfinished and why.

---

## 1. System Philosophy

1. **Capture is opt-in, per session**: No ambient or always-on listening. The user initiates a Muninn session explicitly, like starting a voice memo.
2. **Triage happens inside the session**: Not everything said is equally durable, and some content is sensitive. Triage is a post-hoc filter on consented data:
   > *"You decide what gets heard. We decide what is worth remembering."*
3. **Core Loop**:
   ```
   TALK -> UNDERSTAND -> CONNECT -> REMEMBER -> NOTICE SOMETHING IMPORTANT -> TELL ME
   ```
4. **Verifiable Provenance**: Every stored claim retains its origin (source conversation, speaker, timestamp, and confidence status).

---

## 2. System Architecture

```mermaid
flowchart TD
    subgraph Capture [Voice Capture Layer]
        A[User starts capture session] --> B[Browser AudioWorklet 24 kHz]
        B -->|PCM16 Stream| C[AssemblyAI Voice Agent API]
        C -->|Quiet companion responses| B
        C -->|Session Artifacts: Audio & Timeline| D[FastAPI Ingestion]
    end

    subgraph Extraction [Extraction & Triage Engine]
        D --> E[Extraction Agent: LLM Gateway]
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
    end
```

---

## 3. Data Model

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

## 4. The Agent Engine

Muninn divides responsibilities across four distinct agents:

1. **The Voice Agent (AssemblyAI)**:
   - Quiet listening companion with one-sentence replies.
   - Dynamic keyterm biasing loaded from the user's `entities` table to prevent specialized component jargon from mishearing.
2. **The Extraction Agent (LLM Gateway)**:
   - Converts timestamped, speaker-tagged transcripts into structured JSON claims.
   - Classifies claim types (`observation`, `hypothesis`, `decision`, `task`, `question`) and direct non-hallucinated relationships.
3. **The Resurfacing Agent ("You Left This Behind")**:
   - Compares entities in the active session against candidate open tasks and questions.
   - Fires notes when a blocked task is unblocked, a question is reopened, or decisions conflict.
4. **The Precedent Suggester & Memory Chat**:
   - Queries historical claims with verified provenance citations `[Citation: <uuid>]`.

---

## 5. Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Neon PostgreSQL connection string (configured with `pgvector`)
- AssemblyAI API Key

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in your ASSEMBLYAI_API_KEY and DATABASE_URL in .env

# Run FastAPI backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the Muninn Studio.

---

## 6. Privacy & Consent Architecture

- Every captured session requires explicit user initiation.
- Statements that reference financial data, third parties, or off-the-record discussions receive a `sensitivity: flagged` tag.
- Flagged claims enter the **Sensitivity Review Gate**. The default on dismissal is **discard**, ensuring no sensitive data is indexed without informed consent.

---

## 7. Mobile & Tablet Android APK Architecture

To eliminate the session expiration and tab-discard issues common to mobile web browsers under memory pressure, Muninn includes a dedicated Android APK build with a native Foreground Audio Service and local-first storage engine.

```mermaid
flowchart TD
    subgraph AndroidApp [Muninn Android APK: Phone and Tablet]
        A[User starts capture] --> B[Capacitor Bridge: ForegroundRecordingPlugin]
        B --> C[Android Foreground Service: RecordingForegroundService]
        C -->|startForeground + Ongoing Notification| D[Android OS Low-Memory Killer Protection]
        C -->|WakeLock: PARTIAL_WAKE_LOCK| E[CPU & Audio Keep-Alive]
        
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
3. **Offline Buffering**: When internet drops or bandwidth fluctuates, completed sessions and claim drafts queue locally on the device and sync to FastAPI and Neon PostgreSQL upon reconnection.

### Android Build & Emulation:
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

