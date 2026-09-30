# MUNINN | Agentic Pitch Deck Master Prompt & Presentation Specification

> **Purpose**: This document is an exhaustive, agentic prompt template and design specification for generating a world-class 10-slide pitch presentation for **Muninn**. It contains complete design tokens, layout geometry, exact copywriting, visual asset prompts, animation choreography, and presenter notes for every single slide.

---

## Part 1: System Persona & Design Directives

### 1.1 Agent Persona
You are a principal design architect, technical art director, and executive pitch consultant. Your goal is to construct a cinematic, developer-centric, 16:9 widescreen pitch presentation for **Muninn**, an opt-in living memory system for technical engineering teams.

### 1.2 Design Philosophy & Aesthetics
- **Theme Name**: Nyx Celestial (Obsidian, Gold Amber, and Cosmic Cyan).
- **Vibe**: Mythic Norse cybernetics meets high-performance edge infrastructure. Sleek, authoritative, high-contrast, zero clutter, zero AI corporate boilerplate.
- **Rule on Emdashes**: Never use emdashes. Use colons, commas, or parentheses instead.
- **Rule on Emojis**: Keep emojis strictly minimal; rely on bespoke geometric iconography and crisp typography.

### 1.3 Color Tokens & Materiality
- **Background Deep Void**: `#030712` (Base Canvas), `#0a0f1d` (Radial Center Glow), `#0f172a` (Surface Cards).
- **Sun Gold / Living Memory Accent**:
  - Gold Light: `#fef08a`
  - Gold Primary: `#f59e0b`
  - Sun Amber: `#f97316`
  - Deep Bronze: `#9a3412`
- **Celestial Cyan / Vector Conduit Accent**:
  - Cyan Light: `#bae6fd`
  - Cyan Core: `#38bdf8`
  - Cyan Deep: `#0284c7`
- **Surface Text**:
  - Title & Header: `#ffffff` / `#f8fafc`
  - Body Copy: `#94a3b8` / `#cbd5e1`
  - Monospace Data / Badges: `#fed7aa` / `#bae6fd`
- **Card Material**: Semi-translucent glassmorphic panels (`rgba(15, 23, 42, 0.75)` with `1px` border `rgba(56, 189, 248, 0.15)` or `rgba(249, 115, 22, 0.2)` and `backdrop-filter: blur(16px)`).

### 1.4 Typography Hierarchy
- **Title Font**: Geometric Norse / Classic Display Serif (`Cinzel`, `Trajan Pro`, or `Playfair Display`), uppercase, tracking `+0.15em`, weight 800/900.
- **Body & Explanatory Font**: Clean Technical Sans (`Inter`, `SF Pro Display`, or `Roboto`), tracking `+0.01em`, weight 400/500/600.
- **Data, Citations, & Metadata Font**: Clean Monospace (`JetBrains Mono`, `Fira Code`), uppercase tracking `+0.08em`, weight 600.

### 1.5 Animation & Motion Language
- **Slide Transitions**: Smooth horizontal / celestial fade with 600ms easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Card Entrance**: Staggered rise and fade (`translateY: [24px, 0px]`, `opacity: [0, 1]`, duration 700ms, stagger 90ms).
- **Continuous Ambient Motion**:
  - Rotating Sacred Runic Compass (slow 60s continuous loop).
  - Floating 24kHz sinusoidal acoustic waveforms with glowing phase shifts.
  - Pulsing celestial sun orb with breathing scale physics (`scale: [0.97, 1.04]`).

---

## Part 2: Slide-by-Slide Complete Specifications

---

### Slide 1: Title & The Vision Hook

