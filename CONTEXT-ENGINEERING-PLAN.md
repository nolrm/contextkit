# Context Engineering Upgrade — Plan

> Problem: ContextKit's generated context and skill layout were designed before three 2026
> shifts: (1) evidence that LLM-generated context files *hurt* agents while human-curated ones
> help, (2) Agent Skills becoming an open cross-tool standard with `.agents/skills/` as the shared
> location, and (3) `AGENTS.md` becoming the file every major agent reads. Today ContextKit
> duplicates skill text across four generators, writes Codex skills to a directory Codex's docs no
> longer list, and ships always-loaded standards full of content agents can infer themselves.
>
> Goal: fewer, better, human-curated always-loaded lines; one skill definition rendered to every
> tool; one canonical `AGENTS.md`; squad/spec pipelines that verify independently and don't drift.

Structured one phase per shippable unit — run with `/squad CONTEXT-ENGINEERING-PLAN.md` or
`/spec CONTEXT-ENGINEERING-PLAN.md --lite`.

---

## 0. Verification spikes (no release — do first)

Several phases hinge on tool behavior that the docs state but that hasn't been confirmed against
real installs. Each spike is a scratch-repo experiment; record results in §9 before starting the
phase that depends on it.

| # | Question | How to check | Blocks |
|---|---|---|---|
| S1 | Does current Codex CLI still load skills from `.codex/skills/`? Its docs list only `.agents/skills/` (cwd → repo root), `~/.agents/skills/`, `/etc/codex/skills`. | Scratch repo with one skill in each dir; run `codex`, ask it to list skills / invoke `$name`. | Phase 1 urgency |
| S2 | What does Cursor do with the same skill name in `.agents/skills/`, `.claude/skills/`, `.codex/skills/`? (It scans all of them.) Is `.cursor/prompts/` still read at all? | Same scratch repo, open in Cursor, check skill picker. | Phase 1 Cursor changes |
| S3 | Claude Code: confirm `.agents/skills/` is **not** scanned (docs list only `.claude/skills/`), and that `@AGENTS.md` inside `CLAUDE.md` imports correctly. (Claude Code 2.1.277+ reads `AGENTS.md` only when no `CLAUDE.md` exists.) | Scratch repo; `/skills` and `/context`. | Phases 1, 2 |
| S4 | Do Gemini CLI and Copilot (VS Code) read `AGENTS.md` natively, or does each need its own file importing it? | Scratch repo per tool. | Phase 2 |
| S5 | Does Codex now have an isolated-subagent primitive usable from a skill? `squad-spec.md` currently documents this as a known gap. | Codex docs + scratch run. | Phase 5 Codex path |

---

## 1. Single skill registry + `.agents/skills/` — 1.9.0

### Current state
Skill wrapper text is hand-written in four places that drift independently:

| Generator | Output | Count |
|---|---|---|
| `lib/integrations/claude-integration.js` (inline template strings) | `.claude/skills/*/SKILL.md` | 25 |
| `lib/integrations/codex-integration.js` (inline) | `.codex/skills/*/SKILL.md` | 22 |
| `lib/integrations/cursor-integration.js` (inline) | `.cursor/prompts/*.md` | 10 |
| `lib/utils/global-skills.js` (`SKILLS` array) | `~/.claude/skills/*/SKILL.md` | 12 |

Drift has already shipped: the Claude `/spec` description described a retired pipeline until 1.8.0,
and the `argument-hint` for `squad` differs between `claude-integration.js` and `global-skills.js`.

### Changes
1. **New `lib/skills/registry.js`** — one entry per skill: `name`, `description`, `whenToUse`,
   `source` (command file path), `argumentHint`, `body` (wrapper text), and a `claude` block for
   Claude-only frontmatter (`allowed-tools`, `effort`, `context`, `model`,
   `disable-model-invocation`). Families (`squad`, `spec`, `docs`, `standards`) carried as a field.
