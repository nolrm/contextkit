import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Brain, Terminal, Zap, Github } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="space-y-10">
      {/* Welcome */}
      <div className="space-y-3">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Welcome to ContextKit</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          ContextKit gives your AI assistants structured context through markdown files — so generated code matches
          your exact patterns, style, and architecture.
        </p>
      </div>

      {/* Quick Start callout */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
        <p className="text-sm font-medium mb-1">New here?</p>
        <p className="text-sm text-muted-foreground mb-3">
          Get up and running in under 2 minutes with the Quick Start guide.
        </p>
        <Button size="sm" asChild>
          <Link href="/docs/quick-start">
            Quick Start
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Section navigation cards */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Explore the docs</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/docs/how-context-works"
            className="rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-colors group"
          >
            <Brain className="h-6 w-6 text-primary mb-3" />
            <p className="font-semibold mb-1 group-hover:text-primary transition-colors">Core Concepts</p>
            <p className="text-sm text-muted-foreground">
              Understand how context engineering works and the MD-First development approach.
            </p>
          </Link>

          <Link
            href="/docs/commands"
            className="rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-colors group"
          >
            <Terminal className="h-6 w-6 text-primary mb-3" />
            <p className="font-semibold mb-1 group-hover:text-primary transition-colors">Features</p>
            <p className="text-sm text-muted-foreground">
              Commands, Slash Commands, Squad Workflow, Quality Gates, and Platform Examples.
            </p>
          </Link>

          <Link
            href="/docs/monorepo"
            className="rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-colors group"
          >
            <Zap className="h-6 w-6 text-primary mb-3" />
            <p className="font-semibold mb-1 group-hover:text-primary transition-colors">Advanced</p>
            <p className="text-sm text-muted-foreground">
              Monorepo support, enterprise features, and troubleshooting.
            </p>
          </Link>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-4 pt-2">
        <Button asChild>
          <Link href="/docs/quick-start">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://github.com/nolrm/contextkit" target="_blank">
            <Github className="mr-2 h-4 w-4" />
            View on GitHub
          </Link>
        </Button>
      </div>
    </div>
  )
}
