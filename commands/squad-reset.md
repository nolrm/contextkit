# Squad — Reset

Delete the current squad state so you can start fresh.

## Instructions

1. Check if `.contextkit/squad/` exists.

   - **If it does not exist:** Tell the user: "Nothing to reset — no squad state found." Stop here.

2. Read what's inside before deleting:
   - If `manifest.md` exists, read `total:` and list the task descriptions from `## Tasks`.
   - If `handoff.md` exists, read the `task:` field.
   - Note any tasks that are not `status: done`.

3. Delete `.contextkit/squad/` and everything inside it.

4. Tell the user what was cleared. For example:

   > Squad state cleared.
   >
   > **Removed:** `.contextkit/squad/` (2 tasks — "Add login page", "Fix nav bug")
   >
   > Run `/squad 'your task'` to start fresh.

   If any tasks were not `done`, mention them:

   > ⚠️ Note: 1 task was still in progress ("Fix nav bug" — status: dev). It has been removed.

## Notes

- This is a hard delete — no backup is created. If you need to recover, check git history.
- To archive instead of delete, rename the folder manually: `.contextkit/squad-archive-[date]/`
