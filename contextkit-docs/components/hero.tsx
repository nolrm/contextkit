import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Github, Sparkles } from "lucide-react"
import { InstallCommand } from "./install-command"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto relative z-10 flex flex-col items-center justify-center gap-8 py-24 md:py-32 lg:py-40">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-3 w-3" />
            Context Engineering for AI Development
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Give your AI assistants
            <br />
            <span className="text-primary">structured context</span>
          </h1>

          {/* Subtitle */}
          <p className="text-balance text-base text-muted-foreground max-w-xl leading-relaxed mt-2">
            Create a knowledge base that ensures AI generates code matching your exact patterns, style, and architecture.
            Works with Cursor, VS Code, UX Pilot CLI, and more.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button size="lg" asChild className="text-base">
            <Link href="/docs">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base bg-transparent border-border">
            <Link href="/docs">
              <BookOpen className="mr-2 h-4 w-4" />
              Read Docs
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base bg-transparent border-border">
            <Link href="https://github.com/nolrm/contextkit" target="_blank">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Link>
          </Button>
        </div>

        {/* Install command */}
        <div className="mt-4 w-full max-w-md">
          <InstallCommand />
        </div>
      </div>
    </section>
  )
}
