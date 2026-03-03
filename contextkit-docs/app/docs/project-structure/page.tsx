export default function ProjectStructurePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Project Structure</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          After installation, ContextKit creates a comprehensive directory structure that provides context to AI
          assistants and organizes your development standards.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Directory Overview</h2>
        <p className="text-muted-foreground leading-relaxed">
          When you run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">contextkit install</code>, ContextKit creates a comprehensive directory structure:
        </p>
        <div className="rounded-lg border bg-card p-4 mt-4">
          <p className="text-sm font-medium mb-3">Directory structure created:</p>
          <pre className="rounded bg-muted p-3 font-mono text-xs overflow-x-auto">
            {`your-project/
├── .contextkit/
│   ├── standards/
│   │   ├── glossary.md          ← Project shortcuts & terminology
│   │   ├── code-style.md        ← Coding conventions
│   │   ├── code-style/          ← Granular style guides
│   │   │   ├── css-style.md
│   │   │   ├── typescript-style.md
│   │   │   ├── javascript-style.md
│   │   │   └── html-style.md
│   │   ├── testing.md           ← Test patterns
│   │   ├── architecture.md      ← Architecture decisions
│   │   ├── ai-guidelines.md     ← AI behavior rules
│   │   ├── workflows.md          ← Development workflows
│   │   ├── README.md             ← Overview (real file)
│   │   ├── frontend/             ← Monorepo: Frontend standards
│   │   └── backend/              ← Monorepo: Backend standards
│   ├── product/                  ← Product context
│   │   ├── mission.md            ← Product vision
│   │   ├── mission-lite.md       ← Condensed mission
│   │   ├── roadmap.md            ← Development roadmap
│   │   ├── decisions.md          ← Architecture Decision Records
│   │   └── context.md            ← Domain-specific context
│   ├── instructions/             ← Workflow instructions
│   │   ├── meta/
│   │   │   ├── pre-flight.md    ← Pre-flight checks
│   │   │   └── post-flight.md   ← Post-flight verification
│   │   └── core/
│   │       └── create-component.md ← Example workflow
│   ├── policies/                 ← Policy enforcement
│   │   └── policy.yml            ← Policy configuration
│   ├── corrections.md            ← AI performance tracking
│   ├── config.yml               ← Enhanced manifest schema
│   └── context.md                ← Single context file for CLI
│
├── .cursor/rules/
│   └── contextkit.mdc             ← Makes AI read the .md files`}
          </pre>
          <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">ℹ️ Skeleton Files</p>
            <p className="text-xs text-muted-foreground">
              Files marked "Skeleton" start as blank templates. Run <code className="rounded bg-muted px-1 font-mono">/analyze</code> in your AI tool to generate content from your codebase.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">The .contextkit Directory</h2>
        <p className="text-muted-foreground leading-relaxed">
          This is the main directory where all your project standards and context files live:
        </p>

        <div className="space-y-4 mt-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">standards/</h3>
            <p className="text-sm text-muted-foreground mb-3">Standards that AI reads as context</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">glossary.md</span>
                <span className="text-muted-foreground">- YOUR project shortcuts & terms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">code-style.md</span>
                <span className="text-muted-foreground">- YOUR coding conventions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">code-style/</span>
                <span className="text-muted-foreground">- Granular style guides (CSS, TypeScript, JavaScript, HTML)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">testing.md</span>
                <span className="text-muted-foreground">- YOUR test patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">architecture.md</span>
                <span className="text-muted-foreground">- YOUR architecture decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">ai-guidelines.md</span>
                <span className="text-muted-foreground">- AI behavior rules</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">frontend/</span>
                <span className="text-muted-foreground">- Frontend-specific standards (monorepos)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">backend/</span>
                <span className="text-muted-foreground">- Backend-specific standards (monorepos)</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">product/</h3>
            <p className="text-sm text-muted-foreground mb-3">Product context for AI understanding</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">mission.md</span>
                <span className="text-muted-foreground">- Product vision and purpose</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">mission-lite.md</span>
                <span className="text-muted-foreground">- Condensed mission for AI context</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">roadmap.md</span>
                <span className="text-muted-foreground">- Development phases and features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">decisions.md</span>
                <span className="text-muted-foreground">- Architecture Decision Records (ADRs)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">context.md</span>
                <span className="text-muted-foreground">- Domain-specific context</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">instructions/</h3>
            <p className="text-sm text-muted-foreground mb-3">Structured workflow instructions</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">meta/pre-flight.md</span>
                <span className="text-muted-foreground">- Pre-flight validation checks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">meta/post-flight.md</span>
                <span className="text-muted-foreground">- Post-flight verification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">core/</span>
                <span className="text-muted-foreground">- Core workflows (e.g., create-component.md)</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">policies/</h3>
            <p className="text-sm text-muted-foreground mb-3">Policy enforcement configuration</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary font-mono">policy.yml</span>
                <span className="text-muted-foreground">- Policy rules and enforcement levels (off, warn, block)</span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">corrections.md</h3>
            <p className="text-sm text-muted-foreground mb-3">AI performance tracking log</p>
            <p className="text-sm text-muted-foreground">
              Tracks AI behavior issues, preferences, and improvements. Use <code className="rounded bg-muted px-1 font-mono text-xs">ck note</code> to add entries.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">config.yml</h3>
            <p className="text-sm text-muted-foreground mb-3">Enhanced manifest schema</p>
            <p className="text-sm text-muted-foreground">
              Configuration file with versioning, required/optional standards, conditional loading rules, and analysis scope tracking.
            </p>
          </div>

        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Platform-Specific Integrations</h2>
        <p className="text-muted-foreground leading-relaxed">ContextKit integrates with multiple AI platforms:</p>

        <div className="space-y-4 mt-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Claude Code - CLAUDE.md + .claude/rules/ + .claude/commands/</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Auto-loaded via @imports:</strong> CLAUDE.md uses <code className="rounded bg-muted px-1 font-mono text-xs">@path</code> syntax to import standards and product files directly into context. No manual file reads needed — saves tokens and ensures standards are always available. Run <code className="rounded bg-muted px-1 font-mono text-xs">/context</code> in Claude Code to verify.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Cursor - .cursor/rules/contextkit.mdc</h3>
            <p className="text-sm text-muted-foreground">
              <strong>Automatic:</strong> Cursor reads all context files for every AI prompt via <code className="rounded bg-muted px-1 font-mono text-xs">alwaysApply: true</code>. No manual references needed!
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Continue.dev - .continue/config.json</h3>
            <p className="text-sm text-muted-foreground">
              Auto-loads context files for Continue.dev integration across any editor.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">Aider - .aider/rules.md</h3>
            <p className="text-sm text-muted-foreground">
              Automatically reads context files for Aider command-line AI assistance.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">VS Code - .vscode/settings.json</h3>
            <p className="text-sm text-muted-foreground">
              Configuration settings for VS Code and GitHub Copilot integration. <strong>Note:</strong> Unlike Cursor, you must manually reference context files in your Copilot prompts (e.g., <code className="rounded bg-muted px-1 font-mono text-xs">@.contextkit</code> includes all files).
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold text-lg mb-2">CLI Tools - .contextkit/scripts/ai-cli.sh</h3>
            <p className="text-sm text-muted-foreground">
              Universal helper scripts for Claude CLI, Gemini CLI, and other command-line AI tools.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Customization</h2>
        <p className="text-muted-foreground leading-relaxed">
          All files in the .contextkit directory are meant to be customized for your project. After running <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/analyze</code> in your AI tool, modify them to match your team's specific needs:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
          <li>Add project-specific terminology to glossary.md</li>
          <li>Define your coding style preferences in code-style.md and granular files</li>
          <li>Document your testing approach in testing.md</li>
          <li>Capture architectural decisions in architecture.md and product/decisions.md</li>
          <li>Set AI behavior expectations in ai-guidelines.md</li>
          <li>Document workflows in workflows.md and instructions/core/</li>
          <li>Configure policy enforcement in policies/policy.yml</li>
          <li>Track AI performance in corrections.md</li>
          <li>Add product context in product/ directory</li>
        </ul>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6">
        <p className="text-sm font-medium mb-2">Pro Tip</p>
        <p className="text-sm text-muted-foreground">
          The more detailed and specific your context files are, the better AI assistants will understand your project
          and generate code that matches your exact patterns and preferences.
        </p>
      </div>
    </div>
  )
}
