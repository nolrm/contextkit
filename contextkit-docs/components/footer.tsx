import Link from "next/link"
import { Github, Package, Twitter } from "lucide-react"
import { Logo } from "./logo"

const resources = [
  { href: "/docs", label: "Documentation" },
  { href: "/docs/quick-start", label: "Quick Start" },
  { href: "/docs/platform-examples", label: "Examples" },
]

const community = [
  { href: "https://github.com/nolrm/contextkit", label: "GitHub", icon: Github },
  { href: "https://www.npmjs.com/package/@nolrm/contextkit", label: "NPM", icon: Package },
  { href: "https://twitter.com/nolrm", label: "Twitter", icon: Twitter },
]

export function Footer() {
  return (
    <footer className="border-t border-border/40 pt-12 pb-6">
      <div className="container mx-auto max-w-screen-xl">
        {/* 3-column grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {/* Left — logo + tagline */}
          <div className="flex flex-col gap-4 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
              <span className="font-bold">ContextKit</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Context engineering for AI development. Give your AI assistants structured context that ensures
              generated code matches your exact patterns and architecture.
            </p>
          </div>

          {/* Center — Resources */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-foreground">Resources</p>
            <ul className="flex flex-col gap-2">
              {resources.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Community */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-foreground">Community</p>
            <ul className="flex flex-col gap-2">
              {community.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Released under the MIT License. Copyright © 2026{" "}
            <Link
              href="https://github.com/nolrm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Marlon Maniti
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
