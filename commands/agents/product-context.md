# Product Context

Use this command to understand why the project is built the way it is, and what's planned next, before proposing changes that might conflict with an existing decision or a near-term roadmap item.

## What I'll Do

1. Read `.contextkit/product/decisions.md` — Architecture Decision Records: what was decided, why, and what alternatives were considered.
2. Read `.contextkit/product/roadmap.md` — current phase, in-flight work, and near-term plans.
3. Use both to answer "why was X built this way" / "what's planned next" questions, and to check new work against existing ADRs before proposing a conflicting approach.

## When to Use

- Before proposing an architectural change — check `decisions.md` first for a prior ADR that already ruled on this
- Before starting new work — check `roadmap.md` for whether it's already planned, in progress, or explicitly deprioritized
- When a user asks "why do we do it this way" — answer from the recorded rationale, not a guess

## Fresh Install Note

If `decisions.md`/`roadmap.md` still contain placeholder text, they have no useful content yet. Skip them and proceed with your best judgment until `/analyze` has been run.
