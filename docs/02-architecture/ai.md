# Intelligence & Agent Architecture
## AI Gateway, Model Router & 38 Specialized Agents

The ShiVi Intelligence Layer enforces a single governed entrypoint for all LLM interactions.

---

### 1. AI Gateway & Multi-Model Router

```mermaid
flowchart TD
    Task[Incoming Agent Task] --> Classifier{Classify Task Complexity & Risk}
    Classifier -->|Simple Extraction / Fast T1| Flash[Gemini 1.5 Flash / Fast Model]
    Classifier -->|Complex Reasoning / High Risk| Pro[Gemini 1.5 Pro / Claude 3.5 Sonnet]
    Classifier -->|Deterministic Calc| Code[Deterministic Code Engine]

    Flash --> CostTracker[FinOps Token & Cost Tracker]
    Pro --> CostTracker
    Code --> Result[Execution Result]
    CostTracker --> Result
```

---

### 2. Scoped Agent Memory Engine

Memory is strictly isolated into 4 hierarchical tiers:
1. **Working Memory**: Ephemeral per-turn context (TTL: 1 hour).
2. **Task Memory**: Scoped to the lifecycle of a specific workflow execution.
3. **Agent Memory**: Agent-specific operational heuristics and calibration data.
4. **Account & Organization Memory**: Verified long-term relationship insights, stakeholder maps, and contract milestones.

---

### 3. Agent Lifecycle

```
DRAFT ➔ TEST ➔ EVALUATE (Harness) ➔ APPROVE ➔ CANARY ➔ PRODUCTION ➔ MONITOR (Drift) ➔ ROLLBACK / DEPRECATE
```
