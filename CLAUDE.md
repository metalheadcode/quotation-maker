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
