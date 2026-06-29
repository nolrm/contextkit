# Squad Go — Express Pipeline

You are running the **express squad pipeline**: full kickoff with automatic pipeline execution, no checkpoint pause.

---

## What to do

Follow **all steps** in `.contextkit/commands/squad/squad.md` with these two differences:

### Difference 1 — Config

When writing `.contextkit/squad/config.md`, use:

```markdown
# Squad Config

checkpoint: none
model_routing: false
```

instead of `checkpoint: po`. This tells squad-auto to run all the way through without pausing.

### Difference 2 — Auto-run after specs

After all PO specs are written and every handoff `status:` is set to `architect`:

Announce:
> PO specs complete ([N] task(s)). Starting the pipeline now — no checkpoint.

Then immediately follow all instructions in `.contextkit/commands/squad/squad-auto.md` to run the full pipeline (architect → dev → test → review → doc). Do not wait for user input between phases.

---

All other behavior is identical to `/squad`: Step 0 guard, conversation extraction, clarification gate, single-task vs batch mode, handoff writing, and clarification flows all work the same way.

Use `/squad` instead if you want to review PO specs before the pipeline starts.
