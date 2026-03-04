import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, FileCode, Layers, Users, FileText, Terminal } from "lucide-react"

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
      "Auto-detect your tech stack and customize standards. Glossary, code style, testing patterns—all tailored specifically to your project's needs.",
  },
  {
    icon: Layers,
    title: "Multi-Platform Support",
    description:
      "Works with Cursor (auto-loads), VS Code (Copilot), Aider, Continue.dev, UX Pilot CLI, Gemini, and more. One context source for all tools.",
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
      "17 reusable AI workflows installed across all platforms: /analyze, /fix, /refactor, /spec, /squad, and more. One command set, every tool.",
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
            Context-aware AI development that works seamlessly with your existing tools and engineering patterns.
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
