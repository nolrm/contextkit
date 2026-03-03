> **Reference Example** — This file is NOT installed automatically. It shows what `/analyze` can generate for a React/Redux project. Your project gets a blank skeleton — run `/analyze` to produce content tailored to your actual stack.

# Architecture Patterns

## Project Structure

### Monorepo Organization

- Use workspace-based monorepo structure
- Separate packages for shared utilities
- Independent applications with shared dependencies

### Component Architecture

- Follow atomic design principles
- Use composition over inheritance
- Implement proper separation of concerns

### State Management

- Use React Context for local state
- Use Redux for global state
- Use SWR for server state

## Design Patterns

### Component Patterns

- Higher-order components for cross-cutting concerns
- Render props for flexible component composition
- Custom hooks for reusable logic

### Error Handling

- Use error boundaries for component trees
- Implement proper error logging
- Provide user-friendly error messages

### Performance Patterns

- Use React.memo for expensive components
- Implement code splitting with lazy loading
- Use virtualization for large lists

## Best Practices

### Code Organization

- Group related files together
- Use barrel exports for clean imports
- Separate concerns into different modules

### API Design

- Use consistent naming conventions
- Implement proper error handling
- Include comprehensive documentation

### Testing Strategy

- Write unit tests for utilities
- Write integration tests for components
- Write E2E tests for user flows
