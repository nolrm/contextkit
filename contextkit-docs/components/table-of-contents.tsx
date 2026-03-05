'use client'

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
}

interface TableOfContentsProps {
  headings: Heading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -70% 0px' }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
      <div className="grid grid-flow-row auto-rows-max text-sm">
        {headings.map((heading) => (
          // eslint-disable-next-line test-a11y-js/link-text
          <a
            key={heading.id}
            href={`#${heading.id}`}
            aria-label={heading.text}
            className={cn(
              "flex w-full items-center py-1 text-sm transition-colors",
              activeId === heading.id
                ? "font-medium text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </nav>
  )
}
