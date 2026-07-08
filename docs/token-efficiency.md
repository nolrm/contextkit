# Token-First Context Loading

Status: mechanism decided (Skill-only, zero new CLI surface) — implementation + validation pending, see `.contextkit/product/decisions.md` once shipped.

## TL;DR

### Decision
Use a thin always-loaded context layer plus on-demand standards, delivered entirely as **Skills** — no new `ck` commands, flags, or config files.

### Why
Current MD-first loading sends too much context into every session. This repo's own `@import` set is ~6x Anthropic's documented 200-line `CLAUDE.md` guidance (see Evidence below).

CLI-command mechanisms (`ck compress`, `ck check --tokens`, `/analyze --compact`) were considered and rejected: work happens inside Claude/Codex sessions, not a terminal — a command that has to be remembered and typed separately doesn't get run. The mechanism has to trigger automatically as part of normal in-session work, the same way existing skills (`analyze`, `review`, `squad-auto`) already do.

### Principle
Optimize for information density, not documentation density — and optimize for zero-friction, automatic invocation over anything the user has to remember to run.

### Proposed Split (this repo's own `@import` set)

| Tier | Files | Mechanism |
|---|---|---|
| Always loaded, full content | `code-style.md`, `architecture.md` | Keep as `@import` — near-100% task hit rate |
| Always loaded, header only | `ai-guidelines.md`, `glossary.md` | Fold key points into a Skill's one-line `description` — meta/low-frequency, doesn't need full body on by default |
| On demand, full body on trigger | `testing.md`, `workflows.md`, `decisions.md`, `roadmap.md`, `corrections.md` | Convert to Skills (task/topic-triggered, not directory-triggered — fits these better than nested `CLAUDE.md`) |

Skills over "just tell the AI to read it when relevant" because Skills are a mechanism ContextKit already ships (`.claude/skills/`, mirrored in `.codex/skills/`) — no new infrastructure, and Tier-1 headers cost ~100 tokens/skill vs. paying full-body cost every turn regardless of relevance.

### Product Extension: a `compress` Skill

Instead of a CLI command, ship a single Skill (`.claude/skills/compress/SKILL.md`, mirrored to `.codex/skills/compress/SKILL.md`) that a user or agent triggers by name inside a Claude/Codex session. It is fully self-contained:

1. Measures current file size (line/word count via `Bash` — the same `wc -l` approach used for the Measured Baseline below; no bespoke tooling needed).
2. Rewrites the target file(s) for density while preserving rules/meaning — no Mermaid unless requested, minimal tables, short bullets, selective examples, no repeated rationale.
3. Re-measures and reports the before/after diff in its own output.

No config file, no `detail:` setting, no CLI flag. The `analyze` skill's own instructions get updated to default to this compact style when generating standards for installed projects in the first place — so newly generated files start dense, and `compress` is only needed to retrofit existing ones.

