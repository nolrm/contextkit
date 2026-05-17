"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const docsNav = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Quick Start", href: "/docs/quick-start" },
      { title: "Project Structure", href: "/docs/project-structure" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "How Context Works", href: "/docs/how-context-works" },
      { title: "MD-First Development", href: "/docs/md-first" },
    ],
  },
  {
    title: "Features",
    items: [
      { title: "Commands", href: "/docs/commands" },
      { title: "Slash Commands", href: "/docs/slash-commands" },
      { title: "Squad Workflow", href: "/docs/squad" },
      { title: "Spec Pipeline", href: "/docs/spec" },
      { title: "CI Squad", href: "/docs/ci-squad" },
      { title: "Quality Gates", href: "/docs/quality-gates" },
      { title: "Platform Examples", href: "/docs/platform-examples" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { title: "Monorepo Support", href: "/docs/monorepo" },
      { title: "Enterprise Features", href: "/docs/enterprise-features" },
      { title: "Troubleshooting", href: "/docs/troubleshooting" },
    ],
  },
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
      <div className="h-full py-6 pr-6 lg:py-8">
        <div className="h-full overflow-auto">
          <nav className="grid items-start gap-2">
            {docsNav.map((section) => (
              <div key={section.title} className="pb-4">
                <h4 className="mb-2 px-2 py-1 text-xs font-semibold uppercase tracking-widest text-foreground">{section.title}</h4>
                <div className="grid grid-flow-row auto-rows-max text-sm">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex w-full items-center py-1 transition-colors",
                        pathname === item.href
                          ? "border-l-2 border-primary pl-3 -ml-3.5 font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground px-2",
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}
