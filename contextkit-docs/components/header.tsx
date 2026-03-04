import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Package } from "lucide-react"
import { Logo } from "./logo"

const VERSION = "v0.12.12"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block">ContextKit</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Docs
            </Link>
            <Link href="/docs/quick-start" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Quick Start
            </Link>
            <Link href="/docs/platform-examples" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Examples
            </Link>

          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/nolrm/contextkit" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="https://www.npmjs.com/package/@nolrm/contextkit" target="_blank" rel="noopener noreferrer">
              <Package className="h-5 w-5" />
              <span className="sr-only">npm</span>
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground font-mono px-2">{VERSION}</span>
        </div>
      </div>
    </header>
  )
}
