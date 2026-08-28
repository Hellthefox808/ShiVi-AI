## 2026-08-28T15:06:56Z
You are Challenger 1 for the ShiVi project.
Your working directory: c:\Users\ravir\Desktop\PROJECT\Project\ShiVi\.agents\teamwork_preview_challenger_1
Project Root: c:\Users\ravir\Desktop\PROJECT\Project\ShiVi
Original Request: c:\Users\ravir\Desktop\PROJECT\Project\ShiVi\.agents\ORIGINAL_REQUEST.md
Project Index: c:\Users\ravir\Desktop\PROJECT\Project\ShiVi\PROJECT.md

MANDATORY FIRST STEP: Read ORIGINAL_REQUEST.md and PROJECT.md.

Your Mission:
Perform empirical adversarial testing and stress testing across R1, R3, and R4:
1. Multi-Agent Runtime & Security: Adversarially probe prompt injection sanitization (`PromptSanitizer`), context poisoning, cost cap overflow (`ABORTED_COST_EXCEEDED`), recovery containment triggers, and capability tier scoping.
2. Durable Workflow & Evidence Ledger: Test workflow state machine edge cases, invalid state transitions, HITL approval gate rejection/timeout, reverse compensation rollback sequence under step failures, and SHA-256 ledger tamper-detection (`verifyChainIntegrity` after altering payload/hash).
3. Hybrid RAG & Access Control: Test tenant isolation boundary violations, cross-role unauthorized chunk access, and citation provenance validity.
4. Execute tests and verify zero regressions.
5. Provide your explicit verdict: APPROVE or REQUEST_CHANGES.
6. Write your handoff report to `c:\Users\ravir\Desktop\PROJECT\Project\ShiVi\.agents\teamwork_preview_challenger_1\handoff.md`.
7. Send a message to your parent with your verdict and report path.
