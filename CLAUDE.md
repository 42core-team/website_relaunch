# CLAUDE.md - Development Guidelines

## Commands
- Build: `cd frontend && npm run build`
- Develop: `cd frontend && npm run dev --turbo`
- Lint: `cd frontend && npm run lint`
- Type check: `cd frontend && npx tsc --noEmit`

## Code Style
- Use TypeScript with strict type checking
- Format code with Prettier (configured in ESLint)
- Follow React best practices (functional components, hooks)
- Import order: types, builtin, object, external, internal, parent, sibling, index
- Include blank lines between import groups and before returns
- Self-close components when empty
- Sort JSX props (callbacks last, shorthand first)
- Use HeroUI components for consistent UI
- Prefer named exports over default exports
- Use descriptive variable names (camelCase for variables, PascalCase for components)
- Handle errors with appropriate try/catch blocks
- For database operations, use PocketBase client
- Follow Next.js App Router patterns for routing