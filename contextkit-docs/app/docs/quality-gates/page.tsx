'use client'

import React, { useEffect } from "react"
import { Terminal, Shield, GitBranch, CheckCircle2 } from "lucide-react"

export default function QualityGatesPage() {
  const headings = [
    { id: 'overview', text: 'Overview' },
    { id: 'how-it-works', text: 'How It Works' },
    { id: 'pre-push', text: 'Pre-push Quality Gates' },
    { id: 'commit-msg', text: 'Commit Message Hook' },
    { id: 'team-setup', text: 'Team Setup' },
    { id: 'configuration', text: 'Configuration' },
  ];

  useEffect(() => {
    const tocContainer = document.getElementById('toc-container')
    if (tocContainer) {
      tocContainer.innerHTML = `
        <nav class="space-y-2">
          <p class="font-medium text-sm mb-3">On this page</p>
          <div class="grid grid-flow-row auto-rows-max text-sm">
            ${headings.map(h => `
              <a
                href="#${h.id}"
                class="group flex w-full items-center rounded-md border border-transparent pr-2 py-1.5 hover:underline text-sm text-muted-foreground"
              >
                ${h.text}
              </a>
            `).join('')}
          </div>
        </nav>
      `
    }
  }, [headings])

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Git Hooks & Quality Gates</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ContextKit provides framework-aware quality checks via Git hooks. No external dependencies like Husky required — works in any git repo, not just Node.js projects.
        </p>
      </div>

      {/* Overview */}
      <div id="overview" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Overview</h2>

        <div className="overflow-x-auto">
          <table aria-label="Git hooks overview" className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-2 pr-4 font-semibold">Hook</th>
                <th scope="col" className="text-left py-2 font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">pre-push</td>
                <td className="py-2">Auto-detects your framework and runs quality checks before pushing</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">commit-msg</td>
                <td className="py-2">Enforces Conventional Commits format</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium mb-2">No dependencies required</p>
          <p className="text-sm text-muted-foreground">
            ContextKit uses <code className="rounded bg-muted px-1 font-mono text-xs">git config core.hooksPath</code> to point Git at <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/hooks/</code>. No npm packages, no Husky, no lint-staged. Works with any language.
          </p>
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">How It Works</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
              During install
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code> runs <code className="rounded bg-muted px-1 font-mono text-xs">git config core.hooksPath .contextkit/hooks</code> to tell Git where hooks live.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              For Node.js projects
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              A <code className="rounded bg-muted px-1 font-mono text-xs">prepare</code> script is added to <code className="rounded bg-muted px-1 font-mono text-xs">package.json</code> so hooks activate automatically for all developers after <code className="rounded bg-muted px-1 font-mono text-xs">npm install</code>.
            </p>
            <div className="rounded-lg border bg-muted/50 p-3 mt-2 ml-8">
              <pre className="font-mono text-xs overflow-x-auto">{`"scripts": {
  "prepare": "git config core.hooksPath .contextkit/hooks"
}`}</pre>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              For non-Node projects
            </h3>
            <p className="text-sm text-muted-foreground ml-8">
              Each developer runs <code className="rounded bg-muted px-1 font-mono text-xs">bash .contextkit/hooks/setup-hooks.sh</code> once, or adds the <code className="rounded bg-muted px-1 font-mono text-xs">git config</code> command to their build tool's setup task.
            </p>
          </div>
        </div>
      </div>

      {/* Pre-push Quality Gates */}
      <div id="pre-push" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Pre-push Quality Gates</h2>
        <p className="text-muted-foreground leading-relaxed">
          The pre-push hook auto-detects your project framework and runs the appropriate quality checks. All gates skip gracefully when tools aren't installed.
        </p>

        <div className="overflow-x-auto">
          <table aria-label="Pre-push quality gates by framework" className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-2 pr-4 font-semibold">Framework</th>
                <th scope="col" className="text-left py-2 font-semibold">Checks</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Node.js</td>
                <td className="py-2">TypeScript, ESLint, Prettier, build, test (auto-detects npm/yarn/pnpm/bun)</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Python</td>
                <td className="py-2">ruff/flake8, mypy, black/ruff format, pytest</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Rust</td>
                <td className="py-2">cargo check, clippy, cargo test</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Go</td>
                <td className="py-2">go vet, golangci-lint, go test</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">PHP</td>
                <td className="py-2">PHPStan, PHPUnit</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Ruby</td>
                <td className="py-2">RuboCop, RSpec/rake test</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Java</td>
                <td className="py-2">Maven verify / Gradle check</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Graceful skipping</p>
              <p className="text-sm text-muted-foreground">
                If a tool isn't installed (e.g., no ESLint in your project), that gate is skipped with a message — it won't block your push. Only installed tools are checked.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Commit Message Hook */}
      <div id="commit-msg" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Commit Message Hook</h2>
        <p className="text-muted-foreground leading-relaxed">
          When enabled, the commit-msg hook enforces Conventional Commits format:
        </p>

        <div className="rounded-lg border bg-muted/50 p-4">
          <pre className="font-mono text-sm overflow-x-auto">{`<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore`}</pre>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Examples</h3>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="space-y-1 font-mono text-sm">
              <code className="block rounded bg-muted px-3 py-1">feat(auth): add login page</code>
              <code className="block rounded bg-muted px-3 py-1">fix: resolve null pointer in checkout</code>
              <code className="block rounded bg-muted px-3 py-1">docs: update API reference</code>
              <code className="block rounded bg-muted px-3 py-1">test(cart): add edge case coverage</code>
            </div>
          </div>
        </div>
      </div>

      {/* Team Setup */}
      <div id="team-setup" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Team Setup</h2>
        <p className="text-muted-foreground leading-relaxed">
          One developer enables hooks during <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code>. For Node.js projects, the <code className="rounded bg-muted px-1 font-mono text-xs">prepare</code> script ensures hooks work for everyone automatically.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Node.js projects</h3>
            <p className="text-sm text-muted-foreground">
              The <code className="rounded bg-muted px-1 font-mono text-xs">prepare</code> script in <code className="rounded bg-muted px-1 font-mono text-xs">package.json</code> runs automatically after <code className="rounded bg-muted px-1 font-mono text-xs">npm install</code>, so hooks activate for all developers without any extra steps.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Other projects (Python, Rust, Go, etc.)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add this to your project's setup instructions or Makefile:
            </p>
            <div className="rounded-lg border bg-muted/50 p-3">
              <code className="block font-mono text-sm">git config core.hooksPath .contextkit/hooks</code>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div id="configuration" className="space-y-4 pt-4 scroll-mt-20">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Configuration</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Skip hooks during install</h3>
            <div className="rounded-lg border bg-muted/50 p-3">
              <code className="block font-mono text-sm">ck install --no-hooks</code>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Skip hooks for a single push</h3>
            <div className="rounded-lg border bg-muted/50 p-3">
              <code className="block font-mono text-sm">git push --no-verify</code>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Uninstall hooks</h3>
            <div className="rounded-lg border bg-muted/50 p-3">
              <code className="block font-mono text-sm">git config --unset core.hooksPath</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