### Validation
Measure, before treating this as default behavior:
- token footprint (`@import` total vs. typical task context)
- cache-hit impact (stable content like `code-style.md` vs. volatile content like `corrections.md` shouldn't share a cache prefix)
- output quality / task success rate
- standards compliance (does the AI still follow the rule after compression, not just "is the file shorter")

Directly motivated by an external finding: LLM-*generated* rules files (produced speculatively rather than from observed failures) measured 0.5–2% *lower* task success and 20%+ *higher* inference cost. Compact generation must be driven by real codebase patterns, not exhaustive speculative coverage — see Evidence.

### Non-Goals
- no new CLI commands or flags (`ck compress`, `ck check --tokens`, `/analyze --compact`) — everything runs as a Skill triggered inside a Claude Code / Codex session
- no config file / `detail:` setting
- no MCP
- no SQLite
- no vector DB
- no complex memory system

---

## Evidence & Research

Supporting detail for the TL;DR above — read on demand, not meant to be always-loaded itself (eating its own cooking).

### Measured Baseline (this repo, 2026-07-08)

```
  41  CLAUDE.md
  95  .contextkit/standards/ai-guidelines.md
 160  .contextkit/standards/architecture.md
 104  .contextkit/standards/code-style.md
  41  .contextkit/standards/glossary.md
 160  .contextkit/standards/testing.md
 117  .contextkit/standards/workflows.md
   9  .contextkit/product/mission-lite.md
 195  .contextkit/product/decisions.md
 135  .contextkit/product/roadmap.md
 101  .contextkit/corrections.md
1158  total (excluding standards/README.md, not @imported)
```

Anthropic's own Claude Code guidance recommends keeping `CLAUDE.md` **under 200 lines** (some teams target ~60), specifically because it and its imports load into every session from message one. This repo's always-loaded set is **~6x** that ceiling. Independently-reported baseline: a typical session already carries 20–30K tokens before the user types anything (system prompt + CLAUDE.md + memory + MCP tool schemas + skill descriptions) — our `@import` set is a meaningful fraction of that budget on top.

This is the strongest concrete argument for the always-loaded/on-demand split: it's not hypothetical, we're measurably over documented guidance.

### Prior Art (researched 2026-07-08)

**[Ponytail](https://www.alphamatch.ai/blog/ponytail-ai-coding-skill-2026)** — plugin enforcing a "decision ladder" before code generation (YAGNI → stdlib → platform feature → installed dep → one-liner). Targets output/generation discipline, not context loading; claims 80–94% less code generated, ~16% token reduction per task. Complementary, not a direct answer — the ladder itself could become a standards rule (aligns with existing "don't add abstractions beyond what's needed" guidance in `ai-guidelines.md`).

**[Caveman](https://getcaveman.dev/)** ([repo](https://github.com/juliusbrussee/caveman)) — five-layer stack (Proxy, Memory/`cavemem`, Code, Plan, Rollout). `cavemem` does selective retrieval instead of resending full history — directly validates the always-loaded/on-demand split. Introduces the **prompt-caching lever**: stable content (code-style, architecture) should be separated from volatile content (`corrections.md`, which changes per session) so it isn't invalidated turn-to-turn. Ships `/caveman-compress` — a concrete compress-in-place mechanism (in their case, a slash command in the same spirit as the `compress` Skill proposed here), ~46% input token cut. Honesty caveat: their own README warns output-token savings ≠ total savings (skill/rule injection itself adds ~1–1.5k input tokens/turn; reasoning tokens untouched) — can go net-negative on already-terse workloads. Supports "measure before restructuring."

### Comparable Standards: AGENTS.md & llms.txt (researched 2026-07-08)

**AGENTS.md** — the cross-tool file (OpenAI/GitHub/Codex) that's the direct analog to `CLAUDE.md`, so its findings transfer more directly than Ponytail/Caveman:
- A controlled study (124 PRs, 10 repos, Codex) found AGENTS.md presence cut median wall-clock time **28.6%** and median output tokens **16.6%** — but the paper's quality check was only a manual spot-check for non-trivial changes, not correctness. Full quality evaluation is explicitly future work.
- GitHub's analysis of **2,500+ repos'** AGENTS.md files: commands listed early *verbatim* beat prose descriptions; **one real code example beats three paragraphs of style description**; a three-tier boundary marker (✅ always / ⚠️ ask first / 🚫 never) beats long "please don't" explanations; vague filler ("you are a helpful assistant") and exhaustive dependency lists are pure waste.
- Caution, feeding directly into Validation above: LLM-*generated* (speculative) rules files measured 0.5–2% lower task success and 20%+ higher inference cost. Rules should encode observed failures, not be generated exhaustively upfront.

**[llms.txt](https://llmstxt.org)** — web-facing LLM-doc standard: plain Markdown only, headings capped at H1/H2 (no H3+), hard ceiling of **~3,000 tokens** for the index file. Markdown vs. HTML alone gives up to 80% token reduction. No major AI vendor has committed to reading it in production (as of Q1 2026) — treat as a formatting-density precedent, not a distribution channel.

**Nested `CLAUDE.md`** — Claude Code natively supports subdirectory-scoped `CLAUDE.md` files that load only when Claude is working in that folder. A built-in alternative to Skills for anything that maps cleanly to a directory. Not used in the Proposed Split above because `testing.md`/`workflows.md` are task-triggered, not directory-triggered — a test-writing task can happen anywhere in the repo — so Skills fit better here.

### Broader Landscape (researched 2026-07-08)

- **Claude API context compaction** (beta, `compact-2026-01-12` header) — Anthropic-native mid-conversation compaction; one documented case compressed 132K tokens to ~2K. More relevant to long squad-pipeline sessions than the standing `@import` cost, but a useful safety net to know about. Not something ContextKit builds — it's client/API-side, outside this CLI's control.
- **Subagent offload pattern** — Anthropic's own example: a subagent read 6,100 tokens of files, returned a 420-token result. Already how the `Agent` tool is used here for research — validates keeping file-heavy work off the main thread.
- **[Headroom](https://www.alphamatch.ai/blog/headroom-context-compression-ai-agents-2026)** — reversible compression for tool outputs/logs/files/RAG chunks (60–95% fewer tokens). Aimed at tool-output bloat, not standards files.
- **[context-compress](https://github.com/vidanov/context-compress)** — semantic-aware compression of *agent instruction files* specifically, claims 40–50% reduction "while preserving behavioral compliance," validated via automated A/B testing. Closest direct precedent for what the `compress` Skill needs to do to `.contextkit/standards/` files — notably includes a compliance check, not just a size measurement. This is where the Validation section's "standards compliance" check comes from.
- **[Tokalator](https://arxiv.org/pdf/2604.08290)** — context budget visibility tooling (VS Code extension, CLI/MCP server, usage tracker). We currently have no way to see `@import` cost without manually `wc -l`'ing files, as done above — the `compress` Skill's own measurement step covers this in-session instead of adopting a separate tool.

### Mechanism: Claude Code Skills (researched 2026-07-08)

The Proposed Split's mechanism isn't new infrastructure — it's an existing ContextKit capability (`.claude/skills/`, already wired up for squad commands) applied to standards.

**How Skills load** ([docs](https://code.claude.com/docs/en/skills)):
- **Tier 1 (always loaded):** every installed skill's `name` + one-line `description` — roughly 100 tokens/skill.
- **Tier 2 (loaded on match):** the full `SKILL.md` body loads only when Claude decides it's relevant, and stays loaded for the rest of the session once triggered.
- **Tier 3 (loaded on demand):** supporting reference files inside the skill load only if actually needed.

A skill with a 2,500-token body and a 60-token header defers ~98% of its cost until it actually fires. This is also why a Skill beats a CLI command for this use case: a CLI command only runs if the user remembers to type it; a Skill's header is always present, so Claude/Codex can trigger it automatically when a matching task comes up — no memory burden on the user.

Directly observable in this session: `mcp__claude-in-chrome__*` and several other tools were deferred — only names in context — until `ToolSearch` pulled in full schemas. Independent MCP research shows the same pattern (`search_tools` instead of injecting every schema upfront) cuts schema-token consumption 80–95% ([MindStudio](https://www.mindstudio.ai/blog/reduce-token-usage-ai-agents-mcp-optimization), [GitHub issue #2808](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2808)) vs. ~121 tokens/tool/turn paid regardless of use. We're already benefiting from progressive disclosure elsewhere in this same tool — standards are the one place it isn't applied yet.

### Product-Level Caveat: Skills Aren't Universal Across Platforms

Everything above assumes Claude Code or Codex, where Skills exist. ContextKit also generates standards for platforms with no equivalent tiered-loading primitive — Cursor, Copilot, Gemini, Aider, Continue, Windsurf, OpenCode (`lib/integrations/`) all get flat rule/instruction files, not Skills. So the `compress` Skill and the "bake compact-by-default into `analyze`" change only address token cost for Claude Code and Codex users directly. For the other integrations, the only lever is generating denser content in the first place (shorter files, no Mermaid, minimal tables) — there's no on-demand loading tier to defer to. Not a blocker, but scope this explicitly rather than assuming the Skill mechanism generalizes.

### Reaching Existing Installations

A new `compress` Skill or a denser `analyze` only helps projects that already have it — everyone who ran `ck install` before this ships is stuck on the old files, and won't proactively run `ck update` to find out. This is a distribution problem, separate from the in-session automation decided above, and needs its own delivery path rather than assuming Skill auto-trigger will surface it.

What already exists but only fires on request:
- `ck status` and the `ck` Skill's health-check (`.contextkit/commands/dev/health-check.md`, step 7) compare installed vs. latest version and print `Run: ck update` — but only if the user explicitly invokes `/ck` or `ck status`.

Two additions to reach users who never do that, neither adding a command they have to remember:
- **Pre-push git hook nudge.** ContextKit already installs a pre-push hook (`GitHooksManager`, shell-based). Add a throttled (cache ~24h, same pattern as `update-notifier`) version check there that prints `ContextKit vX → vY available (includes: compress skill) — run ck update` after a successful push. Reaches every user, independent of whether any Skill gets triggered — `git push` is something they already do.
- **`standards-aware` Skill auto-remediation.** Unlike `ck`, `standards-aware` is designed to trigger automatically at the start of agentic work in a ContextKit project. Extend its workflow to run the same stale-version check and, on mismatch, offer to run `ck update` itself via `Bash` — the AI runs the one-time file-pull, the human never types or remembers a command.

Pulling new files into an existing project is unavoidably a one-time `ck update` invocation — the goal is just to make sure *something* runs it (the hook or the AI) instead of relying on the human to check.

### Marker-Safe Edits (Custom `CLAUDE.md` / Bridge Files)

`CLAUDE.md` is a **bridge file** (`lib/integrations/base-integration.js`, `writeBridgeFile()`): ContextKit's content lives between `<!-- Generated by ContextKit -->` and `<!-- End ContextKit -->` markers. Content outside the markers is the user's own (custom notes, deploy checklists, whatever they added) and today's `ck install`/`ck update` code path never touches it — if markers are missing entirely, it appends below rather than overwriting.

That contract is enforced in code, but the `compress` Skill and the "migrate `@import`s to Skills" step are AI-driven edits (`Read`/`Edit`), not routed through `writeBridgeFile()` — nothing stops a careless edit from rewriting the whole file. Both Skills' instructions must explicitly say:
- locate both marker lines; edit only the content between them; leave everything outside byte-for-byte unchanged
- if both markers aren't found, don't guess — stop and point at `ck update` instead of auto-editing

Separately, `.claude/skills/*/SKILL.md` files are `generatedFiles`, not bridge files — no marker wrapping. If a user hand-customized one, a Skill-driven rewrite would silently clobber it. Back up first (same `createBackup()` pattern `update.js` already uses) before either Skill touches these.

### Long-File Split Rule (READMEs, Documentation Levels)

`architecture.md`'s Documentation Levels section already states the principle — "one file per concern, not everything in `README.md`" — across all three levels (architecture/page/component). Today nothing enforces it against actual file size; it's written guidance, not a check.

Proposed rule, folded into the existing `doc`, `doc-arch`, `doc-feature`, and `doc-component` Skills (where these files already get created/updated) rather than a new Skill: after writing or updating any `README.md`, check its line count. Over threshold → don't just densify prose, propose **splitting** along the Documentation Level boundaries (e.g., pull a bloated feature README's component list into per-component READMEs, link back from the parent). `compress` picks this up too, for retrofitting already-oversized docs found later.

Splitting is the better move for these files specifically (vs. `.contextkit/standards/`, which benefits more from prose density): README content already loads on-demand, so the win isn't cheaper import cost, it's that only the relevant sub-file gets read at all instead of the whole bloated parent.

## Next Steps

- [x] Measure current `@import` token footprint (done — see Measured Baseline)
- [ ] Build the `compress` Skill (`.claude/skills/compress/SKILL.md`, mirrored `.codex/skills/compress/SKILL.md`) — self-measuring (Bash/`wc`), rewrites for density, re-measures, reports diff. No CLI command.
- [ ] Migrate this repo's own `testing.md`/`workflows.md`/`decisions.md`/`roadmap.md`/`corrections.md` to Skills (dogfoods the `compress` Skill and the Proposed Split table)
- [ ] Fold `ai-guidelines.md`/`glossary.md` key points into Skill descriptions
- [ ] Update the `analyze` Skill's own instructions to default to compact/dense output when generating new standards (no config flag, no CLI)
- [ ] Build the compliance check inside the `compress` Skill's own workflow (in the spirit of `context-compress`'s approach) — verify behavior post-compression, not just line count
- [ ] Validate (see Validation section) before treating compact-by-default as standard ContextKit behavior
- [ ] Decide how (or whether) to extend density gains to non-Skill platforms (Cursor, Copilot, Gemini, Aider, Continue, Windsurf, OpenCode) — see Product-Level Caveat
- [ ] Add throttled version-check nudge to the pre-push git hook — see Reaching Existing Installations
- [ ] Extend `standards-aware` Skill to check for staleness and offer to self-run `ck update` — see Reaching Existing Installations
- [ ] Write marker-scoping instructions into the `compress` Skill and the `@import`-migration step, plus a backup-before-write step for hand-customized `generatedFiles` — see Marker-Safe Edits
- [ ] Add a line-count threshold + split-along-Documentation-Levels rule to `doc`/`doc-arch`/`doc-feature`/`doc-component` Skills (and `compress` for retrofits) — see Long-File Split Rule
