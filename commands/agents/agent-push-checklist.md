# Agent Push Checklist

Run this checklist before every `git push`. Quality gates will run the same checks — this catches them before the gate blocks you.

---

## Before You Push

### 1. Code Style
- [ ] Naming follows `code-style.md` conventions (classes PascalCase, methods camelCase, files kebab-case)
- [ ] No tabs — indentation is 2 spaces
- [ ] Single quotes for strings (or project-specific convention from `code-style.md`)
- [ ] Module pattern matches project conventions (`require`/`module.exports` or `import`/`export` — not mixed)

### 2. Tests
- [ ] New behaviour has a corresponding test
- [ ] Tests use numbered descriptions: `it('1. does the thing', ...)`
- [ ] Tests pass locally (or are expected to fail on a WIP branch — see note below)
- [ ] No `console.log` or debug output in test files

### 3. Commit Message
- [ ] Follows Conventional Commits: `type(scope): description`
- [ ] Type is one of: `feat`, `fix`, `improve`, `docs`, `chore`, `refactor`, `test`
- [ ] Description is in lowercase and at least 10 characters
- [ ] No period at the end

### 4. No Debug Leftovers
- [ ] No `console.log`, `print`, `debugger`, or equivalent debug statements
- [ ] No commented-out code blocks left in
- [ ] No `TODO` comments without a linked issue or ticket

### 5. Standards Compliance
- [ ] Code does not contradict rules in `ai-guidelines.md`
- [ ] If you added a new pattern that appears 3+ times, consider `/standards-aware` to document it

---

## Notes

**WIP branches:** Test failures are acceptable on feature branches if tests are intentionally incomplete. Code style and commit format are always required regardless of branch.

**Docs-only changes:** Test requirement is waived if no code was written or changed.

**Do not use `git push --no-verify`** to bypass failing gates. Fix the issue instead.
