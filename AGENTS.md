# Agent Guidelines for Stocks Project

This document provides comprehensive guidelines for AI coding agents working on this codebase.

## Project Overview

This is a **Turborepo monorepo** using **Bun** as the package manager. The project consists of:

- `apps/web`: React web application using TanStack Start, Vite, and Tailwind CSS
- `packages/config`: Shared ESLint and TypeScript configurations
- `packages/env`: Environment variable validation using Zod and t3-oss

## Build, Lint, and Test Commands

### Root-Level Commands

```bash
# Development
bun run dev                 # Start all apps in dev mode
bun run dev:web            # Start only the web app

# Build
bun run build              # Build all packages and apps
turbo build                # Same as above

# Type Checking
bun run check-types        # Type check all packages
turbo check-types          # Same as above

# Linting
turbo lint                 # Run ESLint on all packages
```

### Web App Specific Commands

```bash
cd apps/web

# Development
bun run dev                # Start dev server (port 3001)

# Build
bun run build              # Build for production
bun run serve              # Preview production build

# Linting (from root)
turbo lint -F web          # Lint only web app
```

### Running Single Tests

Currently, no test files exist in the project. When tests are added, they would typically use:

```bash
# Example patterns (not yet implemented)
bun test <file-path>       # Run specific test file
bun test --watch           # Watch mode
```

### Package Management

```bash
bun install                # Install dependencies
bun add <package>          # Add dependency to root
bun add <package> -D       # Add dev dependency
bun add <package> -F web   # Add to specific workspace
```

## Code Style Guidelines

### Import Ordering

**CRITICAL**: Imports MUST be sorted with newlines between groups (enforced by `perfectionist/sort-imports`):

```typescript
// 1. Type imports first
import type { ClassValue } from 'clsx'
import type { ComponentProps } from 'react'

// 2. External packages (alphabetically)
import { clsx } from 'clsx'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

// 3. Absolute imports from project (with @/ prefix)
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 4. Relative imports
import { helper } from '../utils'
import styles from './styles.css'
```

### Formatting

- **Prettier** configuration:
  - Single quotes: `'string'`
  - No semicolons
  - Use `.prettierrc` at root

### TypeScript

**Strict Configuration**:

- `strict: true` - All strict checks enabled
- `noUncheckedIndexedAccess: true` - Array/object access returns `T | undefined`
- `noUnusedLocals: true` - No unused variables
- `noUnusedParameters: true` - No unused function parameters
- `verbatimModuleSyntax: true` - Explicit type imports required
- `noFallthroughCasesInSwitch: true` - Switch statements must handle all cases

**Type Practices**:

```typescript
// Use type imports
import type { User } from './types'

// Prefer interface for objects, type for unions/intersections
interface Props {
  name: string
  age: number
}

type Status = 'active' | 'inactive'

// Always handle potential undefined from indexed access
const users: User[] = []
const firstUser = users[0] // Type: User | undefined
if (firstUser) {
  // Safe to use firstUser here
}
```

### Naming Conventions

- **Files**:
  - Components: `kebab-case.tsx` (e.g., `theme-switcher.tsx`)
  - Utilities: `kebab-case.ts` (e.g., `is-browser.ts`)
  - Routes: TanStack Router conventions (e.g., `__root.tsx`, `_authenticated/route.tsx`)
- **Components**: PascalCase

  ```tsx
  export default function Header() {}
  export function ThemeSwitcher() {}
  ```

- **Functions/Variables**: camelCase

  ```typescript
  export function getKiteLoginUrl() {}
  const clientEnv = env.VITE_API_KEY
  ```

- **Constants**: UPPER_SNAKE_CASE for true constants

  ```typescript
  const MAX_RETRIES = 3
  ```

### React Patterns

```tsx
// Default export for page components/routes
export default function HomePage() {
  return <div>Home</div>
}

// Named exports for reusable components
export function Button({ children }: ComponentProps) {
  return <button>{children}</button>
}

// Use function declarations, not arrow functions for components
// Good
export function MyComponent() {}

// Avoid
export function MyComponent() {}
```

### Tailwind CSS

- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow `eslint-plugin-better-tailwindcss` rules
- Multi-line className with template literals for readability:

```tsx
<div
  className={`
    container mx-auto flex flex-row items-center justify-between px-6 py-4
  `}
/>
```

- Sometimes the multiline rule of `eslint-plugin-better-tailwindcss` conflicts with `prettier` rules which leads to an infinite loop of fixing formatting, then linting. If that occurs, disable prettier for that particular line.

### Error Handling

- Use Zod for runtime validation (environment variables, API responses)
- Handle errors explicitly, avoid empty catch blocks
- Prefer specific error types over generic Error

```typescript
// Environment validation
export const serverEnv = createEnv({
  server: {
    API_KEY: z.string().nonempty(),
  },
  runtimeEnv: process.env,
})

// Error handling
try {
  await riskyOperation()
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle specific error
  }
  throw error // Re-throw if not handled
}
```

### File Organization

```txt
apps/web/src/
├── components/     # Reusable UI components
│   └── ui/        # shadcn/ui components
├── contexts/      # React contexts
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── routes/        # TanStack Router routes
└── server/        # Server-side code
```

### Environment Variables

- Use `@stocks/env` package for type-safe environment variables
- Server-only vars in `packages/env/src/server.ts`
- Client vars (VITE\_ prefix) in `packages/env/src/web.ts`
- Never commit `.env` files

### ESLint Rules

Key enforced rules:

- `perfectionist/sort-imports` - Sorted imports with newlines between groups
- `react-refresh/only-export-components` - Off for UI components
- `node/prefer-global/process` - Off (use process.env freely)
- `better-tailwindcss/no-unregistered-classes` - Error on invalid Tailwind classes

### Commit Messages

**CRITICAL**: All commit messages MUST follow Conventional Commit specifications with gitmoji:

```bash
# Format: <gitmoji> <type>(<scope>): <description>
# Example: ✨ feat(web): add user authentication

# Use gitmoji CLI to add relevant emoji
gitmoji -c feat(web): add user authentication

# Types: feat, fix, docs, style, refactor, test, chore
# Scopes: web, env, config, or specific component names
```

**Conventional Commit Rules**:

- Use `gitmoji` CLI to add relevant emoji at start
- Format: `<type>(<scope>): <description>`
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style/formatting (no logic changes)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks, dependencies
- Description should be imperative mood ("add" not "added")
- Keep under 72 characters total

### Generated Files

- `**/*.gen.ts` files are auto-generated (e.g., `routeTree.gen.ts`)
- Ignored by ESLint
- Do not manually edit these files

## Additional Notes

- Use **Bun** runtime, not Node.js or npm
- Turborepo handles caching and parallel execution
- TanStack Router handles routing with file-based conventions
- Vite is the build tool (dev server on port 3001)
- React 19+ is used (new features available)
