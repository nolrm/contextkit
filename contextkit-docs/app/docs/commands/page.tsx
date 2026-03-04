import { Terminal, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CommandsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Commands Reference</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Reference for ContextKit CLI commands. Use <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck</code> as a short alias for <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">contextkit</code>.
        </p>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <p className="text-sm font-medium mb-1">New to ContextKit?</p>
        <p className="text-sm text-muted-foreground mb-2">Installation and project setup are covered in the Quick Start guide.</p>
        <Link href="/docs/quick-start" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
          Go to Quick Start <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Updates & Maintenance</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit update</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Update ContextKit commands, hooks, and platform integration files to the latest version. Preserves your standards files and project configuration.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit update</code>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-1">contextkit update --force</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Status & Health</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit status</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Check installation status and verify which context files are present and configured.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit status</code>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit check</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Validate your ContextKit installation and check that all expected files are in place.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit check</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--strict</code> - Treat warnings as errors</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--verbose</code> - Show detailed information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Analysis</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit analyze</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Analyze your project and generate customized standards based on your actual codebase. <strong>Monorepo-aware:</strong> Automatically detects and prompts for frontend/backend scope.
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  💡 Prefer using <code className="rounded bg-muted px-1 font-mono">/analyze</code> directly in your AI tool — it reads your codebase and generates standards without leaving the editor.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit analyze</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--scope frontend|backend|both</code> - Analyze specific scope (non-interactive)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--package &lt;path&gt;</code> - Analyze specific package (e.g., apps/admin)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--non-interactive</code> - Skip prompts</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 mt-2">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">📦 Monorepo Support:</p>
                  <p className="text-xs text-muted-foreground">
                    For monorepos, automatically detects packages and prompts to analyze frontend, backend, or both. Generates separate standards when analyzing both.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Corrections Logging</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit note</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Add entries to the corrections log for tracking AI performance issues and improvements.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit note "prefer async/await over promise chains"</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--category &lt;category&gt;</code> - Category (AI Behavior, Preferences, etc.)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--priority &lt;priority&gt;</code> - Priority (HIGH, MEDIUM, LOW)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--task &lt;task&gt;</code> - Related task description</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Example: <code className="rounded bg-muted px-1 font-mono text-xs">ck note "always use named exports" --category "Preferences" --priority LOW</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Observability</h2>

        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Terminal className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">contextkit dashboard</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Start a web-based observability dashboard to visualize standards freshness, corrections log analytics, and policy compliance.
                </p>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit dashboard</code>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>Options:</strong>
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-0.5">
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--port &lt;port&gt;</code> - Custom port (default: 3001)</li>
                    <li><code className="rounded bg-muted px-1 font-mono text-xs">--no-server</code> - Display metrics in CLI only</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Short Alias Available</p>
            <p className="text-sm text-muted-foreground">
              Use <code className="rounded bg-muted px-1 font-mono text-xs">ck</code> instead of <code className="rounded bg-muted px-1 font-mono text-xs">contextkit</code> for faster typing. Example: <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck update</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck check</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