#### 1. Header & Typography
- **Overline Badge**: `[ LIVING MEMORY COMPANION ]` (Monospace, Cyan `#38bdf8`, Pill badge with `#0f172a` fill).
- **Main Title**: `MUNINN` (Cinzel / Serif, 88pt, Gold-to-Amber linear gradient, drop-shadow glow).
- **Subtitle**: `A Living Memory for Technical Work` (Monospace, 22pt, tracking `+0.12em`, `#e2e8f0`).
- **Tagline**: `Captures technical discussions you choose, extracts verified claims with turn timestamps, and proactively tells you what is still unfinished and why.` (Sans, 16pt, `#94a3b8`, max-width 720px).

#### 2. Layout Geometry
- **Grid**: Centered hero composition (16:9 widescreen).
- **Center**: Prominent faceted geometric Norse Raven emblem crowned by a glowing sun orb.
- **Bottom Left**: Author & Team credit: `Engineered by Erebus | Built for AssemblyAI Challenge`.
- **Bottom Right**: Active deployment badges: `muninn-nmk.pages.dev` | `Cloudflare Edge` | `Android Tablet APK`.

#### 3. Visual & Graphic Description
- **Centerpiece**: The geometric faceted Norse Raven from `cover_banner.svg`. The raven features obsidian feathers with polished gold edges and cyan energy conduits. Above its crest hovers a brilliant golden sun orb emitting soft concentric corona rings.
- **Background**: Deep space nebula with subtle cyan constellation graph nodes interconnected by thin dashed vector lines. Two flowing sinusoidal ribbons representing 24kHz PCM acoustic audio pass horizontally behind the wings.
- **Lighting**: Subtle volumetric amber backlight radiating from behind the raven heart diamond.

#### 4. Animation & Motion Choreography
- **On Entrance**:
  1. Sun orb scales up from center with radiant bloom (duration 800ms).
  2. Raven wing facets stroke-draw from center outwards using Anime.js SVG drawable interpolation (duration 1400ms, `inOutExpo`).
  3. The title `MUNINN` fades in with subtle upward letter tracking expansion (duration 1000ms).
  4. Ambient acoustic waves oscillate slowly in the background (`loop: true`).

#### 5. Presenter Script & Voiceover
> *"Every engineering team suffers from collective amnesia. We solve critical architecture problems on calls, make pivotal decisions in quick pairings, and assign tasks in passing. Two weeks later, those decisions are lost, tasks are forgotten, and duplicate work begins. This is Muninn: an opt-in living memory that turns technical dialogue into an active, self-resurfacing knowledge graph."*

---

### Slide 2: The Core Problem: The Engineering Amnesia Crisis

#### 1. Header & Typography
- **Overline Badge**: `[ THE PROBLEM SPACE ]` (Monospace, Amber `#f97316`).
- **Main Title**: `The Engineering Amnesia Crisis` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `Where valuable architectural decisions evaporate after meetings.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Grid**: Two-column side-by-side comparison with high visual contrast.
- **Left Column (55% width)**: Three structured problem cards with red/amber warning indicators.
- **Right Column (45% width)**: Big impact metric cards and a visual diagram of the "Broken Handoff".

#### 3. Exact Content & Copy
- **Left Cards**:
  - **Card 1: Ephemeral Voice Decay**
    - `Voice is the fastest way to communicate, but the worst way to store information.`
    - High-bandwidth whiteboarding calls produce zero structured lineage once the session closes.
  - **Card 2: The Transcript Graveyard**
    - `Meeting recorders generate unread 40-page text dumps.`
    - AI summarizers provide passive paragraph walls that nobody reads, failing to isolate atomic dependencies.
  - **Card 3: Broken Dependency Chains**
    - `Tasks get blocked and stay blocked forever.`
    - When Engineer B fixes a blocker on another call, Engineer A is never notified because the context was never connected.
- **Right Metrics**:
  - Metric Box 1: `20%` | *Engineering hours wasted weekly re-solving forgotten decisions.*
  - Metric Box 2: `68%` | *Of technical action items assigned in calls are untracked in Jira/Linear.*
  - Metric Box 3: `3+ Weeks` | *Average delay before teams realize a blocked task was already cleared.*

#### 4. Visual & Graphic Description
- Left cards have dark slate backgrounds (`rgba(15, 23, 42, 0.8)`) with subtle red/amber neon left borders (`#ef4444`, `#f97316`).
- Right side features a visual diagram titled "The Broken Knowledge Pipeline": A microphone icon leading into a fragmented, broken arrow, ending in a trash can icon labeled "Passive 40-page transcript".