2. **New `lib/skills/render.js`** — `renderSkill(entry, target)` for targets:
   - `claude` → `.claude/skills/<name>/SKILL.md`, full Claude frontmatter, wrapper body pointing at `.contextkit/commands/...`
   - `agents` → `.agents/skills/<name>/SKILL.md`, portable frontmatter only (`name`, `description`, `metadata`)
   - `global` → current `global-skills.js` behavior (inlined command content)
   Every rendered file gets `metadata: { contextkit-managed: true, contextkit-version: X }` so
   cleanup can never touch user-authored skills (same guarantee `ck uninstall --global` has today).
3. **Codex** writes `.agents/skills/` instead of `.codex/skills/`. Cleanup removes
   `.codex/skills/<name>/` only for names in the registry **and** only if the file lacks user
   edits (compare against the previous version's rendered content, else leave it and warn).
4. **Cursor** (pending S2): drop `.cursor/prompts/*` — Cursor reads `.agents/skills/` and
   `.claude/skills/` directly. Add the prompt files to `removeLegacyFiles()`. If S2 shows duplicate
   names cause problems when both `.agents/` and `.claude/` exist, write `.agents/skills/` only when
   Claude isn't selected, or have Cursor rely on `.claude/skills/`.
5. **`global-skills.js`** reads `SKILLS` from the registry (filter by family) instead of its own
   array. Add `~/.agents/skills/` as a second global target so Codex and Cursor get global skills too.
6. **Frontmatter upgrades** Claude Code now supports:
   - `disable-model-invocation: true` on side-effectful/manual workflows: `squad-reset`, `squad-go`, `squad-auto`, `squad-spec`
   - `when_to_use` on the on-demand standards skills (`standards-aware`, `product-context`, `test`) so auto-invocation triggers reliably

### Acceptance criteria
- WHEN `ck install` runs with Claude selected, the system SHALL write `.claude/skills/<name>/SKILL.md` for every registry entry whose targets include `claude`.
- WHEN `ck install` runs with Codex selected, the system SHALL write skills to `.agents/skills/` and SHALL NOT write `.codex/skills/`.
- WHEN `ck update` runs on a project with ContextKit-generated `.codex/skills/` files, the system SHALL remove those files and SHALL leave any `.codex/skills/` directory not in the registry untouched.
- IF a skill's description is changed in the registry, THEN every generated target SHALL reflect it without editing any integration file.

### Tests
- `__tests__/skills/registry.test.js` — every entry has name/description/source; `source` file exists in `commands/`.
- `__tests__/skills/render.test.js` — each target's frontmatter shape; `agents` target contains no Claude-only keys.
- Update `claude-integration.test.js`, `codex-integration.test.js`, `cursor-integration.test.js`, `global-skills.test.js` for new paths.

---

## 2. `AGENTS.md` as the canonical bridge — 1.9.0

### Current state
- Every integration writes its own bridge with its own content. Codex and OpenCode **both** write
  the `AGENTS.md` marker block with *different* content — whichever runs last wins.
- `BaseIntegration.getStandardsBlock()` (used by Aider, Copilot, Gemini, OpenCode, Windsurf) is
  stale: it lists `.contextkit/commands/analyze.md` (actual: `commands/dev/analyze.md`) and
  `run-tests.md` (removed in 1.7.0), and lists all six standards as if always-loaded, contradicting
  the on-demand-skills split. **This is a live bug — fix in this phase regardless of the rest.**

### Changes
1. **New `lib/integrations/agents-md.js`** — one `renderAgentsMd(config)` producing the canonical
   body: commands, non-inferable rules pointer, on-demand skills list, corrections pointer.
   Budget: ≤ 40 lines.
2. `AGENTS.md` is written once when **any** integration that reads it is selected (Codex, OpenCode,
   Cursor, Copilot pending S4, Gemini pending S4). Integrations declare `readsAgentsMd: true`
   instead of each calling `writeBridgeFile('AGENTS.md', ...)`.
3. **`CLAUDE.md` block** becomes `@AGENTS.md` plus Claude-only lines (`@`-imports of the
   always-loaded standards, skills note). Pending S3.
4. **`GEMINI.md` / `.github/copilot-instructions.md`**: if S4 shows native `AGENTS.md` support, stop
   generating them (legacy-cleanup the marker block only, never the user's content); otherwise
   reduce each to a one-line pointer/import.
5. Delete `getStandardsBlock()` from `BaseIntegration` once no integration uses it.

### Acceptance criteria
- WHEN both Codex and OpenCode are selected, the system SHALL write exactly one ContextKit block in `AGENTS.md`.
- WHEN any integration is installed, the system SHALL NOT reference a command file that doesn't exist in `commands/` (enforced by test).
- IF `CLAUDE.md` contains user content outside the ContextKit markers, THEN the system SHALL preserve it byte-for-byte.

### Tests
- `__tests__/integrations/agents-md.test.js` — single block under multiple integrations; line budget.
- New cross-integration test: every `.contextkit/commands/...` path mentioned in any generated bridge exists in `commands/`.

---

## 3. Evidence-driven `/analyze` — 1.10.0

### Current state
- `docs/token-efficiency.md` already cites the ETH finding (LLM-generated rules: −0.5–2% success,
  +20% cost), and `commands/dev/analyze.md` already has an "Output Density" section. But the
  analysis process still scans for things agents can infer (step 1 "Directory organization
  patterns", step 2 dependency inventory), and the generated `architecture.md` leads with a
  directory tree — the one section type the ETH study found in 100% of generated files and found
  not to help agents locate files.
- This repo's own always-loaded set: `code-style.md` (365 words, incl. a "Key Dependencies" table
  derivable from `package.json`) + `architecture.md` (716 words, mostly layout) + `mission-lite.md`.
- Human-written files measured +4% success. Nothing in the flow distinguishes reviewed from unreviewed rules.

### Changes
1. **Rewrite `commands/dev/analyze.md` around a "non-inferable only" filter.** A candidate rule is
   written only if it passes all three:
   - Not derivable from manifest/config/file tree (`package.json`, `tsconfig`, lint config, directory listing)
   - Grounded in an observed file — cite the path
   - Changes agent behavior (a reasonable agent would otherwise do it differently)
   Explicitly excluded: directory trees, framework/language descriptions, dependency tables, generic best practices.
2. **Output shape** for always-loaded files: `## Commands` (exact invocations), `## Gotchas &
   Prohibitions`, `## Conventions` (Preferred/Avoid code pairs from this repo), `## Pointers`
   ("auth lives in `src/auth/` — read its README before touching it").
3. **Architecture template** (`lib/commands/install.js` skeleton): replace "Directory Layout" with
   Pointers. Layout/overview content moves to Level-1 docs (`doc-arch`), loaded on demand.
4. **Hard budget**: always-loaded set ≤ 150 lines total. `/analyze` reports the count when done
   and says which file to trim if over.
5. **Review gate**: generated rules carry `<!-- ck:unreviewed -->`. `ck check` reports the count of
   unreviewed rules as a warning; removing the marker (by hand) is the review. Keeps the
   human-curation signal the evidence rewards, without blocking anything.
6. **No automatic rewrite of existing users' standards** (non-destructive principle). Existing
   installs retrofit via the `compress` skill, which gets the same non-inferable filter.
7. Apply to this repo's own `.contextkit/standards/` source templates as the reference example.

### Acceptance criteria
- WHEN `/analyze` generates a standards file, the system SHALL NOT include a directory tree or a dependency inventory.
- WHEN `/analyze` finishes, the system SHALL report total always-loaded lines and SHALL flag any file pushing the total over 150.
- IF a generated rule has no cited source path, THEN the system SHALL NOT write it.
- WHEN `ck check` runs and `ck:unreviewed` markers exist, the system SHALL warn with the count per file.

---

## 4. Corrections → rules loop — 1.10.0

### Current state
`ck note` (`lib/commands/note.js`) appends to `.contextkit/corrections.md` in dated sessions.
`standards-aware` loads the log on demand. Nothing ever turns a repeated correction into a rule,
which is exactly the growth pattern the research recommends ("start empty, add one rule per
recurring stumble, delete rules that don't change behavior").

### Changes
1. **New skill `note`** (`commands/agents/note.md`) — in-session capture: when the user corrects
   the agent, the agent logs it via the same format `ck note` uses. (In-session because
   `docs/token-efficiency.md` already established that CLI commands users must remember don't get run.)
2. **New skill `promote`** (`commands/agents/promote.md`) — reads `corrections.md`, clusters entries
   that recur (≥ 2) or are `HIGH`, proposes one rule each with a target standards file, and
   applies only the ones the user approves. Promoted entries get `[promoted → file]` so they aren't
   re-proposed. Promoted rules are human-approved, so they're written without `ck:unreviewed`.
3. `standards-aware` prompts to run `promote` when the log has ≥ 3 unpromoted recurring entries.

### Acceptance criteria
- WHEN `promote` runs, the system SHALL propose rules only for entries recurring ≥ 2 times or marked HIGH.
- WHEN the user approves a proposed rule, the system SHALL append it to the target file and mark the source entries promoted.
- IF the user rejects a proposal, THEN the system SHALL NOT modify any standards file.

---

## 5. Independent verification in `/squad-auto` — 1.9.0

### Current state
`/squad-spec` dispatches each phase as an isolated Task subagent. `/squad-auto` runs Dev and Test
inline by default (`model_routing: false`) and Review always inline — so Test and Review share the
context in which Dev reasoned about its own code. Community and vendor reports consistently find
this produces "grading your own homework": thin tests, missed edge cases. Separately, the
instruction-adherence study found compliance drops ~5.6% per function generated in a session —
another argument for fresh, small per-phase contexts.

### Changes
1. `commands/squad/squad-auto.md`: on Claude Code, dispatch Dev, Test, Review and Doc as fresh
   subagents by default, reusing the dispatch prompts and "verify the handoff actually changed"
   check from `squad-spec.md` Step 5. Architect stays inline (it only reads the handoff).
2. `model_routing` keeps its meaning — which **model** Dev/Test use — and no longer implies
   isolation. Update the config note in `squad.md` and `squad-go.md`.
3. Codex: inline fallback, same wording as `squad-spec.md`, unless S5 finds a subagent primitive —
   in which case update both files.
4. Consider extracting the shared dispatch block into `commands/squad/_dispatch.md` referenced by
   both, so the two orchestrators can't drift again.

### Acceptance criteria
- WHEN `/squad-auto` runs a task on Claude Code, the system SHALL run the Test and Review phases in subagents that receive only the handoff file path and spec.
- IF a phase subagent returns "done" but the handoff section status is unchanged, THEN the system SHALL treat it as an error and stop that task.

---

## 6. Spec validation & drift — 1.11.0

### Current state
EARS acceptance criteria are prompt-enforced only. Nothing records which stories were built or
checks later that code still satisfies them — the top criticism of Spec Kit ("static specs drift").
Lite-mode detection in `squad-spec.md` string-matches the `> Lite mode —` header line, while
`/spec` records the mode in `PROGRESS.md` — two sources of truth.

### Changes
1. **Deterministic validator** `lib/utils/spec-validator.js` + `ck spec validate [scope]`: every
   story row has an AC block; every AC line matches `^- (WHEN .+, the system SHALL|IF .+, THEN the system SHALL) .+`;
   flags compound criteria (` and ` / ` or ` after SHALL); every story has a squad command. Exit
   code non-zero on failure. **Invoked by the skills themselves** (`/spec` after writing, `/squad-spec`
   before starting), so nobody has to remember to run it.
2. **Structured mode field**: `SPEC.md` header gets `> Mode: lite` / `> Mode: full` as a parsed
   field; `squad-spec.md` reads that instead of matching prose. Validator checks it matches `PROGRESS.md`.
3. **Build traceability**: `squad-spec.md`'s Commit step writes `Status: built @ <sha>` into the
   story's row in SPEC.md (new `Status` column).
4. **`/spec --verify [scope]`**: re-reads each AC line against the current code and marks it
   `verified` / `drifted (file:line)` / `unknown`, writing a `## Verification` section with the date.
5. Stretch — **lite-mode deltas** (OpenSpec's strongest idea for existing codebases): in lite mode,
   each story declares `ADDED` / `MODIFIED` / `REMOVED` against current behavior, and the AC for
   MODIFIED stories states the before and after.

### Acceptance criteria
- WHEN `ck spec validate` finds an AC line not in EARS form, the system SHALL print the scope, story and line, and exit non-zero.
- WHEN a squad-spec story commits, the system SHALL record the commit SHA in that story's SPEC.md row.
- WHEN `/spec --verify` runs, the system SHALL mark every AC line with exactly one of verified / drifted / unknown.

---

## 7. Claude Code plugin + marketplace — 1.12.0

### Current state
`ck install --global` (1.7.0) is a hand-rolled distribution channel: fetches command files from the
release tag, inlines them, writes `~/.claude/skills/`, and tracks versions via frontmatter markers.
Claude Code plugins (skills + hooks + agents, versioned) and private marketplaces (Feb 2026) now do
this natively, including updates.

### Changes
1. `plugins/contextkit/` with `.claude-plugin/plugin.json`; skills rendered from the registry with
   the `global` target (self-contained). Root `.claude-plugin/marketplace.json` so users run
   `/plugin marketplace add nolrm/contextkit` → `/plugin install contextkit`.
2. **No-build-step tension**: the plugin dir is generated output. Options: (a) commit it, with a
   test asserting it matches the registry (fails CI if stale) — keeps "no build step" for users;
   (b) generate in the publish workflow. Recommend (a).
3. `ck install --global` stays for Codex/Cursor (`~/.agents/skills/`) and for non-plugin users,
   and prints the plugin install line when Claude Code is detected.
4. Consider bundling the pre-push/PostToolUse hooks into the plugin (plugins support `hooks/hooks.json`).

### Acceptance criteria
- WHEN the registry changes and the plugin dir isn't regenerated, the test suite SHALL fail.
- WHEN a user installs the plugin, `/squad` and `/spec` SHALL work in a repo with no `.contextkit/` directory.

---

## 8. Sequencing

| Release | Phases | Why this order | Status |
|---|---|---|---|
| — | 0 (spikes) | Cheap; decides Phase 1 urgency and Phase 2 scope | **Done** — see §9 |
| 1.9.0 | 1, 2, 5 | 1 & 2 fix real bugs (stale bridge paths, AGENTS.md overwrite) and 2 reuses 1's registry pattern; 5 is prompt-only and independent | **Shipped 2026-09-28** — see §9.1 |
| 1.10.0 | 3, 4 | The core positioning change; 4 gives 3's small files a growth path | Not started |
| 1.11.0 | 6 | Builds on 1.8.0 lite mode | Not started |
| 1.12.0 | 7 | Needs the registry (1); largest distribution change | Not started |

### 9.1 What shipped in 1.9.0 vs. what the plan originally scoped

- Phase 1 shipped as **additive** `.agents/skills/` output (Codex + Cursor) rather than a migration off `.codex/skills/`/`.cursor/prompts/` — S1 showed the existing Codex path already works, so there was no bug to fix by removing it, only portability to gain by adding the new path. Cursor's `.cursor/prompts/` was *expanded* to full 22-skill parity (it was stale at 10), not removed.
- Cursor's specific behavior (S2) was never independently verified — no Cursor CLI was available locally. Treat that half of Phase 1 as lower-confidence than the rest.
- Phase 5 additionally updated `commands/squad/squad.md`'s `model_routing` documentation and the docs site's `contextkit-docs/app/docs/squad/page.tsx` Configuration section, both of which described the old inline-by-default behavior.
- Phase 2 turned out to be 6 separate instances of the same stale-path bug (`BaseIntegration.getStandardsBlock()` plus a hand-duplicated copy in `ContinueIntegration`), not the 1 the research pass had spotted.

Every release: CHANGELOG entry, docs site page updates (`contextkit-docs/`), README, numbered test
descriptions, `ck update` migrations that are non-destructive and marker-gated.

---

## 9. Spike results

| # | Result | Date |
|---|---|---|
| S1 | **RESOLVED, empirically.** Installed Codex CLI 0.155.1 (`codex exec`) sees skills from both `.codex/skills/` and `.agents/skills/` in the same repo — confirmed via a scratch repo with a marker skill in each. `.codex/skills/` is not broken today; moving to `.agents/skills/` is a safe, additive migration (portable to other tools), not an urgent fix. | 2026-09-28 |
| S2 | **Unresolved — no Cursor CLI available locally to test.** Proceeding on docs only (Cursor scans `.agents/`, `.cursor/`, `.claude/`, `.codex/` skill dirs). Lower confidence than S1/S3/S5 — treat Phase 1's Cursor-specific changes as provisional pending a real check. | 2026-09-28 |
| S3 | **RESOLVED, empirically.** Installed Claude Code 2.1.283 (`claude -p`), tested the same scratch repo: it found and would invoke only `.claude/skills/repo-claude-marker`. It located the `.agents/skills/` and `.codex/skills/` marker files via direct filesystem read when asked, but explicitly did not surface them in its loaded skill list. Confirms Claude Code does **not** scan `.agents/skills/` — `.claude/skills/` stays required. | 2026-09-28 |
| S4 | **Unresolved — no Gemini CLI / VS Code Copilot available locally to test.** Proceeding conservatively: keep `GEMINI.md` / `.github/copilot-instructions.md` as thin files rather than eliminating them, per Phase 2's stated fallback. | 2026-09-28 |
| S5 | **RESOLVED — reverses the plan's assumption.** Codex CLI 0.155.1 has `multi_agent` as a stable feature flag; per current Codex docs a session can spawn up to 8 parallel subagents, each with its own context window/sandbox (`agents.max_threads`, `agents.max_depth` in config). `squad-spec.md`'s "no equivalent isolated-subagent primitive... known gap" note is now stale. Phase 5 updates both `squad-auto.md` and `squad-spec.md` to give Codex a real (if differently-shaped) subagent dispatch path instead of the inline-fallback framing. Exact in-session tool name for spawning was not hands-on confirmed — phrase the instruction generically ("dispatch an isolated subagent using Codex's multi-agent capability") rather than naming a specific tool. | 2026-09-28 |

---

## 10. Out of scope

- MCP server (`ck serve`) — stays on the roadmap separately; unrelated to these changes.
- Measuring rule effectiveness automatically (e.g. evals per rule) — valuable but needs its own design.
- Per-project `ck uninstall`.

## 11. Evidence

- ETH Zurich, *Evaluating AGENTS.md* — https://arxiv.org/pdf/2602.11988 (generated files −0.5–2% success, +20% cost; human-written +4%; overviews don't speed file discovery)
- *Instruction Adherence in Coding Agent Configuration Files* — https://arxiv.org/abs/2605.10039 (file structure has no detectable effect; −5.6% compliance odds per function generated)
- Upsun, *your AGENTS.md is probably too long* — https://developer.upsun.com/posts/ai/agents-md-less-is-more
- Codex skills docs (`.agents/skills/` locations) — https://learn.chatgpt.com/docs/build-skills
- Claude Code skills docs (dirs, frontmatter) — https://code.claude.com/docs/en/skills
- Claude Code changelog (AGENTS.md fallback 2.1.277, `/doctor prompt-audit` 2.1.283) — https://code.claude.com/docs/en/changelog
- Cursor skills docs (scans `.agents/`, `.cursor/`, `.claude/`, `.codex/`) — https://cursor.com/docs/skills
- Claude Code plugin marketplaces — https://code.claude.com/docs/en/plugin-marketplaces
- Spec tools comparison (Spec Kit / Kiro / OpenSpec) — https://levelop.dev/blog/spec-driven-development-tools-compared
- Qodo, single- vs multi-agent review — https://www.qodo.ai/blog/single-agent-vs-multi-agent-code-review/
