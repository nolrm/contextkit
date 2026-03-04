import { Terminal, CheckCircle2, Package, Code, Server } from "lucide-react"
import Link from "next/link"

export default function MonorepoPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Monorepo Support</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ContextKit automatically detects monorepo structures and intelligently analyzes frontend and backend packages separately.
        </p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium mb-2">📦 Supported Monorepo Tools</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          <div className="text-sm text-muted-foreground">• Turborepo</div>
          <div className="text-sm text-muted-foreground">• Nx</div>
          <div className="text-sm text-muted-foreground">• Lerna</div>
          <div className="text-sm text-muted-foreground">• pnpm/yarn/npm workspaces</div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">How It Works</h2>
        
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">1. Automatic Detection</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  ContextKit scans for monorepo indicators:
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside ml-2 space-y-1">
                  <li><code className="rounded bg-muted px-1 font-mono text-xs">turbo.json</code> (Turborepo)</li>
                  <li><code className="rounded bg-muted px-1 font-mono text-xs">nx.json</code> (Nx)</li>
                  <li><code className="rounded bg-muted px-1 font-mono text-xs">lerna.json</code> (Lerna)</li>
                  <li><code className="rounded bg-muted px-1 font-mono text-xs">workspaces</code> in package.json</li>
                  <li><code className="rounded bg-muted px-1 font-mono text-xs">packages/</code> or <code className="rounded bg-muted px-1 font-mono text-xs">apps/</code> directories</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <Code className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">2. Package Classification</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Each package is automatically classified based on dependencies and structure:
                </p>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Frontend Indicators</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                      <li>React, Vue, Angular dependencies</li>
                      <li>Next.js, Nuxt, Svelte</li>
                      <li>components/ directory</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">Backend Indicators</p>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                      <li>Express, Fastify, Koa</li>
                      <li>NestJS, Django, Flask</li>
                      <li>server.js, api/ directory</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">3. Scope Selection</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  When running <code className="rounded bg-muted px-1 font-mono text-xs">/analyze</code>, you'll be prompted to select:
                </p>
                <div className="space-y-2">
                  <div className="rounded-lg border border-muted p-2">
                    <p className="text-sm font-medium mb-1">Frontend</p>
                    <p className="text-xs text-muted-foreground">Analyzes React/Vue/Angular packages only</p>
                  </div>
                  <div className="rounded-lg border border-muted p-2">
                    <p className="text-sm font-medium mb-1">Backend</p>
                    <p className="text-xs text-muted-foreground">Analyzes API/server packages only</p>
                  </div>
                  <div className="rounded-lg border border-muted p-2">
                    <p className="text-sm font-medium mb-1">Both</p>
                    <p className="text-xs text-muted-foreground">Generates separate standards for frontend and backend</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Usage Examples</h2>
        
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Interactive Mode</h3>
            <p className="text-sm text-muted-foreground mb-2">
              ContextKit will prompt you to select the scope:
            </p>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
              contextkit analyze
            </code>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Output: "Which part of the monorepo should we analyze? Frontend (2 packages), Backend (1 package), Both, or Current directory only"
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Non-Interactive Mode</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Use CLI flags to skip prompts:
            </p>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-2">
              contextkit analyze --scope frontend
            </code>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-2">
              contextkit analyze --scope backend
            </code>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mb-2">
              contextkit analyze --scope both
            </code>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
              contextkit analyze --package apps/admin
            </code>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Directory Structure</h2>
        
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-3">
            When analyzing both frontend and backend, ContextKit generates separate standards:
          </p>
          <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">
            {`.contextkit/
├── standards/
│   ├── frontend/          ← Frontend-specific standards
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   └── architecture.md
│   ├── backend/           ← Backend-specific standards
│   │   ├── code-style.md
│   │   ├── testing.md
│   │   └── architecture.md
│   └── ...                ← Shared standards (glossary, etc.)
└── config.yml             ← Tracks analysis_scope: "both"`}
          </pre>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Best Practices</h2>
        
        <div className="space-y-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">1. Analyze Both Separately</h3>
            <p className="text-sm text-muted-foreground">
              Use <code className="rounded bg-muted px-1 font-mono text-xs">--scope both</code> to generate separate standards. This ensures frontend patterns don't mix with backend patterns.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">2. Update Config After Analysis</h3>
            <p className="text-sm text-muted-foreground">
              The <code className="rounded bg-muted px-1 font-mono text-xs">config.yml</code> file tracks which packages were analyzed, making it easy to re-run analysis later.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-base mb-2">3. Commit Standards to Git</h3>
            <p className="text-sm text-muted-foreground">
              Commit the entire <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/</code> directory to git. Team members on different AI tools run their own platform command (e.g. <code className="rounded bg-muted px-1 font-mono text-xs">ck cursor</code>, <code className="rounded bg-muted px-1 font-mono text-xs">ck claude</code>) to set up their local integration against the shared standards.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <p className="text-sm font-medium mb-2">💡 Related Documentation</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Link href="/docs/enterprise-features" className="text-sm text-primary hover:underline">
            Enterprise Features →
          </Link>
          <Link href="/docs/commands" className="text-sm text-primary hover:underline">
            Commands Reference →
          </Link>
          <Link href="/docs/project-structure" className="text-sm text-primary hover:underline">
            Project Structure →
          </Link>
        </div>
      </div>
    </div>
  )
}

