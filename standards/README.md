# ContextKit Standards

> Get the right vibe for your code

## ⚠️ These Are Living Documents

**This is not set-and-forget!** 

After running `contextkit analyze`, **manually review and edit** these files to match YOUR project:

- **Fine-tune** the AI-generated content to your actual needs
- **Remove** what doesn't apply to your project  
- **Add** project-specific patterns and conventions
- **Update** as your project evolves and patterns change

Treat these files as **living documentation** that grows with your project.

## Quick Reference

### Module / Component Development

- Follow your project's established component or module pattern
- Keep units focused and small — one responsibility per file
- Include proper types and documentation
- Ensure accessibility compliance where applicable

### Testing

- Write tests before implementation (TDD)
- Use descriptive, numbered test names (`1.`, `2.`, `3.`)
- Include edge cases and error scenarios
- Maintain high test coverage

### Code Style

- Use consistent naming conventions
- Follow project-specific formatting rules
- Write self-documenting code
- Include meaningful comments

### Documentation

- Document all public APIs
- Include usage examples
- Keep README files updated
- Document architectural decisions

## Standards

- `@.contextkit/standards/code-style.md` - Code style guide
- `@.contextkit/standards/testing.md` - Testing patterns
- `@.contextkit/standards/architecture.md` - Architecture patterns
- `@.contextkit/standards/ai-guidelines.md` - AI development guidelines
- `@.contextkit/standards/workflows.md` - Development workflows and processes
- `@.contextkit/standards/glossary.md` - **Project terminology and domain glossary**

## Commands

- `@.contextkit/commands/analyze.md` - **Analyze and customize standards for your project**
- `@.contextkit/commands/create-component.md` - Create new component
- `@.contextkit/commands/create-feature.md` - Create new feature
- `@.contextkit/commands/run-tests.md` - Run test suite
- `@.contextkit/commands/quality-check.md` - Quality check
- `@.contextkit/commands/add-documentation.md` - Add documentation

## Templates

- `.contextkit/templates/component.md` - Component/module template
- `.contextkit/templates/test.md` - Test file template
- `.contextkit/templates/story.md` - Story/demo template
- `.contextkit/templates/hook.md` - Hook/composable/helper template
- `.contextkit/templates/api.md` - API service/client template

## AI Guidelines

- Always check standards first
- Follow project patterns
- Include proper testing
- Ensure code quality
- Add documentation
