# ContextKit Rules for Aider

## Project Standards

- Follow: @.contextkit/standards/code-style.md
- Testing: @.contextkit/standards/testing.md
- Guidelines: @.contextkit/standards/ai-guidelines.md
- Architecture: @.contextkit/standards/architecture.md

## Component Patterns

- Use: @.contextkit/templates/component.md
- Tests: @.contextkit/templates/test.md

## Type Safety

- Use: @.contextkit/types/strict.tsconfig.json
- Global types: @.contextkit/types/global.d.ts

## Always Include

When creating new code, always:

1. Follow TypeScript strict mode
2. Include proper error handling
3. Add comprehensive tests with numbered cases (1., 2., 3.)
4. Follow project naming conventions
5. Include proper TypeScript types
6. Add meaningful comments
7. Ensure accessibility (a11y) compliance

## Quality Checklist

Before submitting code, ensure:

- [ ] Follows @.contextkit/standards/code-style.md
- [ ] Includes proper TypeScript types
- [ ] Has comprehensive tests with numbered cases
- [ ] Includes error handling
- [ ] Has proper documentation
- [ ] Passes type checking
- [ ] Passes linting
- [ ] Includes accessibility features

## Anti-Patterns to Avoid

- Don't use `any` type
- Don't skip error handling
- Don't write tests without numbered cases
- Don't ignore accessibility
- Don't skip documentation

## Quick Commands

- "Create component" → Create new component following standards
- "Add tests" → Add comprehensive test coverage
- "Fix styling" → Apply project styling patterns
- "Add documentation" → Add proper documentation
