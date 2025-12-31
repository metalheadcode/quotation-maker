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
- **NEVER** create migration files manually. Always use `supabase migration new <name>` command
- **NEVER** run `supabase db push` - let the user handle database pushes
- **NEVER** create database types manually. Always use `supabase gen types typescript --local > lib/supabase/database.types.ts` or let user generate them
- Use `gen_random_uuid()` instead of `uuid_generate_v4()` for UUID defaults (PostgreSQL 13+ built-in)
- Always enable Row Level Security (RLS) on all tables
- Always add `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE` for user-owned data

### Supabase Commands & Workflow
```bash
# Create new migration (use this instead of manual file creation)
supabase migration new <migration_name>

# Reset local database and apply all migrations (validates migrations work)
supabase db reset

# Generate TypeScript types from LOCAL database (after reset)
supabase gen types typescript --local > lib/supabase/database.types.ts

# Push migrations to remote (only after local reset succeeds - let user run this)
supabase db push

# Pull remote schema
supabase db pull
```

### Migration Workflow
1. Create migration: `supabase migration new <name>`
2. Write SQL in the created migration file
3. Test locally: `supabase db reset` (user runs this)
4. Generate types: `supabase gen types typescript --local > lib/supabase/database.types.ts` (user runs this)
5. If no issues, push to remote: `supabase db push` (user runs this)

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
