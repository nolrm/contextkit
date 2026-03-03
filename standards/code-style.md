> **Reference Example** — This file is NOT installed automatically. It shows what `/analyze` can generate for a React/TypeScript project. Your project gets a blank skeleton — run `/analyze` to produce content tailored to your actual stack.

# Code Style Guide

## General Principles

- Write self-documenting code
- Use consistent naming conventions
- Follow project-specific formatting rules
- Include meaningful comments

## Naming Conventions

### Variables and Functions

- Use camelCase for variables and functions
- Use descriptive names that explain purpose
- Avoid abbreviations unless commonly understood

```typescript
// Good
const userAccountBalance = 1000;
const calculateTotalPrice = (items: Item[]) => {
  /* ... */
};

// Bad
const uab = 1000;
const calc = (items: Item[]) => {
  /* ... */
};
```

### Components

- Use PascalCase for component names
- Use descriptive names that indicate purpose
- Include component type in name when helpful

```typescript
// Good
const UserProfileCard = () => {
  /* ... */
};
const DataTable = () => {
  /* ... */
};

// Bad
const Card = () => {
  /* ... */
};
const Table = () => {
  /* ... */
};
```

### Constants

- Use SCREAMING_SNAKE_CASE for constants
- Group related constants together

```typescript
// Good
const API_BASE_URL = "https://api.example.com";
const MAX_RETRY_ATTEMPTS = 3;

// Bad
const apiBaseUrl = "https://api.example.com";
const maxRetryAttempts = 3;
```

## File Organization

### Import Order

1. External libraries
2. Internal modules
3. Relative imports
4. Type imports

```typescript
// Good
import React from "react";
import { Button } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { User } from "../types/User";
```

### Export Style

- Use named exports for utilities
- Use default exports for components
- Export types separately

```typescript
// Good
export const formatDate = (date: Date) => {
  /* ... */
};
export default UserProfile;
export type { User, UserRole };
```

## TypeScript Guidelines

### Type Definitions

- Use interfaces for object shapes
- Use types for unions and computed types
- Avoid `any` type

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

type Status = "loading" | "success" | "error";

// Bad
const user: any = {
  /* ... */
};
```

### Function Signatures

- Include return types for public functions
- Use generic types when appropriate
- Document complex type relationships

```typescript
// Good
const fetchUser = async (id: string): Promise<User> => {
  // implementation
};

const createApiClient = <T>(baseUrl: string): ApiClient<T> => {
  // implementation
};
```

## React Guidelines

### Component Structure

- Use functional components
- Use hooks for state management
- Keep components focused and small

```typescript
// Good
const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  return <div className="user-card">{/* component content */}</div>;
};
```

### Props Interface

- Define clear prop interfaces
- Use optional props appropriately
- Include JSDoc comments for complex props

```typescript
// Good
interface UserCardProps {
  /** User data to display */
  user: User;
  /** Callback when user is edited */
  onEdit?: (user: User) => void;
  /** Additional CSS classes */
  className?: string;
}
```

## Error Handling

### Error Boundaries

- Use error boundaries for component trees
- Provide meaningful error messages
- Log errors for debugging

```typescript
// Good
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <div>Something went wrong. Please try again.</div>;
  }

  return children;
};
```

### Async Error Handling

- Handle errors in async operations
- Provide user-friendly error messages
- Use proper error types

```typescript
// Good
const fetchUser = async (id: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Unable to load user data");
  }
};
```

## Performance Guidelines

### Memoization

- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for event handlers

```typescript
// Good
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map((item) => processItem(item));
  }, [data]);

  const handleClick = useCallback(() => {
    // handle click
  }, []);

  return <div onClick={handleClick}>{/* content */}</div>;
});
```

### Bundle Optimization

- Use dynamic imports for large components
- Avoid importing entire libraries
- Use tree shaking effectively

```typescript
// Good
const HeavyComponent = lazy(() => import("./HeavyComponent"));

// Bad
import * as _ from "lodash";
```
