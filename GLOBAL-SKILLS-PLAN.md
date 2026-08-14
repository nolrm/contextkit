# Global Skills Install — Plan

> Problem: `ck install` writes skills per-project (`<repo>/.claude/skills/`). Users running
> ContextKit across many repos (e.g. `ankara.com`, `travelpedia`, ...) either duplicate skill
> files into every repo, or can't use them at all in repos where they skipped a full install.
> Goal: install a subset of skills **once**, usable from any project, with a single update path.

---

## 1. Scope

### In scope — skills eligible for global install (12)

| Skill | Source command |
|---|---|
| `squad` | `commands/squad/squad.md` |
| `squad-architect` | `commands/squad/squad-architect.md` |
| `squad-dev` | `commands/squad/squad-dev.md` |
| `squad-test` | `commands/squad/squad-test.md` |
| `squad-review` | `commands/squad/squad-review.md` |
| `squad-auto` | `commands/squad/squad-auto.md` |
| `squad-reset` | `commands/squad/squad-reset.md` |
| `squad-doc` | `commands/squad/squad-doc.md` |
| `squad-go` | `commands/squad/squad-go.md` |
| `squad-spec` | `commands/squad/squad-spec.md` |
| `spec` | `commands/spec/spec.md` |
| `spec-component` | `commands/dev/spec-component.md` |

Other skills (`analyze`, `review`, `refactor`, `test`, `doc`, `ck`, `compress`, `doc-*`,
`agent-push-checklist`, `context-budget`, `standards-aware`, `product-context`) stay
project-only for now — they lean on `.contextkit/standards/` for project-specific content,
which doesn't have a sane global equivalent. Can be revisited later per-skill.

### Explicitly out of scope

- CLAUDE.md edits, `.contextkit/standards/`, `.contextkit/product/`, git hooks — all stay
  per-project, untouched by global install.
- A `~/.contextkit/` mirror folder — **rejected**. See §2.

---

## 2. Key design decision: self-contained files, no `~/.contextkit/` folder

Per-project install today splits each skill into two files:
- `.claude/skills/<name>/SKILL.md` — thin wrapper: frontmatter + "Read `.contextkit/commands/x.md`
  and execute it."
- `.contextkit/commands/x.md` — the actual workflow content (downloaded from
  `raw.githubusercontent.com/nolrm/contextkit/main/commands/...` at install time).

For global install, the user wants **only** `~/.claude/skills/` populated — no `~/.contextkit/`
tree to manage. So generation for global mode must **inline the full command content into the
SKILL.md itself**, not point at a second location:

```
~/.claude/skills/squad/SKILL.md
---
description: ...
argument-hint: ...
allowed-tools: ...
effort: normal
---
<full body of commands/squad/squad.md, verbatim>
```

Consequence: global skills are single files, fully self-contained, immediately usable from
any project directory (Claude Code always discovers user-level `~/.claude/skills/`).

### Update model

No separate state folder. `ck update --global` **unconditionally regenerates and overwrites**
every installed global skill file from the current `ck` package's source content — same
"generated file, don't hand-edit" contract that project-level generated files already have
(`BaseIntegration.generatedFiles`).

### Ownership marker (enables update-diffing, `check`, and uninstall)

Each generated global skill gets two extra YAML frontmatter fields — no new file, just two
lines added to the frontmatter block every SKILL.md already has:

```yaml
---
description: ...
argument-hint: ...
allowed-tools: ...
effort: normal
contextkit-managed: true
contextkit-version: 1.6.0
---
```

This is the single piece of state the whole global feature needs:
- **`ck check --global`** diffs `contextkit-version` against the installed `ck` package
  version to report drift, no separate state file required.
- **`ck uninstall --global`** only ever deletes files carrying `contextkit-managed: true` —
  guarantees it can never touch a same-named skill the user created themselves.
- **`ck update --global`** can skip files whose version already matches (optimization, not
  required for correctness — always-overwrite is still safe/idempotent either way).

### Precedence

Claude Code resolves project-level `.claude/skills/<name>/` over user-level
`~/.claude/skills/<name>/` when both exist (already-documented directory-scoped-skill
behavior). So:
- `travelpedia` (already has a full per-project install) — unaffected, its local copies win.
- `ankara.com` (no per-project install) — falls back to the global copies automatically.

No migration step needed; the two coexist safely.

---

## 3. Content adaptations required

Two of the 12 skills have hard dependencies on `.contextkit/` existing in the *current*
project, which don't make sense for a skill that's supposed to work in any repo with zero
local setup. These need source-content changes (only used when generating the **global**
variant — project-level generation is unaffected):

| Skill | Current dependency | Change for global variant |
|---|---|---|
| `spec` | `commands/spec/spec.md` step 1: "Verify `.contextkit/` exists... if not, tell the user to run `ck install` first and stop." | Drop the hard-stop guard. `/spec`'s own output (`.contextkit/spec/`) still gets created in whichever project it's run from — that's run-state, not a dependency. |
| `spec-component` | `commands/dev/spec-component.md`: reads `.contextkit/templates/component-spec.md` as the scaffold template | Inline the template's content directly into the generated global SKILL.md so there's no external file reference. |

`squad*` family already has a self-contained guard (`squad.md` Step 0 offers "squad only" —
creates just `.contextkit/squad/` in the current project if not already set up) — no content
changes needed there.

