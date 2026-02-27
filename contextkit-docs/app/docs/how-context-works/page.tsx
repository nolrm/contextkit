import { AlertTriangle } from "lucide-react"

export default function HowContextWorksPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">How Context Works</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ContextKit uses a two-layer loading system to give AI assistants the right context at the right time —
          without flooding every session with content that isn't relevant.
        </p>
      </div>

      {/* Layer Architecture */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The Two-Layer Architecture</h2>
        <p className="text-muted-foreground leading-relaxed">
          Every session goes through two layers before context reaches the AI:
        </p>

        <div className="rounded-lg border bg-muted/50 p-4 mt-3">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto">{`Session starts
    │
    ▼
Layer 1 — Bridge file (always loaded)
    CLAUDE.md / CONVENTIONS.md / GEMINI.md / etc.
    └── @imports expand all linked standards files into context
    │
    ▼
Layer 2 — Scoped rules (conditionally loaded)
    .claude/rules/contextkit-testing.md  →  only when editing *.test.*
    .claude/rules/contextkit-code-style.md  →  only when editing src/**
    │
    ▼
AI receives context and generates code`}</pre>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">Layer 1 — Bridge File</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Loaded every session, no exceptions. Acts as the index for all your standards.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> — Claude Code
              </li>
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">CONVENTIONS.md</code> — Aider
              </li>
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">GEMINI.md</code> — Gemini CLI
              </li>
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">.github/copilot-instructions.md</code> — Copilot
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">Layer 2 — Scoped Rules</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Loaded only when the current file matches a glob pattern. Enforced at the platform level.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">alwaysApply: true</code> — loads every session
              </li>
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">globs: ["**/*.test.*"]</code> — test files only
              </li>
              <li>
                <code className="rounded bg-muted px-1 font-mono text-xs">globs: ["src/**"]</code> — source files only
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Always vs Conditionally loaded */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Always Loaded vs. Conditionally Loaded</h2>
        <p className="text-muted-foreground leading-relaxed">
          Not all context files load every session. Here's what fires when:
        </p>

        <div className="rounded-lg border overflow-hidden mt-3">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold">File</th>
                <th className="text-left p-3 font-semibold">Trigger</th>
                <th className="text-left p-3 font-semibold">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="p-3">
                  <code className="font-mono text-xs">CLAUDE.md</code>
                </td>
                <td className="p-3 text-muted-foreground">Every session</td>
                <td className="p-3 text-muted-foreground">Platform auto-loads bridge files</td>
              </tr>
              <tr>
                <td className="p-3">
                  <code className="font-mono text-xs">contextkit-standards.md</code>
                </td>
                <td className="p-3 text-muted-foreground">Every session</td>
                <td className="p-3 text-muted-foreground">
                  <code className="font-mono text-xs">alwaysApply: true</code>
                </td>
              </tr>
              <tr>
                <td className="p-3">
                  <code className="font-mono text-xs">contextkit-testing.md</code>
                </td>
                <td className="p-3 text-muted-foreground">
                  Editing <code className="font-mono text-xs">*.test.*</code>, <code className="font-mono text-xs">__tests__/**</code>
                </td>
                <td className="p-3 text-muted-foreground">Glob-scoped rule</td>
              </tr>
              <tr>
                <td className="p-3">
                  <code className="font-mono text-xs">contextkit-code-style.md</code>
                </td>
                <td className="p-3 text-muted-foreground">
                  Editing <code className="font-mono text-xs">src/**</code>, <code className="font-mono text-xs">lib/**</code>, <code className="font-mono text-xs">app/**</code>
                </td>
                <td className="p-3 text-muted-foreground">Glob-scoped rule</td>
              </tr>
              <tr>
                <td className="p-3">
                  <code className="font-mono text-xs">mission-lite.md</code>
                </td>
                <td className="p-3 text-muted-foreground">Every session (via @import)</td>
                <td className="p-3 text-muted-foreground">Included in bridge file imports</td>
              </tr>
              <tr>
                <td className="p-3">
                  <code className="font-mono text-xs">css-style.md</code>, <code className="font-mono text-xs">typescript-style.md</code>
                </td>
                <td className="p-3 text-muted-foreground">When referenced in code-style.md</td>
                <td className="p-3 text-muted-foreground">Granular sub-files, included as needed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Token optimization */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Token Optimization Strategies</h2>
        <p className="text-muted-foreground leading-relaxed">
          ContextKit is designed to keep the base context footprint small. Here's how:
        </p>

        <div className="space-y-3 mt-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">1. Skeleton Pattern</h3>
            <p className="text-sm text-muted-foreground">
              Standards files ship as empty templates. Until you run{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">ck analyze</code>, they contribute almost
              nothing to the token count. Content is only generated from your real codebase when you're ready.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">2. Mission-Lite</h3>
            <p className="text-sm text-muted-foreground">
              Two versions of your product mission exist:{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">mission.md</code> (full, for humans) and{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">mission-lite.md</code> (condensed, for AI
              context). The bridge file always imports the lite version, reducing product context cost by 50–70%.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">3. Granular Code Style Breakup</h3>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">code-style.md</code> can be split into
              language-specific sub-files (
              <code className="rounded bg-muted px-1 font-mono text-xs">css-style.md</code>,{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">typescript-style.md</code>, etc.). Reference
              only the sub-files relevant to the current task instead of loading all style rules at once.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-1">
              4. <code className="font-mono text-sm">{"<!-- when:X -->"}</code> Tags
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Sections inside standards files can be tagged with conditional hints:
            </p>
            <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">{`<!-- when:typescript -->
### TypeScript Conventions
Use strict mode, prefer interfaces over types...

<!-- when:css -->
### CSS Conventions
Use CSS modules, BEM naming...`}</pre>
            <p className="text-sm text-muted-foreground mt-2">
              The AI skips sections whose tag doesn't match the current context (e.g., skips CSS rules when editing a
              TypeScript file).
            </p>
          </div>
        </div>
      </div>

      {/* Token budget */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Typical Token Budget</h2>
        <p className="text-muted-foreground leading-relaxed">
          Here's what the actual context footprint looks like before and after running{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck analyze</code>:
        </p>

        <div className="grid gap-4 md:grid-cols-2 mt-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold mb-3">Before <code className="font-mono text-xs">ck analyze</code></p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bridge file (CLAUDE.md)</span>
                <span className="font-mono text-xs">~1.5 KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standards files (9 files, skeleton)</span>
                <span className="font-mono text-xs">~2–3 KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">.claude/rules/ files</span>
                <span className="font-mono text-xs">~1 KB</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total base context</span>
                <span className="font-mono text-xs">~5–6 KB</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold mb-3">After <code className="font-mono text-xs">ck analyze</code></p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bridge file (CLAUDE.md)</span>
                <span className="font-mono text-xs">~1.5 KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standards files (populated)</span>
                <span className="font-mono text-xs">~8–15 KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product context (mission-lite)</span>
                <span className="font-mono text-xs">~1–2 KB</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total base context</span>
                <span className="font-mono text-xs">~12–20 KB</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Actual size depends on how detailed your standards are.
            </p>
          </div>
        </div>
      </div>

      {/* Honest callout */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">What's Enforced vs. Convention-Based</h2>
        <p className="text-muted-foreground leading-relaxed">
          Not all loading mechanisms have the same level of enforcement. It's important to understand the difference:
        </p>

        <div className="grid gap-4 md:grid-cols-2 mt-3">
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Hard Enforcement</p>
            <p className="text-sm text-muted-foreground mb-2">
              These are controlled by the AI platform itself — the model receives or doesn't receive the content
              regardless of how it behaves.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                ✓ Bridge file <code className="rounded bg-muted px-1 font-mono text-xs">@imports</code>
              </li>
              <li>
                ✓ <code className="rounded bg-muted px-1 font-mono text-xs">alwaysApply: true</code> rules
              </li>
              <li>
                ✓ <code className="rounded bg-muted px-1 font-mono text-xs">globs:</code> scoped rules
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Convention-Based</p>
            <p className="text-sm text-muted-foreground mb-2">
              These rely on the AI model reading and respecting the hints. They work well in practice but are not
              technically enforced.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                ~ <code className="rounded bg-muted px-1 font-mono text-xs">{"<!-- when:X -->"}</code> tags
              </li>
              <li>
                ~ <code className="rounded bg-muted px-1 font-mono text-xs">{"<!-- context-check:X -->"}</code> tags
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4 mt-2 flex gap-3">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> For critical standards you always want applied, put them
            in a bridge file <code className="rounded bg-muted px-1 font-mono text-xs">@import</code> or a rule with{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">alwaysApply: true</code>. Reserve{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">when:</code> tags for optional hints that help
            the AI focus but aren't load-bearing.
          </p>
        </div>
      </div>

      {/* Pro tip */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <p className="text-sm font-medium mb-2">Pro Tip</p>
        <p className="text-sm text-muted-foreground">
          Start with the defaults and run{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">ck analyze</code> to populate your standards files.
          As your project grows, break large standards into granular sub-files and scope them with globs — this keeps
          per-session context tight without sacrificing coverage.
        </p>
      </div>
    </div>
  )
}
