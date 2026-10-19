# Canon DSLR Companion

An Android companion app for Canon EOS 6D USB capture, with a future bridge to pass images to nearby PWAs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/canon-companion run test:usb:protocol` — Java USB framing/driver tests (requires a JDK on PATH)
- `pnpm --filter @workspace/canon-companion run build:apk` — self-contained, development-signed Android test APK (requires Android SDK/JDK and sufficient build storage)
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
- `artifacts/canon-companion/native/README.md` — native Android build instructions, camera setup and verification limits.
- `artifacts/api-server` — shared API server; no server-side functionality is required for the initial device-focused app.

## Architecture decisions

- Keep camera transports model-specific so future camera bodies can be added without changing the PWA-facing contract.
- The EOS 6D uses an Android USB host/PTP adapter; do not report a connected or captured state without a real camera handshake.
- Keep PWA image transfer local to the phone/network when implemented; camera images should not be routed through a cloud server by default.

## Product

- Android companion for Canon EOS 6D control, including USB connectivity.
- Future PWA bridge for capture requests and returning captured images.
- An experimental native Android USB driver is implemented for original EOS 6D discovery, permissions, single-shot JPEG capture and local image download. Physical hardware compatibility is unverified; no installable APK has been built.
- The PWA endpoint is not implemented yet.

## User preferences

- USB connectivity is the user's required connection method. Prioritize it over Wi-Fi.

## Gotchas

- Expo Go/browser previews cannot load the custom Android USB module. Use a native Android build to access USB.
- Maintain Java sources in `native/android/`; the config plugin copies and registers them during Android prebuild. Generated `android/` is ignored.
- The camera must have Wi-Fi disabled, a writable SD card, JPEG or RAW+JPEG, and single-shot drive. Keep the companion in the foreground.
- A failed capture/download may still have taken a photo. Never automatically retry shutter commands or delete camera files.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
