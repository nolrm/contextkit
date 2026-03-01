> **Reference Example** — This file is NOT installed automatically. It shows what `ck analyze` can generate for a React/TypeScript project. Your project gets a blank skeleton — run `ck analyze` to produce content tailored to your actual stack.

# AI Guidelines

## Purpose

Prevent AI hallucinations by providing structured development standards and patterns.

## Core Principles

### 1. Always Check Standards First

- Reference @.contextkit/standards/ before implementing
- Follow established patterns and conventions
- Use provided templates and examples

### 2. Follow Project Patterns

- Use existing component patterns
- Follow established naming conventions
- Maintain consistency with existing code

### 3. Include Proper Testing

- Write tests for all new functionality
- Use numbered test cases (1., 2., 3.)
- Include edge cases and error scenarios

### 4. Ensure Code Quality

- Follow TypeScript strict mode
- Use proper error handling
- Include meaningful comments

### 5. Add Documentation

- Document all public APIs
- Include usage examples
- Update README files

### 6. Use Project Glossary

- Reference @.contextkit/standards/glossary.md for project-specific shortcuts
- Use business term shortcuts for domain concepts
- Use technical term shortcuts for implementation patterns
- Understand your monorepo app structure through shortcuts

## AI Command Usage

### Component Creation

When creating components:

1. Use @.contextkit/templates/component.md as base
2. Follow @.contextkit/standards/code-style.md
3. Include proper TypeScript types
4. Add accessibility attributes
5. Create corresponding test file

### Testing

When adding tests:

1. Use @.contextkit/standards/testing.md patterns
2. Use numbered test cases
3. Include edge cases
4. Use proper mocking with vi.fn()
5. Test accessibility

### Code Style

When writing code:

1. Follow @.contextkit/standards/code-style.md
2. Use consistent naming conventions
3. Include proper TypeScript types
4. Add meaningful comments
5. Follow project structure

## Common Patterns

### React Components

```typescript
// Use this pattern for new components
interface ComponentProps {
  /** Description of prop */
  prop: string;
  /** Optional callback */
  onAction?: () => void;
}

const Component: React.FC<ComponentProps> = ({ prop, onAction }) => {
  return <div>{/* Component content */}</div>;
};

export default Component;
```

### Testing Pattern

```typescript
// Use this pattern for tests
describe("Component", () => {
  it("1. renders correctly with required props", () => {
    // test implementation
  });

  it("2. handles optional props correctly", () => {
    // test implementation
  });

  it("3. handles edge cases", () => {
    // test implementation
  });
});
```

### Error Handling

```typescript
// Use this pattern for error handling
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error("Operation failed:", error);
  throw new Error("User-friendly error message");
}
```

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

### Don't:

- Use `any` type
- Skip error handling
- Write tests without numbered cases
- Ignore accessibility
- Skip documentation
- Use inconsistent naming
- Hardcode values
- Skip type checking

### Do:

- Use strict TypeScript
- Handle all error cases
- Write comprehensive tests
- Include accessibility
- Document everything
- Use consistent patterns
- Use configuration
- Enable type checking
