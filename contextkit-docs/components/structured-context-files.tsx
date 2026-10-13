const steps = [
  {
    number: 1,
    title: "Install in your project",
    description: (
      <>
        Run{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">
          ck install
        </code>{" "}
        to write AGENTS.md, the standards folder, path-scoped rules, and quality-gate hooks.
      </>
    ),
  },
  {
    number: 2,
    title: "Fill in your standards",
    description: (
      <>
        Run{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">
          /ck setup
        </code>{" "}
        in your AI tool. It reads your codebase and writes the standards, a short index.md, and context_rules.
      </>
    ),
  },
  {
    number: 3,
    title: "Generate better code",
    description:
      "AI tools read AGENTS.md and the index every session, and load topic standards only when they touch matching files.",
  },
]

export function StructuredContextFiles() {
  return (
    <section className="bg-muted py-24 md:py-32">
      <div className="container mx-auto max-w-screen-xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Structured Context Files
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                ContextKit keeps one canonical AGENTS.md and a short always-loaded index. Everything else
                lives in topic standards that load only where they apply.
              </p>
            </div>

            <ol className="flex flex-col gap-6">
              {steps.map((step) => (
                <li key={step.number} className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-bold">
                    {step.number}
                  </div>
                  <div className="flex flex-col gap-1 pt-0.5">
                    <span className="font-semibold text-foreground">{step.title}</span>
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Right column — mock code panel */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
            {/* macOS window chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                .contextkit/standards/index.md
              </span>
            </div>

            {/* Code content */}
            <div className="bg-[#0a0f1c] p-6 font-mono text-sm leading-7 overflow-auto">
              <p>
                <span className="text-primary font-bold"># Project Index</span>
              </p>
              <p className="text-muted-foreground">Next.js 16 app (App Router, TypeScript strict).</p>
              <p className="mt-4">
                <span className="text-primary font-bold">## Must / Must Not</span>
              </p>
              <p className="text-muted-foreground">- Use Server Actions, not API routes</p>
              <p className="text-muted-foreground">- Never import from app/ in lib/</p>
              <p className="mt-4">
                <span className="text-primary font-bold">## Commands</span>
              </p>
              <p className="text-muted-foreground">- Test: pnpm test</p>
              <p className="text-muted-foreground">- Lint: pnpm lint</p>
              <p className="mt-4">
                <span className="text-primary font-bold">## When You Touch X, Read Y</span>
              </p>
              <p className="text-muted-foreground">- *.test.ts → standards/testing.md</p>
              <p className="text-muted-foreground">- app/** → standards/code-style.md</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
