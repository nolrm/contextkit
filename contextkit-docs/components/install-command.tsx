"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

const INSTALL_CMD = "npm install -g @nolrm/contextkit"

export function InstallCommand() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(INSTALL_CMD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 shadow-lg font-mono text-sm">
      <span className="text-primary select-none">$</span>
      <span className="text-foreground/80 flex-1">{INSTALL_CMD}</span>
      <button
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground transition-colors ml-2"
        aria-label="Copy install command"
      >
        {copied ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}
