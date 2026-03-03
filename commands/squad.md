# Squad — Kickoff

You are the **Product Owner** for a squad workflow. The user has provided a task description. Your job is to create the handoff file and write the PO spec.

## Instructions

1. Create the directory `.contextkit/squad/` if it doesn't exist.

2. Create `.contextkit/squad/handoff.md` with the following template, replacing `[TASK]` with the user's task description and `[TIMESTAMP]` with the current date/time:

```markdown
# Squad Handoff

task: [TASK]
status: po
created: [TIMESTAMP]

---

## 1. PO Spec
status: pending

### User Story

### Acceptance Criteria

### Edge Cases

### Out of Scope

### Visual Assets

### Answers

---

## 2. Architect Plan
status: pending

### Approach

### Files to Change

### Trade-offs

### Implementation Steps

---

## 3. Dev Implementation
status: pending

### Changes Made

### Decisions & Deviations

---

## 4. Test Report
status: pending

### Tests Written

### Results

### Coverage Notes

---

## 5. Review
status: pending

### Checklist

### Issues Found

### Verdict
```

3. **Check for clarification mode**: Read the top-level `status:` field.

   **If status is `po-clarify`** (a downstream role has questions for PO):
   - Search for a `### Questions for PO` section in any role's block (Architect Plan, Dev Implementation, Test Report, or Review)
   - Read the questions and update the PO Spec accordingly:
     - Clarify or update the relevant parts of the spec (User Story, Acceptance Criteria, Edge Cases, Out of Scope)
     - Add answers under the `### Answers` section in the PO Spec block, formatted as:
       ```
       - Q1 from [Role]: "[question]" → "[answer]"
       - Q2 from [Role]: "[question]" → "[answer]"
       ```
   - Determine which role asked the questions and set the top-level `status:` back to that role's status:
     - Questions from Architect → set status to `architect`
     - Questions from Reviewer → set status to `review`
   - Tell the user which command to run next (e.g., "PO clarifications added. Run `/squad-architect` to continue.")
   - **Stop here** — do not rewrite the full spec.

   **If status is `po` (normal mode)**: Continue to step 4.

4. Now act as the **Product Owner**. Read the codebase to understand the project, then fill in the **"1. PO Spec"** section:
   - Write a clear **User Story** in "As a [role], I want [feature], so that [benefit]" format
   - Write specific, testable **Acceptance Criteria** as a numbered checklist
   - Identify **Edge Cases** that the dev and tester should handle
   - Define what is **Out of Scope** to prevent scope creep
   - **Check for visual assets** (optional): If the user provided any screenshots or images in this conversation, save each one to `.contextkit/squad/assets/<descriptive-name>.png` and list every saved file path with a one-line description under `### Visual Assets`. If no images were provided, leave `### Visual Assets` empty.

5. After writing the spec, update the handoff file:
   - Set `## 1. PO Spec` status to `status: done`
   - Set the top-level `status:` to `architect`

6. Tell the user: "PO spec complete. Run `/squad-architect` to continue."
