import { CheckCircle2, Shield, BarChart3, FileText } from "lucide-react"
import Link from "next/link"

export default function EnterpriseFeaturesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Enterprise Features</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ContextKit includes features for policy enforcement, observability, corrections tracking, and monorepo support.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Policy Enforcement</h2>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">contextkit check</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Validate installation and enforce policy compliance based on <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/policies/policy.yml</code>.
              </p>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 mb-3">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">Policy Configuration Example:</p>
                <pre className="text-xs text-muted-foreground overflow-x-auto">
{`enforcement:
  testing:
    numbered_cases: warn  # off | warn | block
    coverage_threshold: 80
  code_style:
    typescript_strict: warn`}
                </pre>
              </div>

              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-2">contextkit check</code>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">contextkit check --strict</code>

              <p className="text-sm text-muted-foreground mt-3">
                Enforcement levels: <code className="rounded bg-muted px-1 font-mono text-xs">off</code> (no check), <code className="rounded bg-muted px-1 font-mono text-xs">warn</code> (warning), <code className="rounded bg-muted px-1 font-mono text-xs">block</code> (error).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Observability Dashboard</h2>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">contextkit dashboard</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Visualize standards freshness, corrections log analytics, and policy compliance.
              </p>

              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-2">contextkit dashboard</code>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-3">contextkit dashboard --no-server  # CLI metrics only</code>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2">Dashboard Metrics:</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  <li>Standards freshness (last updated dates)</li>
                  <li>Corrections log statistics</li>
                  <li>Policy compliance status</li>
                  <li>Product context completeness</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Corrections Logging</h2>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">contextkit note</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Track AI performance issues, preferences, and improvements in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/corrections.md</code>.
              </p>

              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-3">
                contextkit note "always use named exports" --category "Preferences" --priority LOW
              </code>

              <p className="text-sm text-muted-foreground">
                Categories: AI Behavior, Preferences, Rule Updates, Trend Indicators. Use this to continuously improve AI performance over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Monorepo Support</h2>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Automatic Detection & Scope Selection</h3>
              <p className="text-sm text-muted-foreground mb-3">
                ContextKit automatically detects monorepo structures (Turborepo, Nx, Lerna) and classifies packages as frontend or backend.
              </p>

              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-2">contextkit analyze  # Interactive: prompts for scope</code>
              <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-3">contextkit analyze --scope both  # Analyze both frontend & backend</code>

              <p className="text-sm text-muted-foreground">
                When analyzing both, generates separate standards in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/frontend/</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/backend/</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <p className="text-sm font-medium mb-2">💡 Getting Started</p>
        <p className="text-sm text-muted-foreground mb-3">
          All features are available immediately after installation — no extra setup required.
        </p>
        <div className="flex gap-2">
          <Link href="/docs/quick-start" className="text-sm text-primary hover:underline">
            Quick Start Guide →
          </Link>
          <Link href="/docs/commands" className="text-sm text-primary hover:underline">
            Commands Reference →
          </Link>
        </div>
      </div>
    </div>
  )
}
