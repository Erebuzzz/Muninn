# Knowledge Graph & Proactive Resurfacing

Muninn transforms unstructured spoken audio into a living, typed relational graph.

---

## 1. The Five Atomic Claim Types

Every technical sentence is triaged into one of five atomic claim types:

```mermaid
classDiagram
    class Claim {
        +UUID id
        +UUID conversation_id
        +UUID speaker_id
        +ClaimType type
        +String text
        +ConfidenceLevel confidence
        +SensitivityLevel sensitivity
        +DateTime timestamp
        +Vector1536 embedding
    }

    class Decision {
        Architectural consensus or binding pact
    }

    class Task {
        Assigned engineering work with blocker tracking
    }

    class Observation {
        Empirical finding, benchmark, or telemetry data
    }

    class Question {
        Open technical uncertainty requiring resolution
    }

    class Hypothesis {
        Unverified technical assumption slated for test
    }

    Claim <|-- Decision
    Claim <|-- Task
    Claim <|-- Observation
    Claim <|-- Question
    Claim <|-- Hypothesis
```

---

## 2. Recursive Dependency Traversals (CTEs)

Muninn models relationships between claims using directional edges (`blocks`, `depends_on`, `resolves`). Multi-tier dependency trees are resolved using recursive Common Table Expressions:

```sql
WITH RECURSIVE dependency_chain AS (
  SELECT 
    c.id, c.text, c.type, ts.status, ts.blocked_by, 1 AS depth
  FROM claims c
  LEFT JOIN task_state ts ON ts.claim_id = c.id
  WHERE c.id = $1::uuid

  UNION ALL

  SELECT 
    parent.id, parent.text, parent.type, pts.status, pts.blocked_by, dc.depth + 1
  FROM claims parent
  JOIN relationships r ON r.from_claim_id = parent.id
  LEFT JOIN task_state pts ON pts.claim_id = parent.id
  JOIN dependency_chain dc ON dc.blocked_by = parent.id
  WHERE dc.depth < 10
)
SELECT * FROM dependency_chain;
```

---

## 3. Proactive Resurfacing Engine ("You Left This Behind")

When a session completes, Muninn inspects all newly resolved entities and decisions against the user's active graph:

```mermaid
flowchart TD
    NewSession[Session Completed] --> ExtractEntities[Extract Entities & Decisions]
    ExtractEntities --> CheckBlocked[Query Stale Tasks Blocked by Matched Entities]
    CheckBlocked --> FoundBlocker{Is Blocker Resolved?}
    FoundBlocker -->|Yes| FireAlert[Generate Resurfacing Event]
    FoundBlocker -->|No| CheckConflict{Does Decision Conflict with Prior Pact?}
    CheckConflict -->|Yes| FireConflictAlert[Generate Contradiction Alert]
    CheckConflict -->|No| StoreMemory[Quietly Persist Claims]

    FireAlert --> AmbientFeed[Publish to 'You Left This Behind' Workspace Feed]
    FireConflictAlert --> AmbientFeed
```

---

## 4. Sovereign Memory Deletion & Cascade Cleanups

Users retain total ownership over their memory. Deletion of sessions or claims cascades cleanly across all referencing tables:

```mermaid
flowchart TD
    Trigger[Delete Session Triggered] --> Step1[1. Delete resurfacing_events]
    Step1 --> Step2[2. Delete relationships from/to claims]
    Step2 --> Step3[3. Delete claim_entities joins]
    Step3 --> Step4[4. Delete task_state entries]
    Step4 --> Step5[5. Delete claims records]
    Step5 --> Step6[6. Delete speaker diarization records]
    Step6 --> Step7[7. Delete conversation record]
    Step7 --> Step8[8. Purge orphan entities not referenced by any remaining claims]
    Step8 --> Done[Clean Deletion Completed]
```
