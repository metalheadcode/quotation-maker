# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 quotation-maker application built with:
- React 19.1.0
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui components (New York style)
- App Router architecture

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist fonts (sans & mono)
  - `page.tsx` - Home page
  - `globals.css` - Tailwind CSS configuration with shadcn/ui theme variables
- `lib/` - Utility functions
  - `utils.ts` - Contains `cn()` helper for merging Tailwind classes
- `components/` - Reusable React components (shadcn/ui components will be added here)
- `public/` - Static assets

### Path Aliases
Configured in `tsconfig.json`:
- `@/*` - Root directory (e.g., `@/components`, `@/lib/utils`)

### shadcn/ui Configuration
`components.json` is configured with:
- Style: "new-york"
- RSC enabled
- Base color: neutral
- CSS variables enabled
- Icon library: lucide-react
- Aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`

### Styling
- Using Tailwind CSS v4 with PostCSS
- Custom theme variables defined in `app/globals.css` using OKLCH color space
- Dark mode support via `.dark` class
- Custom animations via `tw-animate-css` package
- Theme includes variables for: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart colors, and sidebar colors

## TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Module resolution: bundler
- JSX: preserve (handled by Next.js)

## Supabase

### Rules for Claude Code
- **NEVER** run `supabase db push` - this pushes to production and MUST be done by the user only
- **NEVER** create migration files manually (no direct file creation) - always use `supabase migration new <name>` command
- **NEVER** create database types manually - always generate using `supabase gen types typescript --local`
- **CAN** run `supabase migration new <descriptive_name>` to create new migrations
- **CAN** run `supabase db reset` to test migrations locally
- **CAN** run `supabase gen types typescript --local > lib/supabase/database.types.ts` after successful reset
- Use `gen_random_uuid()` instead of `uuid_generate_v4()` for UUID defaults (PostgreSQL 13+ built-in)
- Always enable Row Level Security (RLS) on all tables
- Always add `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` for user-owned data

### Migration Workflow (Claude MUST follow this)
1. **Create migration**: Run `supabase migration new <descriptive_name>`
2. **Write SQL**: Edit the created migration file with the SQL schema changes
3. **Test locally**: Run `supabase db reset` to validate migrations work
4. **Fix issues**: If reset fails, fix the migration SQL and run reset again
5. **Generate types**: Run `supabase gen types typescript --local > lib/supabase/database.types.ts`
6. **Ask user to push**: Tell the user to run `supabase db push` to apply to remote database

### Supabase Commands Reference
```bash
# Create new migration (Claude CAN run this)
supabase migration new <descriptive_migration_name>

# Reset local database and apply all migrations (Claude CAN run this)
supabase db reset

# Generate TypeScript types from LOCAL database (Claude CAN run this)
supabase gen types typescript --local > lib/supabase/database.types.ts

# Push migrations to remote (USER ONLY - Claude must NOT run this)
supabase db push

# Pull remote schema
supabase db pull
```

### Supabase Client Files
- `lib/supabase/client.ts` - Browser client for client components
- `lib/supabase/server.ts` - Server client for server components and API routes
- `lib/supabase/middleware.ts` - Middleware client for auth session handling
- `lib/supabase/database.types.ts` - Auto-generated TypeScript types (use supabase gen)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
# or
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=<supabase-anon-key>
```
