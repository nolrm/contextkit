> **Reference Example** — This file is NOT installed automatically. It shows what `/analyze` can generate for a typical project. Your project gets a blank skeleton — run `/analyze` to produce content tailored to your actual workflows.

# Development Workflows

## Git Workflow

### Branch Strategy

- Use feature branches for new features
- Use hotfix branches for critical fixes
- Use release branches for version releases

### Commit Messages

- Use conventional commit format
- Include ticket numbers when applicable
- Write descriptive commit messages

### Code Review Process

- Require at least one reviewer
- Use automated checks for quality
- Focus on code quality and standards

## Development Process

### Feature Development

1. Create feature branch
2. Implement feature with tests
3. Run quality checks
4. Create pull request
5. Address review feedback
6. Merge to main branch

### Bug Fix Process

1. Create hotfix branch
2. Implement fix with tests
3. Run quality checks
4. Create pull request
5. Deploy fix immediately

## Quality Assurance

### Automated Checks

- Type checking with TypeScript
- Linting with ESLint
- Formatting with Prettier
- Testing with Vitest

### Manual Checks

- Code review process
- Manual testing
- Performance testing
- Accessibility testing

## Deployment Process

### Staging Deployment

- Deploy feature branches to staging
- Run integration tests
- Perform manual testing

### Production Deployment

- Deploy from main branch
- Run full test suite
- Monitor deployment health
- Rollback if issues detected
