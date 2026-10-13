import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCode, Layers, Target, ShieldCheck, Terminal, ListTree } from "lucide-react"

const features = [
  {
    icon: FileCode,
    title: "One Canonical AGENTS.md",
    description:
      "Every integration writes the same AGENTS.md. CLAUDE.md imports it, and tools that don't read AGENTS.md get the same body in their own file. One source of truth, every tool.",
  },
  {
    icon: ListTree,
    title: "Short Index, Path-Scoped Standards",
    description:
      "A short always-loaded index.md holds the must-know rules and commands. Topic standards like testing and code style load only when the AI touches matching files, via context_rules.",
  },
  {
    icon: Layers,
    title: "Multi-Platform Support",
    description:
      "Claude-first, and works with Codex, Cursor, GitHub Copilot, Gemini, OpenCode, Aider, Continue, and Windsurf. Each tool gets context in the format it actually reads.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Gates",
    description:
      "Pre-push and commit-msg git hooks run your lint, type-check, test, and build commands. Code that already passed is skipped, and stale context gets a warning before you push.",
  },
  {
    icon: Target,
    title: "/goal for Long Tasks",
    description:
      "Run a long task against a one-page goal file with checkable outcomes. The agent builds in its own loop, re-reads the goal after compaction, and gets a fresh-context review before ticking each outcome.",
  },
  {
    icon: Terminal,
    title: "Five Small Skills",
    description:
      "/ck to set up, update, and tidy context, /doc to keep docs current, /learn to turn corrections into rules, plus the /goal and /headline add-ons.",
  },
]

export function Features() {
  return (
    <section className="container mx-auto py-24 md:py-32">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Key Features
          </h2>
          <p className="text-balance text-lg text-muted-foreground max-w-2xl">
            Give your AI coding tools the project context they need, without loading everything into every session.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="relative overflow-hidden border-border bg-card">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
