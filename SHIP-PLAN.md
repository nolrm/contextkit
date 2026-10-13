# `/ship` — Automatic Pipeline Plan

> **Superseded (2026-10-13):** ContextKit 2.0 removed squad instead of replacing it with `/ship`. Long tasks now use `/goal` (a one-page goal file, the agent's own build loop, fresh-context review per outcome). See `docs/plans/contextkit-2.0.md`.

> Problem: squad works, but nobody runs it. In a month of sessions the user typed zero squad
> commands — every run was one Claude invoked. Ten separate commands (`/squad`, `/squad-architect`,
> `/squad-dev`, …) is too much ceremony, and the pipeline stops short of what actually matters
> before shipping: running the real app and reproducing user behaviour.
>
> Goal: one command, requirement in → verified, documented, committed branch + draft PR out, with
> a human stop only where a decision genuinely needs one. Test cost paid once per task, not per phase.

---

## 1. The flow

```
Requirement
    ↓
Planning agent ──── stops for you only if it flags a real decision
    ↓                (schema change, new dependency, unclear scope)
Implementation agent
    ├── tests from the acceptance criteria first, then code
    └── runs SCOPED tests only (seconds) — loops until they pass
    ↓
    ├── Review agent (fresh context) ─┐  run in parallel
    │   inspect diff, challenge        │
    │   assumptions, edge cases,       │
    │   missing tests                  │
    └── Full suite (background) ───────┘
    ↓            ↑
    │     needs-work or suite red → back to Implementation (cap: 2 retries)
    ↓
Verification agent (only after Review passes)
    ├── integration / E2E
    └── run the real app, reproduce the user behaviour from the requirement
    ↓            ↑ fails → back to Implementation (same retry cap)
Docs (/check-docs, apply mode)
    ↓
Commit + record verified fingerprint → draft PR
    ↓
You — decisions summary + exploratory test
    ↓
Ship → production signals feed the next requirement and the standards files
```

## 2. Tiered testing — pay for the full suite once

Measured on this repo: full suite ~270s; `jest --findRelatedTests` on 2 changed files ~7s.

| Tier | When | What | Cost |
|---|---|---|---|
| Scoped | Every Implementation loop | Tests for touched files + direct dependents (`jest --findRelatedTests`, `vitest related`, `go test ./changed/...`, `pytest path::`) | seconds |
| Full suite | Once, **in parallel with Review** | Everything | hidden behind review time |
| E2E / real app | Once, after Review passes | Integration, E2E, reproduce user behaviour | slowest — never run on code Review may reject |
| Pre-push | On `git push` | **Skipped** — already verified | ~0 |

The pre-push skip shipped first (see §5): Verification runs `.contextkit/hooks/pre-push < /dev/null`
after committing, which runs the exact same gates and records a fingerprint of the tree. The
following `git push` sees the same fingerprint and skips. No double full-suite run.

## 3. Mapping from squad

| `/ship` phase | Replaces | Notes |
|---|---|---|
| Planning | PO + Architect | One agent writes acceptance criteria (EARS) and the plan. Keeps squad-architect's split detection and context-file discovery. |
| Implementation | Dev + Test | Merged. Tests from ACs *before* code. Scoped tests only. |
| Review | Review | Unchanged design (primary model, fresh context, prior-issue check on retry). Adds: challenge assumptions, missing tests. Reads scoped + full-suite results. |
| Verification | *new* | Uses the `run` skill + browser tools to exercise the real app. Independent of the test author. |
| Docs | Doc | Becomes `/check-docs` apply mode instead of companion-file docs. |
| Commit + PR | Commit step | Adds draft PR in the `/pr-description` format. |

Every phase stays an isolated subagent reading only the handoff file — that part of squad is kept.

## 4. Build steps

1. **`/ship` command** (`commands/ship/ship.md` + registry entry) — orchestrator: dispatch phases, own the retry loop and `attempts` bookkeeping, start the full suite in the background alongside Review.
2. **Planning prompt** — merged PO/Architect; outputs ACs, plan, and a `needs_decision:` list (empty = continue without stopping).
3. **Implementation prompt** — tests-first from ACs, scoped-test command detection per stack (reuse the stack detection already in `hooks/pre-push`).
4. **Verification prompt** — start the app, reproduce the requirement's user flow, record what was actually observed.
5. **Wire the tail** — `/check-docs` apply → commit → run hook to record fingerprint → draft PR → decisions summary.
6. **Squad's fate** — keep `/squad-spec` (spec scopes, unattended overnight runs) and point it at the same phase prompts; deprecate the manual per-phase commands once `/ship` is proven on real tasks.

## 5. Status

- [x] Pre-push verified-fingerprint skip (`hooks/pre-push`, `CK_FORCE_GATES=1` override, 7 tests)
- [ ] Steps 1–6 above

## 6. Open decisions

- Name: new `/ship`, or reshape `/squad-go` (keeps muscle memory, but the name no longer describes it)?
- Keep the 10 manual squad commands as a fallback, or remove them once `/ship` is proven?
- Codex parity: same flow via `multi_agent` where available — build together, or Claude Code first?
