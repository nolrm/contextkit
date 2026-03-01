> **Reference Example** — This file is NOT installed automatically. It shows what `ck analyze` can generate for a Vitest/React Testing Library project. Your project gets a blank skeleton — run `ck analyze` to produce content tailored to your actual stack.

# Testing Standards

## Testing Philosophy

- Write tests before implementation (TDD)
- Test behavior, not implementation
- Use descriptive test names
- Maintain high test coverage
- Include edge cases and error scenarios

## Test Structure

### Test File Organization

- Place test files next to source files
- Use `.test.ts` or `.test.tsx` extensions
- Group related tests in describe blocks
- Use numbered test cases for clarity

```typescript
// Good
describe("UserCard", () => {
  it("1. renders user information correctly", () => {
    // test implementation
  });

  it("2. handles edit button click", () => {
    // test implementation
  });

  it("3. displays error state when user data is invalid", () => {
    // test implementation
  });
});
```

### Test Naming Convention

- Use descriptive test names
- Include the expected behavior
- Use numbered format for clarity

```typescript
// Good
it("1. should display user name when user data is provided", () => {
  // test implementation
});

it("2. should show loading spinner when user data is loading", () => {
  // test implementation
});

// Bad
it("works", () => {
  // test implementation
});
```

## Testing Tools

### Unit Testing

- Use Vitest for unit tests
- Use React Testing Library for component tests
- Use Jest for utility function tests

```typescript
// Good
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { UserCard } from "./UserCard";

describe("UserCard", () => {
  it("1. renders user name correctly", () => {
    const user = { id: "1", name: "John Doe", email: "john@example.com" };

    render(<UserCard user={user} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
```

### Mocking

- Use vi.fn() for function mocks
- Mock external dependencies
- Use vi.mock() for module mocks

```typescript
// Good
import { vi } from "vitest";

const mockApiCall = vi.fn();
vi.mock("../api", () => ({
  fetchUser: mockApiCall,
}));

describe("UserService", () => {
  it("1. calls API with correct parameters", async () => {
    mockApiCall.mockResolvedValue({ id: "1", name: "John" });

    await fetchUser("1");

    expect(mockApiCall).toHaveBeenCalledWith("1");
  });
});
```

## Component Testing

### Rendering Tests

- Test component renders without errors
- Test props are passed correctly
- Test conditional rendering

```typescript
// Good
describe("Button", () => {
  it("1. renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("2. applies variant class correctly", () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole("button")).toHaveClass("btn-primary");
  });

  it("3. renders as disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Interaction Tests

- Test user interactions
- Test event handlers
- Test state changes

```typescript
// Good
describe("Counter", () => {
  it("1. increments count when increment button is clicked", () => {
    render(<Counter />);

    const incrementButton = screen.getByText("Increment");
    fireEvent.click(incrementButton);

    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });

  it("2. resets count when reset button is clicked", () => {
    render(<Counter />);

    fireEvent.click(screen.getByText("Increment"));
    fireEvent.click(screen.getByText("Reset"));

    expect(screen.getByText("Count: 0")).toBeInTheDocument();
  });
});
```

## Accessibility Testing

### Accessibility Checks

- Test keyboard navigation
- Test screen reader compatibility
- Test ARIA attributes

```typescript
// Good
describe("Modal", () => {
  it("1. focuses on close button when opened", () => {
    render(<Modal isOpen={true} onClose={vi.fn()} />);

    const closeButton = screen.getByLabelText("Close modal");
    expect(closeButton).toHaveFocus();
  });

  it("2. traps focus within modal", () => {
    render(<Modal isOpen={true} onClose={vi.fn()} />);

    const modal = screen.getByRole("dialog");
    expect(modal).toHaveAttribute("aria-modal", "true");
  });
});
```

## Integration Testing

### API Integration

- Test API calls and responses
- Test error handling
- Test loading states

```typescript
// Good
describe("UserService", () => {
  it("1. fetches user data successfully", async () => {
    const mockUser = { id: "1", name: "John Doe" };
    mockApiCall.mockResolvedValue(mockUser);

    const result = await fetchUser("1");

    expect(result).toEqual(mockUser);
    expect(mockApiCall).toHaveBeenCalledWith("1");
  });

  it("2. handles API errors gracefully", async () => {
    mockApiCall.mockRejectedValue(new Error("API Error"));

    await expect(fetchUser("1")).rejects.toThrow("API Error");
  });
});
```

## Test Coverage

### Coverage Goals

- Aim for 80%+ code coverage
- Focus on critical business logic
- Test error paths and edge cases

### Coverage Reports

- Generate coverage reports
- Review uncovered code
- Add tests for critical uncovered areas

```bash
# Run tests with coverage
npm test -- --coverage

# View coverage report
open coverage/index.html
```

## Best Practices

### Test Isolation

- Each test should be independent
- Clean up after each test
- Use beforeEach/afterEach for setup

```typescript
// Good
describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("1. should work independently", () => {
    // test implementation
  });
});
```

### Test Data

- Use realistic test data
- Create test data factories
- Avoid hardcoded values

```typescript
// Good
const createMockUser = (overrides = {}): User => ({
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  ...overrides,
});

describe("UserCard", () => {
  it("1. renders user information", () => {
    const user = createMockUser({ name: "Jane Doe" });
    render(<UserCard user={user} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });
});
```

### Performance Testing

- Test component performance
- Use React Testing Library's performance utilities
- Monitor test execution time

```typescript
// Good
describe("HeavyComponent", () => {
  it("1. renders within acceptable time", () => {
    const start = performance.now();
    render(<HeavyComponent data={largeDataset} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(100); // 100ms threshold
  });
});
```
