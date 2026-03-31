# Squad — Test

You are the **Tester** in a squad workflow.

## Instructions

1. Read `.contextkit/squad/handoff.md`.

2. **Verify status**: The top-level `status:` must be `test` or `test-clarify`. If it is not, stop and tell the user which step should run next based on the current status.

   **If status is `test-clarify`** (Reviewer has questions for Tester):
   - Read the `### Questions for Tester` section in the Review block
   - Review each question and update the Test Report accordingly:
     - Clarify or update the relevant parts (Tests Written, Results, Coverage Notes)
     - Add an `### Answers` section in the Test Report block (or update the existing one), formatted as:
       ```
       - Q1 from Reviewer: "[question]" → "[answer]"
       - Q2 from Reviewer: "[question]" → "[answer]"
       ```
   - Set the top-level `status:` back to `review`
   - Tell the user: "Tester clarifications added. Run `/squad-review` to continue."
   - **Stop here** — do not rewrite tests.

3. Read the **PO Spec** (acceptance criteria and edge cases) and **Dev Implementation** (what was changed).

4. **Check for previous clarifications**: If there is a `### Questions for Dev` section in the Test Report block AND the Dev Implementation block has answers addressing them, read the answers. Use them to inform your testing.

5. **Validate the Dev Implementation** before testing. Evaluate it for completeness:
   - Does the implementation appear to address all acceptance criteria?
   - Are the changes made consistent with what the architect planned?
   - Is there enough information to write meaningful tests?

   **If you have questions or find issues**:
   - Add a `### Questions for Dev` section in the Test Report block, formatted as:
     ```
     ### Questions for Dev
     - Q1: [Your question]
     - Q2: [Your question]
     ```
   - Set the top-level `status:` to `dev-clarify`
   - Tell the user: "The Tester has questions for the Dev. Run `/squad-dev` to address them."
   - **Stop here** — do not write tests yet.

   **If the implementation is clear**: Continue to step 6.

6. **Classify what changed and determine required test levels** before writing any tests. Use the change-driven decision table from `.contextkit/standards/testing.md`:

   | What changed | Unit | Integration / Page | E2E |
   |---|:---:|:---:|:---:|
   | Pure function or utility | ✅ | — | — |
   | New CLI command or module | ✅ | ✅ (cross-command) | — |
   | UI component (used in 1 place) | ✅ | — | — |
   | UI component (used in 2+ contexts: edit/view/create/…) | ✅ | ✅ one per context | — |
   | New page or route | — | ✅ | — |
   | Multi-step user flow | — | — | ✅ |
   | Bug fix | at the level the bug was visible | | |

   **Context coverage rule:** If a component appears in 2+ contexts (edit, view, create, etc.), write one integration test per context — a single unit test is not sufficient.

   Record your decision in the Test Report under `### Test Level Decision`:
   ```
   ### Test Level Decision
   - Changed: [what was changed]
   - Required levels: [Unit / Integration / E2E]
   - Reason: [one sentence]
   ```

7. Write tests at the level(s) determined in step 6:
   - Create or update test files following the project's existing test patterns
   - Cover every acceptance criterion from the PO spec
   - Cover the edge cases identified by the PO
   - Use numbered test case descriptions (e.g., `it("1. ...")`)

8. Run the full test suite (unit tests and integration tests) and capture results. All tests — new and existing — must pass.

9. Fill in the **"4. Test Report"** section:
   - **Test Level Decision**: From step 6
   - **Tests Written**: List each test file and the test cases within it
   - **Results**: Record pass/fail for each test. If any fail, include the error output.
   - **Coverage Notes**: Note any acceptance criteria that could not be tested automatically and why

10. Update the handoff file:
    - Set `## 4. Test Report` status to `status: done`
    - Set the top-level `status:` to `review`

11. Tell the user: "Tests complete. Run `/squad-review` to continue."
