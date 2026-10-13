---
description: Short, result-first replies, always on — adds the headline response-style block to your instructions file
argument-hint: '[off | pause]'
allowed-tools: Read, Edit, Write, Glob
effort: low
---

# Headline

Short, result-first replies — always on. Works with or without ContextKit installed.

## Usage

```
/headline          # turn on (asks where)
/headline off      # turn off
/headline pause    # off for this session only
```

## Turn On

1. Ask where it should apply (use your multiple-choice question tool if you have one; otherwise list lettered options):
   - **This project** → the project's always-loaded instructions file: `AGENTS.md` (create if missing). If a `CLAUDE.md` exists and does not import `@AGENTS.md`, also add the block to `CLAUDE.md`.
   - **All my projects** → `~/.claude/CLAUDE.md` (Claude Code) and/or `~/.codex/AGENTS.md` (Codex).
2. Write the block below at the end of each chosen file, exactly as shown, markers included. If the markers already exist, replace what's between them.
3. Follow these rules from now on in this session.
4. Reply with one line: where it was added.

## Turn Off

- `off` → delete everything from `<!-- headline:start -->` to `<!-- headline:end -->` (inclusive) in the files above. Leave the rest of each file untouched.
- `pause` → don't edit files; ignore the rules for the rest of this session.

## The Block

```markdown
<!-- headline:start -->
## Response Style (headline)

- Lead with the result or answer.
- Don't narrate reasoning or recap what you did.
- Plain sentences; tables only when comparing.
- Ask with options, not open-ended questions.
- Say plainly when something failed or was skipped.
- Code, commands, and paths stay complete — only prose gets shorter.
<!-- headline:end -->
```

## Notes

- The point is faster-to-read replies, not token savings — output is a small share of cost.
- Keep sentences readable. This is not "caveman" style: grammar stays, filler goes.

