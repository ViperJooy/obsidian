# AGENTS.md

## Project Overview
This is a React + TypeScript application using Vite as the build tool. It appears to be an Emby client interface with features for browsing movies, series, music, and live TV.

## Build & Development Commands

```bash
# Start development server (port 3000, accessible on all interfaces)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean build artifacts
npm run clean

# Type checking (no emit)
npm run lint
```

## Testing

No test framework is currently configured. If adding tests, prefer Vitest (since the project uses Vite). Run tests with:
```bash
npx vitest run
npx vitest run path/to/test.test.ts  # single test file
```

## Code Style Guidelines

### Imports
- Order: React imports first, then third-party libraries, then local imports, finally CSS.
- Use semicolons at the end of import statements.
- Use named imports where possible: `import { useState, useEffect } from 'react'`.
- Use `import React from 'react'` only when needed for JSX transformation (older React versions).

### Formatting
- Use semicolons at the end of statements.
- Use single quotes for strings.
- Use 2-space indentation.
- Prefer arrow functions for component definitions.
- Use TypeScript's `!` non-null assertion operator sparingly, only when certain a value is not null.

### TypeScript
- Enable strict mode (implied by tsconfig.json settings).
- Use path aliases: `@/*` maps to `./src/*`.
- Use explicit types for function parameters and return types when not obvious.
- Prefer `interface` for object shapes, `type` for unions/intersections.

### Naming Conventions
- **Files**: Use PascalCase for component files (`Sidebar.tsx`), camelCase for utility/service files (`emby.ts`).
- **Components**: Use PascalCase for component names (`MovieCard`, `TopBar`).
- **Functions/Variables**: Use camelCase (`handleClick`, `isAuthenticated`).
- **Constants**: Use UPPER_SNAKE_CASE for true constants.
- **CSS Classes**: Use camelCase or kebab-case as per Tailwind conventions.

### React Components
- Use functional components with hooks.
- Define component prop types using TypeScript interfaces.
- Use `React.FC` sparingly; prefer inline prop typing.
- Keep components small and focused.

### State Management
- Use React's built-in hooks (`useState`, `useEffect`, `useContext`).
- Context API for theme and global state (`ThemeProvider`, `ThemeContext`).
- Avoid prop drilling; use context or composition.

### Error Handling
- Use try/catch for async operations.
- Provide user-friendly error messages.
- Log errors to console for debugging.

### Styling
- Use Tailwind CSS for styling.
- Use `clsx` and `tailwind-merge` for conditional classes.
- Avoid inline styles; use Tailwind utilities.

## Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/               # Page components (route targets)
├── services/            # API and service layers
├── context/             # React context providers
├── i18n.ts              # Internationalization setup
├── globals.css          # Global styles
├── App.tsx              # Main application component
└── main.tsx             # Entry point
```

## Additional Notes
- The project uses React 19 and TypeScript ~5.8.
- Vite is the bundler with React plugin.
- Styling via Tailwind CSS v4.
- Internationalization with i18next and react-i18next.
- Routing with react-router-dom v7.
- Animations with motion (framer-motion successor).
- API calls likely via axios.
- Environment variables are managed with dotenv (see .env.example).