**Open question:** do we fork these two command files (maintain a `-global` variant
permanently), or generate the adapted text at build time from the single source file via a
small transform (strip the guard block, inline the template)? Leaning toward a build-time
transform to avoid maintaining parallel copies — needs a decision before implementation.

---

## 4. CLI surface

New flag on existing commands, plus one genuinely new command — keeps discovery obvious:

```bash
ck install --global            # install the 12 global-eligible skills to ~/.claude/skills/
ck install --global squad      # install just the squad family
ck install --global spec       # install spec + spec-component
ck update --global             # regenerate/overwrite all currently-installed global skills
ck check --global               # report installed global skills + version drift vs current ck
ck uninstall --global           # checklist of contextkit-managed global skills, remove selected
ck uninstall --global squad     # remove just the squad family
ck uninstall --global --all     # remove every contextkit-managed global skill
```

`ck install --global` prompts (unless `--non-interactive`) with a checklist of the 12 skills,
defaulting to all selected — mirrors the existing platform-select UX in `ck install`.

`uninstall` is net-new to ContextKit — there is currently no uninstall path at all, even for
per-project installs (confirmed: no `uninstall`/`remove` command exists in `bin/contextkit.js`
today). Scoping it to `--global` only for now keeps it small; a per-project `ck uninstall`
is a separate, later effort (removing standards/CLAUDE.md edits/hooks safely is a bigger
problem than removing a self-contained skill file).

**Safety rule:** `ck uninstall --global` (and any bulk operation) only ever touches files whose
frontmatter has `contextkit-managed: true`. A file at `~/.claude/skills/spec/SKILL.md` without
that marker is treated as the user's own and is never listed or deleted.

---

## 5. Implementation tasks

- [ ] `lib/utils/global-skills.js` (new) — the actual writer:
  - resolves `~/.claude/skills/` as target dir (respect `os.homedir()`)
  - for each selected skill: fetch/read source command markdown (reuse
    `lib/utils/download.js` for the published-package path, or direct `fs.readFile` from
    `commands/` when running from this repo in dev), apply the global-variant transform for
    `spec`/`spec-component`, prepend the existing frontmatter block (already defined per-skill
    in `claude-integration.js`), write the merged file
  - idempotent: always overwrites, no diffing
- [ ] `lib/commands/install.js` — branch on `options.global`: skip the whole
  standards/CLAUDE.md/hooks/integration-select flow, call `global-skills.js` instead
- [ ] `lib/commands/update.js` — branch on `options.global`: call `global-skills.js` in
  overwrite mode, skip the per-project migration runner
- [ ] `lib/commands/check.js` — extend to report on `~/.claude/skills/` contents when
  `--global` passed: list installed contextkit-managed skills and flag any whose
  `contextkit-version` frontmatter field trails the currently installed `ck` package version
- [ ] `lib/commands/uninstall.js` (new) — `--global` mode: scan `~/.claude/skills/*/SKILL.md`
  for `contextkit-managed: true` frontmatter, prompt with a checklist (unless a name/`--all`
  filter narrows it), `fs.remove` the selected skill directories
- [ ] `bin/contextkit.js` — add `--global` option to `install`/`update`/`check`; register the
  new `uninstall [platform]` command with its own `--global` option; add optional
  positional/`--skill` filter for scoping install/uninstall to a subset
- [ ] Decide + implement the `spec` guard removal / `spec-component` template inlining
  transform (see §3 open question)
- [ ] `__tests__/` — new `global-skills.test.js` mirroring existing command test structure;
  cover: writes expected files, correct frontmatter (incl. `contextkit-managed`/
  `contextkit-version`), spec guard stripped, spec-component template inlined, update
  overwrites cleanly, doesn't touch project-level `.claude/` or `.contextkit/`; uninstall only
  removes marked files and leaves unmarked same-named skills untouched
- [ ] Docs: README section + `docs/` note on global vs per-project skills, precedence
  behavior, and the "generated file, don't hand-edit" warning

---

## 6. Open questions to resolve before coding

1. **Transform strategy for §3** — permanent forked `-global.md` source files vs. a build-time
   strip/inline transform on the existing single source. (Leaning transform.)
2. **Scoping flag shape** — `ck install --global squad` (positional filter) vs.
   `ck install --global --only squad,spec` (explicit flag)? Should match existing `install
   [platform]` positional-arg convention for consistency.
3. ~~`ck check --global` without a state file~~ — resolved: the `contextkit-managed`/
   `contextkit-version` frontmatter fields (§2) double as both the uninstall-ownership marker
   and the drift signal for `check`. No separate state file needed.
4. Should `ck install --global` also offer to **remove** the now-redundant per-project copies
   in repos that already have them (e.g. offer cleanup in `travelpedia`), or leave that
   entirely manual?
5. Should `ck uninstall --global` (no filter, no `--all`) with an empty checklist selection
   just no-op, or is a bare `ck uninstall --global` with zero contextkit-managed skills found
   worth a distinct "nothing to remove" message vs. silently doing nothing?

---

## 7. Rollout (once built)

```bash
# once, anywhere
ck install --global

# later, after upgrading the ck package
npm update -g @nolrm/contextkit
ck update --global
```

No per-repo action needed. `ankara.com` gets `/squad`, `/spec`, etc. immediately with zero
files added to that repo — nothing to commit, nothing to gitignore.
