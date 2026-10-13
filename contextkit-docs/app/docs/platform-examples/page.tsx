'use client'

import React, { useEffect } from "react"
import Link from "next/link"
import { Terminal, Monitor, Code, Sparkles, Bot, CheckCircle2, Zap, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"

export default function PlatformExamplesPage() {
  const headings = [
    { id: 'cursor', text: 'Cursor' },
    { id: 'vscode', text: 'VS Code' },
    { id: 'claude', text: 'Claude CLI' },
    { id: 'codex', text: 'Codex CLI' },
    { id: 'opencode', text: 'OpenCode' },
    { id: 'continue', text: 'Continue.dev' },
    { id: 'aider', text: 'Aider' },
    { id: 'gemini', text: 'Gemini CLI' },
    { id: 'windsurf', text: 'Windsurf' },
  ];

  useEffect(() => {
    // Render TOC in right sidebar
    const tocContainer = document.getElementById('toc-container')
    if (tocContainer) {
      tocContainer.innerHTML = `
        <nav class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
          <div class="grid grid-flow-row auto-rows-max text-sm">
            ${headings.map(h => `
              <a
                href="#${h.id}"
                class="flex w-full items-center py-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ${h.text}
              </a>
            `).join('')}
          </div>
        </nav>
      `
    }
  }, [headings])

  return (
    <div className="space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Features</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-primary font-medium">Platform Examples</span>
      </nav>

        <div className="space-y-3">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Platform Examples</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Step-by-step examples for using ContextKit with Claude Code, Codex, Cursor, Copilot, Gemini CLI, OpenCode, Aider, Continue, and Windsurf. Every integration writes the same canonical <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">AGENTS.md</code>; each tool then imports it, reads it directly, or gets a copy of the same body.
          </p>
        </div>

        <div className="space-y-6 pt-4">
        {/* Cursor */}
        <div id="cursor" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Code className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Cursor</h2>
              <p className="text-sm text-muted-foreground">Automatic context loading</p>
            </div>
          </div>

          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 mb-4">
            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">✅ Zero Configuration Required</p>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/rules/contextkit-standards.mdc</code> (<code className="rounded bg-muted px-1 font-mono text-xs">alwaysApply: true</code>) points Cursor at <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> and <code className="rounded bg-muted px-1 font-mono text-xs">index.md</code>. Topic standards load from path-scoped <code className="rounded bg-muted px-1 font-mono text-xs">contextkit-&lt;name&gt;.mdc</code> rules (<code className="rounded bg-muted px-1 font-mono text-xs">globs:</code>) only when you touch matching files.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit cursor</code> to add Cursor integration. It writes the rules above plus the five skills to <code className="rounded bg-muted px-1 font-mono text-xs">.cursor/prompts/</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.agents/skills/</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Basic Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Cursor AI chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  Create a login button using btn pattern
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Skills</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Cursor AI chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  /ck setup
                </code>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4 mt-2">
                <li><code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/doc</code> — update docs affected by this branch</li>
                <li><code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/learn</code> — turn a correction into a rule</li>
                <li><code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">/goal</code> — run a long task against a goal file</li>
              </ul>
            </div>
          </div>
        </div>

        {/* VS Code */}
        <div id="vscode" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">VS Code + GitHub Copilot</h2>
              <p className="text-sm text-muted-foreground">copilot-instructions.md + path-scoped instructions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground mb-2">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit copilot</code> (or <code className="rounded bg-muted px-1 font-mono text-xs">contextkit vscode</code>). It writes <code className="rounded bg-muted px-1 font-mono text-xs">.github/copilot-instructions.md</code> with the same body as <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, plus path-scoped <code className="rounded bg-muted px-1 font-mono text-xs">.github/instructions/contextkit-&lt;name&gt;.instructions.md</code> files (<code className="rounded bg-muted px-1 font-mono text-xs">applyTo:</code>) rendered from <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Extra context: Mention the Folder</h3>
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Copilot Chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm font-bold text-green-600 dark:text-green-400">
                  @.contextkit Create a login button
                </code>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Usually not needed — copilot-instructions.md is loaded automatically. Useful when you want every standards file in one prompt.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Alternative: Mention Subfolders</h3>
              <div className="space-y-2">
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                    @.contextkit/standards Create a login button
                  </code>
                  <p className="text-xs text-muted-foreground mt-2 italic">Standards only (no templates)</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                    @.contextkit/standards/glossary.md @.contextkit/standards/code-style.md Create a login button
                  </code>
                  <p className="text-xs text-muted-foreground mt-2 italic">Specific files</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claude CLI */}
        <div id="claude" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Claude Code</h2>
              <p className="text-sm text-muted-foreground">CLAUDE.md imports AGENTS.md</p>
            </div>
          </div>

          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 mb-4">
            <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Auto-Loaded Context</p>
            <p className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> imports <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/standards/index.md</code> every session. Topic standards load from path-scoped <code className="rounded bg-muted px-1 font-mono text-xs">.claude/rules/</code> files only when you touch matching files.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit claude</code> to set up Claude integration. This writes <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, a <code className="rounded bg-muted px-1 font-mono text-xs">CLAUDE.md</code> that imports it, path-scoped <code className="rounded bg-muted px-1 font-mono text-xs">.claude/rules/</code>, and the five skills in <code className="rounded bg-muted px-1 font-mono text-xs">.claude/skills/</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">What CLAUDE.md contains</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In CLAUDE.md</span>
                </div>
                <pre className="rounded bg-muted px-4 py-2 font-mono text-sm whitespace-pre-wrap">{`@AGENTS.md
@.contextkit/standards/index.md

Claude Code: skills run as /ck, /doc, /learn, /goal, /headline. ...`}</pre>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Claude Code reads AGENTS.md on its own only when there is no CLAUDE.md — the import keeps one source of truth.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Path-scoped rules</h3>
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><strong>Source:</strong> <code className="rounded bg-muted px-1 font-mono text-xs">context_rules</code> in <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/config.yml</code></li>
                  <li><strong>Output:</strong> <code className="rounded bg-muted px-1 font-mono text-xs">.claude/rules/contextkit-&lt;name&gt;.md</code> with <code className="rounded bg-muted px-1 font-mono text-xs">paths:</code> frontmatter</li>
                  <li><strong>Fixed in 2.0:</strong> older rule files used <code className="rounded bg-muted px-1 font-mono text-xs">globs:</code>, which Claude Code ignores, so they loaded every session</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Verify it works</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Claude Code</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  /context
                </code>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Check that AGENTS.md and index.md appear in the loaded context list. First time triggers an approval dialog for @imports. Run ck check --context to flag stale references or an oversized always-loaded context.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  claude "create [your-feature] for [your-entity]"
                </code>
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Standards are already loaded — no need to tell Claude to read them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Codex CLI */}
        <div id="codex" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">OpenAI Codex CLI</h2>
              <p className="text-sm text-muted-foreground">Reads AGENTS.md, skills as $name</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit codex</code> to set up Codex integration. Codex reads <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code> automatically. Skills go to <code className="rounded bg-muted px-1 font-mono text-xs">.codex/skills/</code> and the portable <code className="rounded bg-muted px-1 font-mono text-xs">.agents/skills/</code>, and run as <code className="rounded bg-muted px-1 font-mono text-xs">$ck</code>, <code className="rounded bg-muted px-1 font-mono text-xs">$doc</code>, <code className="rounded bg-muted px-1 font-mono text-xs">$learn</code>, <code className="rounded bg-muted px-1 font-mono text-xs">$goal</code>, <code className="rounded bg-muted px-1 font-mono text-xs">$headline</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  codex "create a button component"
                </code>
              </div>
            </div>

          </div>
        </div>

        {/* OpenCode */}
        <div id="opencode" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">OpenCode</h2>
              <p className="text-sm text-muted-foreground">Auto-loads AGENTS.md</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit opencode</code> to set up OpenCode integration. OpenCode auto-loads <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, which points it at <code className="rounded bg-muted px-1 font-mono text-xs">index.md</code> and the topic standards.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  opencode "create a button component"
                </code>
              </div>
            </div>

          </div>
        </div>

        {/* Continue.dev */}
        <div id="continue" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Continue.dev</h2>
              <p className="text-sm text-muted-foreground">Automatic context loading</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit continue</code> to add Continue integration. It writes <code className="rounded bg-muted px-1 font-mono text-xs">.continue/rules/contextkit-standards.md</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.continue/config.yaml</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Continue chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  Create a login button using project standards
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Aider */}
        <div id="aider" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Aider</h2>
              <p className="text-sm text-muted-foreground">CONVENTIONS.md</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit aider</code> to add Aider integration. It writes <code className="rounded bg-muted px-1 font-mono text-xs">CONVENTIONS.md</code> with the same body as <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, plus <code className="rounded bg-muted px-1 font-mono text-xs">.aider/rules.md</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  aider "Create a login button. Follow .contextkit/standards/code-style.md"
                </code>
              </div>
            </div>

          </div>
        </div>

        {/* Gemini CLI */}
        <div id="gemini" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Google Gemini CLI</h2>
              <p className="text-sm text-muted-foreground">GEMINI.md imports AGENTS.md</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit gemini</code>. It writes <code className="rounded bg-muted px-1 font-mono text-xs">GEMINI.md</code> — a short pointer plus <code className="rounded bg-muted px-1 font-mono text-xs">@AGENTS.md</code> — which Gemini CLI loads automatically.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Terminal</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  gemini "create a button component"
                </code>
              </div>
            </div>

          </div>
        </div>

        {/* Windsurf */}
        <div id="windsurf" className="rounded-lg border bg-card p-6 scroll-mt-20 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">Windsurf</h2>
              <p className="text-sm text-muted-foreground">Automatic context loading</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Setup</h3>
              <p className="text-sm text-muted-foreground">
                If <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit</code> exists, run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit windsurf</code> to add Windsurf integration. It writes <code className="rounded bg-muted px-1 font-mono text-xs">.windsurfrules</code> with the same body as <code className="rounded bg-muted px-1 font-mono text-xs">AGENTS.md</code>, plus <code className="rounded bg-muted px-1 font-mono text-xs">.windsurf/rules/contextkit-standards.md</code>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Usage</h3>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">In Windsurf AI chat</span>
                </div>
                <code className="block rounded bg-muted px-4 py-2 font-mono text-sm">
                  Create a login button using project standards
                </code>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Windsurf automatically loads all ContextKit rules from <code className="rounded bg-muted px-1 font-mono text-xs">.windsurfrules</code> and <code className="rounded bg-muted px-1 font-mono text-xs">.windsurf/rules/contextkit-standards.md</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">👥 Multi-Team Workflow</p>
            <p className="text-sm text-muted-foreground mb-2">
              Perfect for teams where members use different AI tools. Share the <code className="rounded bg-muted px-1 font-mono text-xs">.contextkit/</code> directory, and each team member adds their specific integration:
            </p>
            <div className="space-y-1 text-xs text-muted-foreground font-mono">
              <div>Person 1: <code className="rounded bg-muted px-1">contextkit install cursor</code></div>
              <div>Person 2 (Cursor): <code className="rounded bg-muted px-1">contextkit cursor</code></div>
              <div>Person 3 (VS Code): <code className="rounded bg-muted px-1">contextkit vscode</code></div>
              <div>Person 4 (Claude): <code className="rounded bg-muted px-1">contextkit claude</code></div>
              <div>Person 5 (Gemini): <code className="rounded bg-muted px-1">contextkit gemini</code></div>
              <div>Person 6 (Codex): <code className="rounded bg-muted px-1">contextkit codex</code></div>
              <div>Person 7 (OpenCode): <code className="rounded bg-muted px-1">contextkit opencode</code></div>
              <div>Person 8 (Windsurf): <code className="rounded bg-muted px-1">contextkit windsurf</code></div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium mb-1">✨ Choose Your Tool</p>
            <p className="text-sm text-muted-foreground">
              During <code className="rounded bg-muted px-1 font-mono text-xs">ck install</code>, you choose which AI tool to configure — or specify it directly: <code className="rounded bg-muted px-1 font-mono text-xs">ck install claude</code>. Run <code className="rounded bg-muted px-1 font-mono text-xs">contextkit status</code> to see installed integrations.
            </p>
          </div>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/quality-gates"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowLeft className="h-3.5 w-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Previous</div>
            <div className="text-sm font-medium">Quality Gates</div>
          </div>
        </Link>

        <Link
          href="/docs/monorepo"
          className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next</div>
            <div className="text-sm font-medium">Monorepo Support</div>
          </div>
          <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </Link>
      </div>

    </div>
  )
}
