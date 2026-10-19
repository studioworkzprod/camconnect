# Canon DSLR Companion

An Android companion app intended to connect to a Canon EOS 6D, trigger captures, and pass images to nearby PWAs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/canon-companion` — Expo Android companion app.
- `artifacts/api-server` — shared API server; no server-side functionality is required for the initial device-focused app.

## Architecture decisions

- Keep camera transports model-specific so future camera bodies can be added without changing the PWA-facing contract.
- The EOS 6D is a legacy Wi-Fi remote-control target; do not report a connected or captured state without a real camera transport.
- Keep PWA image transfer local to the phone/network when implemented; camera images should not be routed through a cloud server by default.

## Product

- Android companion for Canon EOS 6D wireless control.
- Future PWA bridge for capture requests and returning captured images.
- The current build provides the app shell and connection guidance; camera control and the local PWA endpoint are not implemented yet.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
