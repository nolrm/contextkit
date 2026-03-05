import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Search } from "lucide-react"

export function DocsHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8 gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="font-mono text-lg font-bold text-primary-foreground">CK</span>
          </div>
          <span className="hidden font-bold sm:inline-block">ContextKit</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/docs" className="font-medium text-primary transition-colors">
            Docs
          </Link>
          <Link href="/docs/quick-start" className="text-muted-foreground hover:text-foreground transition-colors">
            Quick Start
          </Link>
          <Link href="/docs/platform-examples" className="text-muted-foreground hover:text-foreground transition-colors">
            Examples
          </Link>
        </nav>

        {/* Search + icons */}
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Search bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search docs..."
              readOnly
              className="w-48 lg:w-64 rounded-md border border-border bg-card pl-9 pr-20 py-1.5 text-sm text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">Ctrl</span>
              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">K</span>
            </div>
          </div>

          <Button variant="ghost" size="icon" asChild>
            <Link href="https://github.com/nolrm/contextkit" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
