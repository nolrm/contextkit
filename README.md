# ContextKit

> Context Engineering for AI Development

Give your AI assistants (Cursor, Claude, Copilot, Codex, OpenCode, Gemini, Aider, Continue, Windsurf) structured context through markdown files. ContextKit creates a knowledge base that ensures AI generates code matching your exact patterns, style, and architecture—no more hallucinated code or mismatched conventions.

ContextKit is a CLI tool that provides **context-engineering** capabilities by creating `.contextkit/` directories with project standards, guidelines, and patterns that AI assistants read automatically.

**[Read the full documentation](https://contextkit-docs.vercel.app/)** · **[How context works](https://contextkit-docs.vercel.app/docs/how-context-works)**

## Why ContextKit?

**The problem:** LLMs are great at syntax, not at *your* conventions. Generic AI output requires manual fixes for style, structure, and architecture.

**The solution:** ContextKit provides your AI with:
- **Glossary** of project terminology and domain-specific terms (e.g., your entity, feature, and module names)
- **Standards** for code style, testing patterns, and architecture
- **Templates** with canonical component shapes

Update `.md` files as your project evolves; the AI follows.

## Multi-Platform Support

Works with: **Cursor** • **Claude Code** • **GitHub Copilot** • **Codex CLI** • **OpenCode** • **Gemini CLI** • **Aider** • **Continue** • **Windsurf**

Each platform gets auto-loaded bridge files (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.windsurfrules`, etc.) so your AI tools read project standards automatically. Claude Code uses `@` imports in CLAUDE.md to load standards content directly into context — no extra token cost from manual file reads.

---

## Quick Start (60s)

**1. Install the CLI**
```bash
npm i -g @nolrm/contextkit
```

**2. Set up your project**
```bash
cd your-project
contextkit install
```
Creates `.contextkit/` with skeleton standards files, a self-describing `README.md`, and an attribution block in `config.yml` so any developer who encounters the folder knows what manages it.

**3. Generate your standards**

Run `/analyze` in your AI tool — it scans your codebase and fills the skeleton files with your project's conventions.

Done. Your AI tools now have project-specific context.

---

## Multi-Team Workflow

Perfect for teams where members use different AI tools:

```bash
# First team member - sets up the project with their tool
contextkit install claude   # or: contextkit install (interactive picker)

# Each additional team member adds their platform
ck claude      # creates CLAUDE.md + .claude/rules/
ck cursor      # creates .cursor/rules/ (scoped .mdc files)
ck copilot     # creates .github/copilot-instructions.md
ck codex       # creates AGENTS.md
ck opencode    # creates AGENTS.md
ck gemini      # creates GEMINI.md + .gemini/settings.json
ck aider       # creates CONVENTIONS.md + .aider/rules.md
ck continue    # creates .continue/rules/ + config.yaml
ck windsurf    # creates .windsurfrules + .windsurf/rules/
ck vscode      # alias for copilot
```

Each platform generates bridge files that the AI tool auto-reads. If a bridge file already exists (e.g., you have a custom `CLAUDE.md`), ContextKit appends its section below your content instead of overwriting. Share your `.contextkit/standards/*.md` files with the team and everyone gets the same context.

---

## See the difference (before → after)

**Prompt**
```
"Add checkout flow for customer"
```

**What the AI does with ContextKit**
- Reads `glossary.md` → `checkout` = checkout process; `customer` = customer account
- Applies `code-style.md` → strict TS, functional components
- Follows `testing.md` → numbered test cases

**Result (diff)**
```diff
- const Checkout = () => <button>Buy</button>
+ export function CheckoutFlow({ customer }: { customer: string }) {
+   // Uses customer from glossary context
+   return <div>Checkout for {customer}</div>
+ }
```

---

## Use it in your tool

**Cursor** — rules auto-load from `.cursor/rules/`, slash commands in `.cursor/prompts/`
```
/analyze    # scan codebase and generate standards
/review     # code review with checklist
/fix        # diagnose and fix bugs
```

**Claude Code** — `CLAUDE.md` uses `@` imports to auto-load all standards into context every session (no manual reads needed, saves tokens). Slash commands in `.claude/commands/`.
```bash
/analyze    # scan codebase and generate standards
/review     # code review with checklist
claude "create checkout flow for customer"
```

**GitHub Copilot** — reads `.github/copilot-instructions.md` automatically
```
@.contextkit Create checkout flow for customer
```

**Codex CLI** — reads `AGENTS.md` automatically
```bash
codex "create checkout flow for customer"
```

**OpenCode** — reads `AGENTS.md` automatically
```bash
opencode "create checkout flow for customer"
```

---

## Slash Commands

ContextKit installs reusable slash commands for supported platforms:

| Command | What it does |
|---------|-------------|
| `/analyze` | Scan codebase and generate standards content |
| `/review` | Code review with checklist |
| `/fix` | Diagnose and fix bugs |
| `/refactor` | Refactor code with safety checks |
| `/test` | Generate comprehensive tests |
| `/doc` | Add documentation |
| `/doc-arch` | Generate architecture docs (`docs/architecture.md`) — stack-aware (Level 1) |
| `/doc-feature` | Generate feature-level docs (`docs/features/<name>.md`) — stack-aware (Level 2) |
| `/doc-component` | Generate component-level docs colocated with the target file — stack-aware (Level 3) |
| `/spec` | Write a component spec (MD-first) before any code is created |
| `/squad` | Kick off a squad task — one task or many (auto-detects batch mode). Pushes back with clarifying questions if the task is vague. |
| `/squad-architect` | Design the technical plan from the PO spec |
| `/squad-dev` | Implement code following the architect plan |
| `/squad-test` | Write and run tests against acceptance criteria |
| `/squad-review` | Review the full pipeline and give a verdict |
| `/squad-doc` | Create companion `.md` files for new/modified code after review passes |
| `/squad-auto` | Auto-run the full pipeline after kickoff (recommended, sequential) |
| `/squad-auto-parallel` | Auto-run the pipeline in parallel using Claude Code agents (Claude Code only) |
| `/ck` | Health check — verify setup, standards, and integrations |

**Claude Code** — available as `/analyze`, `/review`, etc. in `.claude/commands/`
**Cursor** — available as slash commands in Chat via `.cursor/prompts/`

Both platforms delegate to the universal command files in `.contextkit/commands/`, so you maintain one set of workflows.

---

## Squad Workflow

The squad workflow turns a single AI session into a structured multi-role pipeline. Each role has its own slash command that reads and writes to a shared handoff file (`.contextkit/squad/handoff.md`), simulating a team of specialists.

### Pipeline Roles

| Step | Role | Command | What it does |
|------|------|---------|-------------|
| 1 | Product Owner | `/squad` | Writes a user story, acceptance criteria, edge cases, and scope. If the task is ambiguous, asks up to 5 clarifying questions before writing the spec. Optionally captures screenshots/images as visual assets. |
| 2 | Architect | `/squad-architect` | Designs the technical approach, files to change, and implementation steps |
| 3 | Developer | `/squad-dev` | Implements the code following the architect's plan |
| 4 | Tester | `/squad-test` | Writes and runs tests against the PO's acceptance criteria |
| 5 | Reviewer | `/squad-review` | Reviews everything and gives a PASS or NEEDS-WORK verdict |
| 6 | Doc Writer | `/squad-doc` | Creates companion `.md` files for every new/modified code file |

### Single-Task Flow

```bash
/squad "add dark mode support"   # PO writes the spec

/squad-auto                      # Auto-runs architect → dev → test → review → doc (recommended)
# — or step through manually —
/squad-architect                 # Architect designs the plan
/squad-dev                       # Dev implements the code
/squad-test                      # Tester writes and runs tests
/squad-review                    # Reviewer gives the verdict
/squad-doc                       # Doc Writer creates companion .md files
```

### Batch Flow

Pass multiple tasks to `/squad` and it automatically runs in batch mode:

```bash
/squad "add dark mode" "fix login bug" "refactor checkout"
# PO writes specs for all three tasks

/squad-auto
# Runs Architect → Dev → Test → Review → Doc for each task sequentially
```

**Parallel mode (Claude Code only):** Use `/squad-auto-parallel` instead of `/squad-auto` to spawn parallel subagents — one per task per phase — so all tasks progress simultaneously rather than one at a time.

```bash
/squad "add dark mode" "fix login bug" "refactor checkout"

/squad-auto-parallel
# Phase 1: architect agents for all 3 tasks run in parallel
# Phase 2: dev→test→review pipeline runs in parallel per task; Phase 3: doc runs sequentially
```

**Model routing (Claude Code only):** Set `model_routing: true` in `.contextkit/squad/config.md` to have `/squad-auto` automatically use Claude Haiku for Dev and Test phases. Architect and Review always run on your primary model. Saves ~35% tokens with no quality loss — the standards files and Review gate maintain quality.

```markdown
# .contextkit/squad/config.md
checkpoint: po
model_routing: true   # dev + test → Haiku, architect + review → primary model
```

### Feedback Loop

Any downstream role can raise questions for an upstream role. When this happens, the pipeline pauses and directs you to the right command:

```
Reviewer has questions for Dev → run /squad-dev to clarify
Tester has questions for Architect → run /squad-architect to clarify
Architect has questions for PO → run /squad to clarify
```

After clarifications are added, re-run the asking role's command to continue. This prevents misunderstandings from compounding through the pipeline.

### Visual Assets (Optional)

If you have a screenshot, mockup, or design image relevant to the task, paste or attach it when running `/squad`. The PO agent will save it to `.contextkit/squad/assets/` and reference the path in the handoff. Architect and Dev agents automatically read any listed assets when they pick up the handoff.

---

## Git Hooks & Quality Gates

ContextKit can optionally install Git hooks during `ck install`. Uses `git config core.hooksPath` to point Git at `.contextkit/hooks/` — no external dependencies like Husky required. Works in any git repo, not just Node.js projects.

For **Node.js projects**, a `prepare` script is automatically added to `package.json` so hooks activate for all developers after `npm install` — no need for everyone to run `ck install`.

| Hook | What it does |
|------|-------------|
| **pre-push** | **Quality Gates** — auto-detects your project framework and runs the appropriate checks |
| **commit-msg** | Enforces [Conventional Commits](https://www.conventionalcommits.org/) format |

### Framework-Aware Quality Gates

The pre-push hook detects your project type and runs the right quality checks automatically. All gates are skipped silently when tools aren't installed.

| Framework | Checks |
|-----------|--------|
| **Node.js** | TypeScript, ESLint, Prettier, build, test, e2e — each only runs when present in `package.json`; auto-detects npm/yarn/pnpm/bun |
| **Python** | ruff/flake8, mypy, black/ruff format, pytest |
| **Rust** | cargo check, clippy, cargo test |
| **Go** | go vet, golangci-lint, go test |
| **PHP** | PHPStan, PHPUnit |
| **Ruby** | RuboCop, RSpec/rake test |
| **Java** | Maven verify / Gradle check |
| **Kotlin** | ktlint, Gradle test |
| **Swift** | SwiftLint, swift test |
| **.NET / C#** | dotnet build, dotnet test |

### Commit Message Format

When the `commit-msg` hook is enabled, all commits must follow this format:

```
<type>(<scope>): <description>
```

**Types:** `feat`, `fix`, `improve`, `docs`, `refactor`, `test`, `chore`

**Examples:**
```bash
git commit -m "feat(auth): add login page"
git commit -m "fix: resolve null pointer in checkout"
git commit -m "docs: update API reference"
git commit -m "test(cart): add edge case coverage"
```

Hooks are optional and can be skipped with `ck install --no-hooks`.

---

## CI Squad — GitHub Issues → PR

ContextKit can automatically turn GitHub issues into pull requests — no local development required.

**How it works:**

1. Label any issue `squad-ready`
2. GitHub Actions runs the full squad pipeline (architect → dev → test → review) using Claude
3. A draft PR is opened, linked to the issue

**Setup:**

```bash
ck install   # answer "yes" to the CI squad prompt
```

Then add your Anthropic API key as a repository secret:

> **Settings → Secrets and variables → Actions → New repository secret**
> Name: `ANTHROPIC_API_KEY`

**Tips:**

- Write issues with clear acceptance criteria for the best results
- If the issue is too vague, the workflow posts a comment asking for clarification instead of generating a bad PR
- PRs always open as **draft** — you review and merge manually
- Re-apply the `squad-ready` label after answering a clarification comment to re-trigger the pipeline

---

## Key Features

- 🧠 **Context Engineering** - Structured MD files your AI reads automatically
- 🔍 **Smart Analysis** - AI generates standards content based on your codebase
- 🌍 **Project Agnostic** - Works with React, Vue, Node.js, PHP, Python, Rust, monorepos—any project type
- 🤖 **Multi-Platform** - Works with Cursor, Claude Code, Copilot, Codex, OpenCode, Gemini, Aider, Continue, Windsurf
- 🛡️ **Safe Install** - Backs up existing files with rollback support
- ⚡ **Zero Config** - Auto-detects project type and package manager
- ✅ **Policy Enforcement** - Configurable validation with `ck check`
- 📝 **Corrections Tracking** - Track AI performance issues with corrections log

## Commands

```bash
# Installation & Setup
ck install            # set up .contextkit + pick AI tool interactively
ck install claude     # set up .contextkit + Claude, or add Claude to an existing install
ck claude      # add Claude Code integration (CLAUDE.md + rules)
ck cursor      # add Cursor integration (scoped .mdc rules)
ck copilot     # add GitHub Copilot integration
ck codex       # add Codex CLI integration (AGENTS.md)
ck opencode    # add OpenCode integration (AGENTS.md)
ck gemini      # add Gemini CLI integration (GEMINI.md)
ck aider       # add Aider integration (CONVENTIONS.md)
ck continue    # add Continue integration
ck windsurf    # add Windsurf integration (.windsurfrules)
ck vscode      # alias for copilot

# Analysis & Updates
/analyze       # customize standards to your project (slash command in your AI tool)
ck update      # pull latest commands/hooks — preserves your analyzed standards
               # updates are also flagged automatically after each ck command (24h cache)
ck status      # check install & integrations

# Validation & Compliance
ck check       # validate installation & policy compliance
ck check --strict  # treat warnings as errors

# Corrections Logging
ck note "message"  # add note to corrections log
ck note "AI issue" --category "AI Behavior" --priority HIGH

# Squad — multi-role AI pipeline (slash commands in your AI tool)
/squad "add dark mode"   # PO writes spec
/squad-auto              # runs architect → dev → test → review → doc hands-free
/squad-reset             # clear stuck or mixed squad state

```

## Links

• 🐛 [Issues](https://github.com/nolrm/contextkit/issues)
• 💬 [Discussions](https://github.com/nolrm/contextkit/discussions)

---

## License

MIT

## Author

**Marlon Maniti**  
GitHub: [@nolrm](https://github.com/nolrm)