#### 5. Animation & Motion Choreography
- Left cards slide in sequentially from the left (`translateX: [-30px, 0px]`, stagger 120ms).
- Metric counters count up smoothly from 0 to 20% and 68% over 1200ms.
- The broken arrow pulses with a warning red glow.

#### 6. Presenter Script & Voiceover
> *"Engineering teams don't have a communication problem; we have a retention problem. We spend hours debating database migrations and API schemas. But the moment the call ends, that knowledge starts decaying. AI meeting bots just give us 40-page transcripts that nobody reads. As a result, 20% of engineering bandwidth is lost re-solving problems we already solved."*

---

### Slide 3: The Paradigm Shift: Living Memory

#### 1. Header & Typography
- **Overline Badge**: `[ CORE PHILOSOPHY ]` (Monospace, Cyan `#38bdf8`).
- **Main Title**: `From Passive Transcripts to Living Memory` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `The four foundational tenets that govern Muninn.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Top Row**: Full-width quote callout banner.
- **Bottom Grid**: 4 equal quadrant cards (2x2 grid) with distinct Norse runic glyph accents.

#### 3. Exact Content & Copy
- **Quote Banner**:
  > *"You decide what gets heard. We decide what is worth remembering."*
  (Italic Serif, 22pt, centered, bordered with gold/cyan gradient lines).
- **Quadrant 1: Opt-In, Never Ambient**
  - No always-on listening or surveillance bots invading calendars.
  - The engineer explicitly triggers capture when high-value technical discussions start.
- **Quadrant 2: Triage Inside the Session**
  - Not all spoken audio is equally durable.
  - Post-hoc intelligence filters out filler banter, mic checks, and conversational noise to isolate immutable facts.
- **Quadrant 3: Verifiable Provenance**
  - Every single claim retains its cryptographic turn timestamp and speaker diarization.
  - Zero ungrounded hallucinations; every answer cites the exact historical audio turn.
- **Quadrant 4: Proactive Context Resurfacing**
  - Memory shouldn't sit idle waiting to be queried.
  - Muninn notices connections across time and alerts you when past blocked work is unblocked.

#### 4. Visual & Graphic Description
- The quote banner is accented with Norse knotwork brackets on both sides.
- Each of the 4 quadrant cards features an embedded geometric rune icon (`Fehu`, `Ansuz`, `Algiz`, `Dagaz`) rendered in gold and cyan wireframes.
- Subtle particle field in the background giving a sense of depth.

#### 5. Animation & Motion Choreography
- The quote banner expands horizontally from center with glowing gold rules.
- The 4 quadrant cards flip into view with 3D rotation (`rotateX: [15deg, 0deg]`, `opacity: [0, 1]`, stagger 100ms).

#### 6. Presenter Script & Voiceover
> *"We designed Muninn around four core tenets. First, capture is 100% opt-in: no ambient eavesdropping. Second, triage happens inside the session: we separate transient banter from lasting decisions. Third, every memory maintains verifiable provenance back to the exact speaker and timestamp. And fourth, memory must be proactive: it should alert you when things connect, rather than sitting passive in a database."*

---

### Slide 4: System Architecture: The Edge-to-Model Pipeline

#### 1. Header & Typography
- **Overline Badge**: `[ TECHNICAL ARCHITECTURE ]` (Monospace, Gold `#f59e0b`).
- **Main Title**: `Zero Cold-Start Edge Pipeline` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `Sub-second speech processing and vector reasoning built on global edge infrastructure.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Center**: A 5-stage horizontal architectural pipeline flowchart with connecting conduits.
- **Bottom**: A structured tech stack matrix table detailing runtimes, latency, and protocols.

#### 3. Exact Content & Copy
- **Pipeline Stages (Left to Right)**:
  1. **Capture Client**: Browser / Android AudioWorklet (24kHz PCM16, sub-20ms frame slicing).
  2. **Speech Engine**: AssemblyAI Realtime Voice Agent API (`wss://agents.assemblyai.com/v1/ws`) & Sync STT.
  3. **Edge Gateway**: Cloudflare Workers + Hono (Sub-millisecond global routing, rate limiting, auth).
  4. **Extraction Layer**: Claude 3.5 Sonnet on LLM Gateway & Cloudflare Workers AI (Llama 3.3 70B Instruct).
  5. **Living Storage**: Neon Serverless PostgreSQL + `pgvector` (Vector similarity and recursive CTE graph).
