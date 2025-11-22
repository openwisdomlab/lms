# CLAUDE.md - AI Assistant Guide for LMS Project

## Project Overview

**Project:** LMS (Learning Management System)
**Organization:** openwisdomlab
**License:** MIT
**Status:** Initial Setup / Greenfield Project

This is a Learning Management System project intended to provide educational platform capabilities. The repository is currently in its initial state and ready for development.

## Current Repository State

The repository is newly initialized with minimal structure:

```
lms/
├── LICENSE          # MIT License (2025 openwisdomlab)
├── README.md        # Project title
└── CLAUDE.md        # This file - AI assistant guide
```

**Note:** No source code, dependencies, or build configuration exists yet. This CLAUDE.md should be updated as the project evolves.

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` (once package.json exists) |
| Run development server | TBD |
| Run tests | TBD |
| Build for production | TBD |
| Lint code | TBD |

## Development Guidelines

### Getting Started

When initializing this project, consider:

1. **Choose a tech stack** - Common LMS stacks include:
   - Frontend: React, Vue, or Next.js
   - Backend: Node.js/Express, Django, or Rails
   - Database: PostgreSQL (recommended for relational data)
   - Authentication: JWT, OAuth 2.0, or session-based

2. **Set up package management** - Create `package.json` or equivalent

3. **Configure development tools**:
   - Linting (ESLint, Prettier)
   - TypeScript (recommended for type safety)
   - Testing framework (Jest, Vitest)
   - Git hooks (husky, lint-staged)

### Code Conventions

When writing code for this project, follow these conventions:

#### General
- Use meaningful, descriptive names for variables, functions, and files
- Keep functions small and focused on a single responsibility
- Write self-documenting code; add comments only for complex logic
- Handle errors gracefully with proper error messages

#### File Organization
- Group related files by feature/domain rather than by type
- Keep test files alongside source files (e.g., `Component.tsx` and `Component.test.tsx`)
- Use index files for clean exports from directories

#### Naming Conventions
- **Files:** kebab-case for general files, PascalCase for components
- **Variables/Functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Classes/Types/Interfaces:** PascalCase
- **Database tables:** snake_case

### Git Workflow

1. **Branch naming:**
   - Features: `feature/description`
   - Bugfixes: `fix/description`
   - Hotfixes: `hotfix/description`

2. **Commit messages:** Use conventional commits format:
   ```
   type(scope): description

   feat: add user authentication
   fix: resolve course enrollment bug
   docs: update API documentation
   test: add unit tests for grading module
   refactor: simplify notification service
   ```

3. **Pull requests:** Include description, test plan, and link to related issues

## LMS Domain Concepts

### Core Entities (Typical)

When building out the LMS, expect these core domain entities:

- **Users** - Students, instructors, administrators with different roles/permissions
- **Courses** - Educational content containers with metadata
- **Lessons/Modules** - Individual learning units within courses
- **Enrollments** - Student-course relationships
- **Assignments** - Graded work submissions
- **Assessments/Quizzes** - Knowledge evaluation tools
- **Grades** - Score tracking and gradebook
- **Progress** - Learning progress tracking
- **Discussions** - Forum/comment functionality
- **Notifications** - User alerts and messaging

### Common Features

- User authentication and authorization (RBAC)
- Course creation and management
- Content delivery (video, text, interactive)
- Assignment submission and grading
- Progress tracking and analytics
- Discussion forums
- Notification system
- Search functionality
- Reporting and analytics

## Testing Guidelines

When tests are implemented:

1. **Unit tests** - Test individual functions and components in isolation
2. **Integration tests** - Test interactions between modules
3. **E2E tests** - Test complete user workflows

### Test Naming
```
describe('ComponentName', () => {
  it('should do something when condition', () => {})
})
```

## Security Considerations

LMS applications handle sensitive data. Follow these practices:

- Never commit secrets, API keys, or credentials
- Use environment variables for configuration
- Implement proper authentication and authorization
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement CSRF protection
- Follow OWASP security guidelines
- Encrypt sensitive data at rest and in transit

## API Design (When Applicable)

If building a REST API:

- Use RESTful conventions (GET, POST, PUT, DELETE)
- Version APIs (e.g., `/api/v1/`)
- Return consistent response formats
- Use appropriate HTTP status codes
- Document endpoints with OpenAPI/Swagger

## Environment Configuration

When setting up environments:

```
.env.example      # Template with dummy values (commit this)
.env.local        # Local development (do not commit)
.env.test         # Test environment
.env.production   # Production (do not commit)
```

## AI Assistant Instructions

When working on this codebase:

1. **Read before modifying** - Always read relevant files before making changes
2. **Follow existing patterns** - Match the style and patterns already in use
3. **Run tests** - Execute tests after making changes (when available)
4. **Keep changes focused** - Make minimal, targeted changes
5. **Update documentation** - Keep this CLAUDE.md updated as the project evolves
6. **Security first** - Never introduce security vulnerabilities

### Common Tasks

#### Adding a New Feature
1. Understand requirements and existing related code
2. Plan the implementation approach
3. Implement with tests
4. Update documentation if needed
5. Ensure all tests pass

#### Fixing a Bug
1. Reproduce and understand the bug
2. Identify the root cause
3. Write a failing test (if applicable)
4. Implement the fix
5. Verify the fix and ensure no regressions

#### Refactoring
1. Ensure comprehensive test coverage exists
2. Make incremental changes
3. Run tests after each change
4. Avoid changing behavior while refactoring

## Dependencies

_No dependencies configured yet. Update this section when package.json is created._

## Architecture

_No architecture defined yet. Update this section as the project structure develops._

Suggested structure for a typical LMS:

```
lms/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components / routes
│   ├── features/        # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── courses/     # Course management
│   │   ├── users/       # User management
│   │   └── ...
│   ├── services/        # API clients, external services
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks (if React)
│   ├── types/           # TypeScript type definitions
│   └── config/          # Configuration files
├── tests/               # Test files (or colocated)
├── public/              # Static assets
├── docs/                # Documentation
└── scripts/             # Build and utility scripts
```

## Troubleshooting

_Add common issues and solutions here as they are discovered._

---

**Last Updated:** 2025-11-22
**Maintainers:** openwisdomlab team
