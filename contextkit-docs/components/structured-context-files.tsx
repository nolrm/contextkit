const steps = [
  {
    number: 1,
    title: "Initialize your project",
    description: (
      <>
        Run{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">
          npx contextkit init
        </code>{" "}
        to create the structure.
      </>
    ),
  },
  {
    number: 2,
    title: "Define standards",
    description: "Edit the generated markdown files to match your team's coding style.",
  },
  {
    number: 3,
    title: "Generate better code",
    description: "AI assistants read these files to produce code that actually compiles and fits in.",
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
                ContextKit generates a consistent folder structure for your project documentation.
                This allows LLMs to understand your project&apos;s architecture instantly.
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
                .context/architecture/tech-stack.md
              </span>
            </div>

            {/* Code content */}
            <div className="bg-[#0a0f1c] p-6 font-mono text-sm leading-7 overflow-auto">
              <p>
                <span className="text-primary font-bold"># Tech Stack &amp; Architecture</span>
              </p>
              <p className="mt-4">
                <span className="text-primary font-bold">## Frontend Framework</span>
              </p>
              <p className="text-muted-foreground">- **Next.js 16** (App Router)</p>
              <p className="text-muted-foreground">- **TypeScript** (Strict mode)</p>
              <p className="text-muted-foreground">- **Tailwind CSS** for styling</p>
              <p className="mt-4">
                <span className="text-primary font-bold">## State Management</span>
              </p>
              <p className="text-muted-foreground">- **Zustand** for global client state</p>
              <p className="text-muted-foreground">- **React Query** for server state</p>
              <p className="mt-4">
                <span className="text-primary font-bold">## Database</span>
              </p>
              <p className="text-muted-foreground">- **Supabase** (PostgreSQL)</p>
              <p className="text-muted-foreground">- **Prisma** ORM</p>
              <p className="mt-4">
                <span className="text-primary font-bold">## AI Patterns</span>
              </p>
              <p className="text-muted-foreground">- Use Vercel AI SDK for streaming</p>
              <p className="text-muted-foreground">- Prefer Server Actions over API routes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