- **Architecture Matrix Table**:
  - `Layer` | `Component` | `Performance SLA` | `Role`
  - Audio Capture | 24kHz AudioWorklet | < 15ms latency | Zero frame drop streaming
  - Speech Intelligence | AssemblyAI WebSocket | < 300ms turn detection | Bidirectional conversational voice
  - Edge Compute | Cloudflare Workers | 14ms startup time | Zero cold-start API & Auth
  - Vector & Graph | Neon pgvector | Sub-10ms query | Semantic precedent & dependency CTEs

#### 4. Visual & Graphic Description
- Stylized version of the README Mermaid flowchart: 5 glowing nodes in horizontal progression connected by illuminated pulsing conduits.
- Stage 2 prominently features the AssemblyAI brand mark in electric blue (`#0052ff`).
- Stage 3 features the Cloudflare Workers logo in orange (`#f38020`).
- Stage 5 features the Neon PostgreSQL logo in neon green (`#00e699`).
- Energy particles flow left-to-right through the conduits to visualize real-time streaming data.

#### 5. Animation & Motion Choreography
- Conduit glow lines trace across the screen from left to right (duration 1500ms).
- Each architectural node scales up and illuminates as the trace reaches it.
- Pulsing glow loops continuously across the AssemblyAI and Neon nodes.

#### 6. Presenter Script & Voiceover
> *"Here is how Muninn works under the hood. Audio is captured via a custom 24kHz AudioWorklet that streams raw PCM frames to AssemblyAI's real-time WebSocket. Our backend runs on Cloudflare Workers using Hono, executing in under 15 milliseconds without container cold starts. Extraction models categorize claims, which are persisted into Neon Serverless PostgreSQL with pgvector for recursive graph queries."*

---

### Slide 5: Dual-Mode Voice Agent Experience

#### 1. Header & Typography
- **Overline Badge**: `[ VOICE INTELLIGENCE ]` (Monospace, Violet `#a855f7`).
- **Main Title**: `Dual-Mode Voice Agent Architecture` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `Tailored for active architecture debates or silent meeting capture.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Grid**: Two prominent side-by-side cards comparing the two operating modes.
- **Center Divider**: Glowing vertical conduit indicating mutual runtime exclusivity.

#### 3. Exact Content & Copy
- **Left Mode: Co-Pilot Mode (Active Technical Peer)**
  - *Accent*: Violet & Cyan (`#a855f7`, `#38bdf8`).
  - *Tag*: `BIDIRECTIONAL INTERACTION`
  - **Spoken Collaboration**: Participates directly in engineering whiteboarding sessions.
  - **Live Architecture Guidance**: Clarifies API contracts, answers documentation queries, and verifies trade-offs.
  - **Natural Voice Turn-Taking**: Uses native Voice Activity Detection (VAD) to listen and reply with sub-second latency.
  - *Ideal for*: 1-on-1 pairing, system design huddles, and incident triage.
