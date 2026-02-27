import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-6 md:py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Released under the MIT License. Copyright © 2026{" "}
            <Link href="https://github.com/nolrm" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Marlon Maniti
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/nolrm/contextkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="https://www.npmjs.com/package/@nolrm/contextkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            npm
          </Link>
        </div>
      </div>
    </footer>
  )
}
