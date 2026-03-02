import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, FileCode, Sparkles, Users, FileText, Terminal } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Context Engineering",
    description:
      "Provide structured markdown context to AI assistants, preventing hallucinations and ensuring code matches your exact patterns and architecture.",
  },
  {
    icon: FileCode,
    title: "Project-Specific Standards",
    description:
      "Auto-detect your tech stack and customize standards. Glossary, code style, testing patterns—all tailored to your project.",
  },
  {
    icon: Sparkles,
    title: "Multi-Platform Support",
    description:
      "Works with Cursor (auto-loads), VS Code (Copilot), Aider, Continue.dev, Claude CLI, Gemini, and more.",
  },
  {
    icon: Users,
    title: "Squad Workflow",
    description:
      "Multi-agent pipeline that simulates a full team: Product Owner → Architect → Dev → Test → Review. Each role reads and writes to a shared handoff file.",
  },
  {
    icon: FileText,
    title: "MD-First Development",
    description:
      "Write a spec before writing code. Every component gets a colocated markdown file describing its purpose, props, and logic — giving AI full context before it touches a line.",
  },
  {
    icon: Terminal,
    title: "Slash Commands",
    description:
      "17 reusable AI workflows installed across all platforms: /analyze, /review, /fix, /refactor, /spec, /squad, and more. One command set, every tool.",
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
            Context-aware AI development that works with your existing tools and patterns.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