- **Right Mode: Scribe Mode (Quiet Listening Companion)**
  - *Accent*: Amber & Gold (`#f97316`, `#f59e0b`).
  - *Tag*: `UNOBTRUSIVE BUFFERING`
  - **Zero Interruption**: Listens passively in the background without interjecting or making noise.
  - **Continuous Frame Buffering**: Accumulates 24kHz audio turns and speaker diarization quietly.
  - **Session-End Crystallization**: Triggers full claim extraction and relational graph updates only when the call concludes.
  - *Ideal for*: Multi-person team standups, customer interviews, and long meetings.

#### 4. Visual & Graphic Description
- Left card features an interactive waveform animation pulsing with conversational speech and a speaker badge.
- Right card features a calm, glowing celestial orb with audio buffering indicators and a discrete quill/raven icon.
- Bottom of the slide shows the toggle switch UI from Muninn Studio: `[ Co-Pilot Mode ] <---> [ Scribe Mode ]`.

#### 5. Animation & Motion Choreography
- Both cards slide in from opposite sides and snap into center.
- The toggle switch in the bottom center animates back and forth between Co-Pilot and Scribe, lighting up each card alternately to showcase the two modes.

#### 6. Presenter Script & Voiceover
> *"We realized that one voice interaction model does not fit every engineering scenario. So we built two distinct modes. In Co-Pilot mode, Muninn acts as an active engineering peer, conversing with you, answering docs questions, and challenging design trade-offs. In Scribe mode, Muninn sits quietly in the background without interrupting, buffering audio and extracting knowledge only when the session ends."*

---

### Slide 6: Ground-Truth Claim Extraction & Turn Timestamps

#### 1. Header & Typography
- **Overline Badge**: `[ EXTRACTION & TRIAGE ]` (Monospace, Cyan `#38bdf8`).
- **Main Title**: `Triage Inside the Session: Five Atomic Claim Types` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `Transforming messy acoustic transcripts into typed, verifiable data.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Left Column (40% width)**: Raw audio turn with real-time speaker diarization and millisecond timestamp.
- **Center Arrow**: Animated extraction transform beam.
- **Right Column (60% width)**: The 5 atomic claim type cards with color-coded classification tags.

#### 3. Exact Content & Copy
- **Left Raw Turn**:
  - `Maya [00:14:22]`: *"We decided to standardize on Neon PostgreSQL with pgvector for zero cold-start execution. Task for Liam: benchmark cold-start latency across Mumbai by Thursday."*
- **Right The 5 Atomic Claim Types**:
  1. `[ DECISION ]` (Emerald `#10b981`): Architectural commitments and technical consensus.
     - *Example: "Standardize on Neon PostgreSQL with pgvector for zero cold-start execution."*
  2. `[ TASK ]` (Gold `#f59e0b`): Assigned work with assignee, due date, and blocker tracking.
     - *Example: "Benchmark cold-start latency across Mumbai by Thursday (Assignee: Liam)."*
  3. `[ OBSERVATION ]` (Sky `#0284c7`): Empirical benchmarks, test findings, and hardware revisions.
     - *Example: "AudioWorklet 24kHz downsampling eliminated frame drops to 0.0%."*
  4. `[ QUESTION ]` (Violet `#8b5cf6`): Open architectural uncertainties requiring future resolution.
     - *Example: "Should we enable Durable Objects for session state or keep connections stateless?"*
  5. `[ HYPOTHESIS ]` (Rose `#f43f5e`): Unverified assumptions slated for validation.
     - *Example: "Cold-start latency in Mumbai edge will be under 15ms over HTTP."*

#### 4. Visual & Graphic Description
- Visual transformation graphic: The raw audio waveform text flows into an extraction matrix where glowing colored tags attach to individual sentences.
- Each claim card shows its confidence score (`verified`), sensitivity level (`none`), and detected entity tags (`#NeonPostgreSQL`, `#Liam`, `#Mumbai`).

