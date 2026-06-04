# Architecture

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Supabase for persistence
- PWA shell for installable mobile experience
- Cloudflare-compatible deployment path

## Structure

- `app/` hosts routes and layouts.
- `components/` hosts UI shells and reusable cards/forms.
- `lib/` hosts business logic, AI placeholders, integrations, and service helpers.
- `database/` hosts the Supabase schema.
- `public/` hosts the manifest, service worker, and icon placeholders.

## Data Flow

- Booking form submits to `/api/bookings`.
- The API attempts to write to Supabase when environment variables are available.
- If Supabase is unavailable, the project falls back to local memory for development.
- Telegram notifications are logged instead of failing when credentials are missing.

## AI Readiness

- `lib/ai/routeOptimizer.ts` contains the future passenger grouping and route planning contracts.
- The current implementation uses deterministic mock logic so the codebase remains buildable.
