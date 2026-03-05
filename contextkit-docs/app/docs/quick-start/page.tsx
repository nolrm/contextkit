import { Terminal, CheckCircle2, ArrowRight, ArrowLeft, BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function QuickStartPage() {
  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Getting Started</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">Quick Start</span>
      </nav>

      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Quick Start</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Get started with ContextKit in 3 simple steps. This guide walks you through installation, setup, and your first use.
        </p>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm font-medium mb-3">📋 Prerequisites</p>
        <ul className="space-y-3 text-sm ml-2">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <div>
              <strong className="text-foreground">Node.js 16.x or higher</strong>
              <span className="block text-xs text-muted-foreground mt-0.5">Required for running the CLI tools.</span>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <div>
              <strong className="text-foreground">Git (Optional)</strong>
              <span className="block text-xs text-muted-foreground mt-0.5">Needed if you plan to use git hooks features.</span>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">✓</span>
            <div>
              <strong className="text-foreground">AI Tools</strong>
              <span className="block text-xs text-muted-foreground mt-0.5">Cursor, VS Code, or Aider - selected during installation.</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Step 1 */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            1
          </span>
          Install ContextKit
        </h2>
        
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed">Install the CLI globally (one-time setup). Your standards live in each project, not on your machine.</p>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Terminal className="h-4 w-4" />
              <span className="font-mono">Install the CLI (one-time)</span>
            </div>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">npm install -g @nolrm/contextkit</code>
          </div>
          <p className="text-sm text-muted-foreground">
            Or use without installing: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npx @nolrm/contextkit@latest install</code>
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            2
          </span>
          Install in Your Project
        </h2>
        
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed">Navigate to your project directory and initialize ContextKit. This creates the <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.contextkit/</code> directory.</p>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Terminal className="h-4 w-4" />
              <span className="font-mono">In your terminal</span>
            </div>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">cd your-project</code>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm mt-2">contextkit install</code>
            <p className="text-xs text-muted-foreground mt-2 italic">Or specify your AI tool directly: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">contextkit install claude</code></p>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="text-sm font-medium mb-2">💡 Multi-Team Workflow</p>
            <p className="text-sm text-muted-foreground mb-2">
              If <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.contextkit</code> already exists, add your specific AI tool:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">contextkit cursor</code>
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">contextkit vscode</code>
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">contextkit claude</code>
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">contextkit gemini</code>
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">contextkit codex</code>
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">contextkit opencode</code>
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">contextkit aider</code>
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">contextkit continue</code>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            3
          </span>
          Customize for Your Project
        </h2>
        
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed">Run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/analyze</code> in your AI tool to customize standards to your tech stack:</p>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Terminal className="h-4 w-4" />
              <span className="font-mono">In your AI tool (Claude, Cursor, etc.)</span>
            </div>
            <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">/analyze</code>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-sm font-medium mb-2">🎯 What analyze does:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li>Scans your project structure and dependencies</li>
              <li>Detects existing patterns and configurations</li>
              <li>Generates standards content based on your actual codebase</li>
              <li>Creates project-specific AI guidelines</li>
              <li><strong>⚠️ Important:</strong> Review and edit the generated content manually</li>
            </ul>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 mt-3">
            <p className="text-sm font-medium mb-2">📦 Monorepo Support</p>
            <p className="text-sm text-muted-foreground mb-2">
              For monorepos, <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/analyze</code> automatically detects frontend/backend packages and prompts you to select which to analyze:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
              <li><strong>Frontend:</strong> Analyzes React/Vue/Angular packages</li>
              <li><strong>Backend:</strong> Analyzes API/server packages</li>
              <li><strong>Both:</strong> Generates separate standards for frontend and backend</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              Use <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--scope frontend</code> or <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">--scope backend</code> for non-interactive mode.
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight flex items-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          You're Ready to Go!
        </h2>
        
        <p className="text-muted-foreground leading-relaxed">
          ContextKit is now configured. Here's what to do next:
        </p>

        <div className="grid gap-3 md:grid-cols-2 mt-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Use in Cursor
            </h3>
            <p className="text-sm text-muted-foreground">
              Cursor automatically loads all context files. Once you've added your terms to <code className="rounded bg-muted px-1 font-mono text-xs">glossary.md</code>, try: <code className="rounded bg-muted px-1 font-mono text-xs">Create [your-feature] for [your-entity]</code>
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Use in VS Code
            </h3>
            <p className="text-sm text-muted-foreground">
              In Copilot Chat: <code className="rounded bg-muted px-1 font-mono text-xs">@.contextkit Create [your-feature] for [your-entity]</code> — after adding your terms to <code className="rounded bg-muted px-1 font-mono text-xs">glossary.md</code>
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Customize Standards
            </h3>
            <p className="text-sm text-muted-foreground">
              Edit files in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/</code> to match your team's preferences.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Check Status
            </h3>
            <p className="text-sm text-muted-foreground">
              Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit status</code> to see installed integrations.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <p className="text-sm font-medium mb-2">What Gets Created?</p>
        <p className="text-sm text-muted-foreground">
          ContextKit creates a <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.contextkit/</code> directory with standards, templates, and commands. Choose your AI tool during install or specify it directly with <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">ck install claude</code>.
        </p>
      </div>

      <div className="flex gap-4 pt-6">
        <Link href="/docs/platform-examples" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          View Platform Examples
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/docs/project-structure" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
          Learn About Project Structure
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Introduction</div>
          </div>
        </Link>
        <Link
          href="/docs/project-structure"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">Project Structure</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
