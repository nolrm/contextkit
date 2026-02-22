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
      <p className="font-medium text-sm mb-3">On this page</p>
      <div className="grid grid-flow-row auto-rows-max text-sm">
        {headings.map((heading) => (
          // eslint-disable-next-line test-a11y-js/link-text
          <a
            key={heading.id}
            href={`#${heading.id}`}
            aria-label={heading.text}
            className={cn(
              "group flex w-full items-center rounded-md border border-transparent px-2 hover:underline text-sm",
              activeId === heading.id 
                ? "font-medium text-foreground" 
                : "text-muted-foreground"
            )}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </nav>
  )
}
