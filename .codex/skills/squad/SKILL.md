---
name: squad
description: Squad pipeline kickoff — create handoff file and write PO spec
---

Read `.contextkit/commands/squad/squad.md` and execute the squad kickoff workflow.

Create the handoff file and write the PO spec for the given task. Pass the task description as input.

After kickoff, run `$squad-auto` to run the full pipeline hands-free, or step through manually with `$squad-architect` → `$squad-dev` → `$squad-test` → `$squad-review` → `$squad-doc`.