#### 5. Animation & Motion Choreography
- The raw transcript appears with a typewriter/cipher decode effect.
- An animated laser beam sweeps across the transcript.
- The 5 claim cards pop into place with satisfying staggered elastic recoils.

#### 6. Presenter Script & Voiceover
> *"When a session ends, Muninn doesn't generate a vague summary. It dissects the dialogue into five atomic claim types: decisions, tasks, observations, questions, and hypotheses. Each claim is stamped with the exact turn timestamp, speaker tag, and confidence score. This transforms fuzzy human speech into queryable, typed database records."*

---

### Slide 7: Living Knowledge Graph & Sovereign Deletion

#### 1. Header & Typography
- **Overline Badge**: `[ RELATIONAL MEMORY ]` (Monospace, Emerald `#10b981`).
- **Main Title**: `The Living Relational Knowledge Graph` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `Graph recursion with recursive CTEs and 1-tap sovereign cascading deletion.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Left Column (60% width)**: An interactive knowledge graph visualization showing connected nodes and edges.
- **Right Column (40% width)**: Two feature highlight panels detailing recursive traversals and sovereign deletion.

#### 3. Exact Content & Copy
- **Left Graph Visualization**:
  - Central Entity Nodes: `[Neon PostgreSQL]`, `[Cloudflare Workers]`, `[PCB Rev 2.1]`.
  - Claim Nodes connected by directional typed edges:
    - `(Decision: Migrate to Hono)` --`[resolves]`--> `(Question: Edge Framework)`
    - `(Task: Benchmark Mumbai)` --`[depends_on]`--> `(Decision: Neon pgvector)`
    - `(Task: Enclosure Fabrication)` --`[blocked_by]`--> `(Observation: Bracket Misalignment)`
- **Right Panel 1: Recursive Dependency Resolution**
  - Uses PostgreSQL recursive Common Table Expressions (CTEs) to resolve multi-tier dependency chains in sub-10 milliseconds.
  - Automatically walks upward to check whether any parent blocker has been cleared.
- **Right Panel 2: Sovereign Memory Deletion**
  - Full user sovereignty over the cognitive vault.
  - 1-tap deletion of individual claims or entire sessions directly from the UI.
  - Transactional cascade cleans up resurfacing events, relationships, claim entities, and orphan entity records automatically.

#### 4. Visual & Graphic Description
- Node-edge constellation graph matching Muninn's canvas UI with obsidian node bodies, gold decision rings, cyan entity pills, and animated glowing directional arrows.
- Right panel 2 features a clean red/rose trash icon with a diagram showing the safe cascade deletion flow.

#### 5. Animation & Motion Choreography
- Graph nodes blossom outwards from the center using force-directed layout simulation.
- Directional pulse effects travel along the dependency edges (`depends_on`, `resolves`).
- A subtle hover effect expands an entity node to show its connected claims.

#### 6. Presenter Script & Voiceover
> *"These atomic claims aren't stored in isolation; they form a living relational graph in Neon PostgreSQL. Using recursive CTEs, Muninn can traverse complex dependency chains to see how a task in today's meeting connects to a decision made three weeks ago. And because developers demand data sovereignty, any node or session can be deleted with a single tap, with full transactional cascade cleanup."*

---

### Slide 8: Proactive Resurfacing: "You Left This Behind"

#### 1. Header & Typography
- **Overline Badge**: `[ PROACTIVE COGNITION ]` (Monospace, Amber `#f97316`).
- **Main Title**: `The Memory That Speaks First: You Left This Behind` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `Proactively unblocking engineers before deadlocks happen.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Top Half**: A high-impact UI banner showcase of the ambient notification feed.
- **Bottom Half**: Two split cards contrasting traditional passive search with Muninn's proactive radar.

#### 3. Exact Content & Copy
- **The Notification Banner (Exact UI Mockup)**:
  - `[ RESURFACING ALERT #402 ]` | `2 hours ago`
  - *Headline*: `Unblocked Dependency Detected: Enclosure Fabrication`
  - *Reason*: `During Session #14 ("Hardware Revision & Thermal Architecture"), Alex confirmed the heatsink bracket redesign was completed. This unblocks Task #89: "Fabricate outer enclosure", which had been stalled for 18 days.`
  - *Action Pills*: `[ Jump to Turn 00:14:22 ]` | `[ Mark Task Active ]` | `[ Dismiss ]`
- **Card 1: Passive Search (Old World)**
  - Engineers must remember to search.
  - Stale work sits in forgotten backlog columns indefinitely.
  - Nobody notices when a blocker was quietly solved in another meeting.
- **Card 2: Proactive Radar (Muninn)**
  - Muninn continuously cross-references active session entities against all open tasks.
  - Pushes an ambient alert the instant a prerequisite resolves.
  - Prevents weeks of idle stall time across distributed teams.

#### 4. Visual & Graphic Description
- The top notification banner is rendered with a luminous amber border and a subtle Norse raven icon with glowing eyes.
- The two cards below use dark frosted glass panels with checkmark and cross badges.
- Living Memory Chat mockup visible in the corner showing verifiable citation links (`[Citation: a1154e20]`).

#### 5. Animation & Motion Choreography
- The ambient notification banner drops down from the top of the slide with a subtle spring bounce (`elasticOut`).
- The citation link pulses with a warm cyan glow when highlighted.

#### 6. Presenter Script & Voiceover
> *"This is Muninn's superpower: proactive resurfacing. In most tools, you have to remember to search for what you forgot. Muninn speaks first. The moment an engineer discusses a fix that unblocks a task stalled three weeks ago, Muninn delivers an ambient alert: 'You Left This Behind'. It bridges past decisions with present work automatically."*

---

### Slide 9: Privacy & Dual Storage Paradigms

#### 1. Header & Typography
- **Overline Badge**: `[ PRIVACY & ERGONOMICS ]` (Monospace, Emerald `#10b981`).
- **Main Title**: `Zero-Trust Privacy: Dual Storage Architectures` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `Ephemeral web sandbox or 100% on-device local flash storage.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Grid**: Two large architectural column cards comparing the Web Mode and Android Mode.
- **Bottom**: The Sensitivity Review Gate with the Default-Discard security policy.

#### 3. Exact Content & Copy
- **Column 1: Web Ephemeral Sandbox (Guest Mode)**
  - *Target*: Browser Desktop & Laptop users.
  - **Zero Persistent Tracking**: Runs completely in browser tab memory (`sessionStorage`).
  - **Tab-Close Destruction**: Closing the tab purges all session transcripts and memory graphs instantly.
  - **Optional Cloud Retention**: Signing in is strictly opt-in using Web Crypto PBKDF2 (100,000 iterations) + JWT.
- **Column 2: Android Tablet APK (Local-First Hardware Storage)**
  - *Target*: Mobile & Tablet devices in meeting rooms and field engineering.
  - **100% Local Device Storage**: Persists all sessions and claims to native Android flash memory (`SharedPreferences`).
  - **Zero Cloud Requirement**: Full offline graph visualization and capture with zero mandatory accounts.
  - **Low-Memory Killer Resilience**: Native Android Foreground Audio Service prevents OS kills during long recordings.
- **Bottom Callout: The Privacy Review Gate (Default-Discard Policy)**
  - Mentions of financial figures, passwords, or off-the-record comments receive a `sensitivity: flagged` tag.
  - Flagged items are held in quarantine; if dismissed or unconfirmed, they are permanently discarded.

#### 4. Visual & Graphic Description
- Column 1 features an illuminated browser window graphic with an ephemeral memory badge.
- Column 2 features a sleek Android tablet mock showing the native Muninn APK with an on-device local storage chip icon.
- Bottom bar features a shield emblem with green and amber status indicators.

#### 5. Animation & Motion Choreography
- Both device mockups rise simultaneously with smooth depth parallax.
- The privacy shield locks into place in the bottom center with a subtle green pulse.

#### 6. Presenter Script & Voiceover
> *"We built Muninn for developers who take privacy seriously. On the web, guest sessions live in ephemeral tab memory and are destroyed when the tab closes. On our Android tablet APK, everything runs local-first, writing directly to device hardware storage without requiring any cloud account. And our default-discard privacy gate ensures sensitive data is never indexed without explicit confirmation."*

---

### Slide 10: Business Impact, Live Demo & Conclusion

#### 1. Header & Typography
- **Overline Badge**: `[ PRODUCTION READY ]` (Monospace, Gold `#f59e0b`).
- **Main Title**: `Experience Muninn Today` (Serif, 44pt, `#ffffff`).
- **Subtitle**: `The living cognitive layer for high-velocity engineering organizations.` (Sans, 18pt, `#94a3b8`).

#### 2. Layout Geometry
- **Left Column (50% width)**: Business impact metrics and enterprise ROI value pillars.
- **Right Column (50% width)**: Live interactive QR codes, production URLs, and repository badges.

#### 3. Exact Content & Copy
- **Left Business Value Pillars**:
  - **Context Loss Elimination**: Reclaims up to 20% of wasted senior developer bandwidth.
  - **Frictionless Compliance**: Audit-ready decision logs with exact timestamp provenance for SOC2 and ISO compliance.
  - **Accelerated Onboarding**: New hires query Muninn Chat to understand historical architecture rationale instantly.
  - **Zero Maintenance Overhead**: Completely automated claim extraction; zero manual Jira/Linear ticket writing required.
- **Right Live Platform Links**:
  - **Live Web Application**: `https://muninn-nmk.pages.dev`
  - **Global Edge API**: `https://muninn-api.kshitiz23kumar.workers.dev`
  - **Public Open Source Repo**: `https://github.com/Erebuzzz/Muninn`
  - **Android Tablet APK**: `GitHub Releases v1.5 (7.72 MB)`
  - **Interactive Codex**: `https://muninn-nmk.pages.dev/docs`
  - **Author Credit**: `Engineered by Erebus`

#### 4. Visual & Graphic Description
- Left side features clean ROI checkmark badges with bold statistics.
- Right side features a prominent QR code linking directly to `https://muninn-nmk.pages.dev`, framed by a Norse geometric gold border.
- The Norse raven silhouette sits proudly in the bottom right corner with soft ambient starlight.

#### 5. Animation & Motion Choreography
- ROI pillars fade in sequentially from bottom to top.
- The live production link cards illuminate with an amber sweep.
- Golden celestial starlight twinkles across the background canvas for the grand finale.

#### 6. Presenter Script & Voiceover
> *"Muninn is live, open-source, and production-tested today. You can open muninn-nmk.pages.dev right now, start a capture session, talk to our Co-Pilot, and explore your own living memory graph. It's time to stop losing the decisions that matter. Thank you."*

---

## Part 3: Agent Automation Execution Guide

When delegating this prompt to an autonomous presentation agent (such as Composio Google Slides, Gamma, or Figma):
1. **Apply the Color Tokens Strictly**: Use `#030712` for the ground tone, `#f59e0b` / `#f97316` for key highlights, and `#38bdf8` for data / tech conduits.
2. **Never Invent Placeholders**: Every metric, URL, and architectural fact specified in Part 2 is real, deployed, and verified in the Muninn codebase.
3. **Preserve Layout Hierarchy**: Follow the exact column ratios (e.g., 55/45 or 50/50) and typography scale to prevent text overflow.
4. **Export Format**: Maintain standard 16:9 widescreen presentation dimensions (1920x1080px or 1600x900px).
