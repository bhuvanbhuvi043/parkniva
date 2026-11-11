# ParkThara

**Space to park. Room to earn.** A marketplace for parking and standalone EV charging in India, with prices and availability chosen by each host.

[Interactive GitHub project demo](https://bhuvanbhuvi043.github.io/parkthara/) · [Full app with accounts and booking requests](https://parkthara.sheerriver2.chatgpt.site) · [Complete public source](https://github.com/bhuvanbhuvi043/parkthara)

The repository contains the complete frontend, API, database schema/migration, upload handling, host and guest dashboards, administration tools, tests, build scripts and publishing workflows. Original contributions retain the owner's rights under [LICENSE.txt](LICENSE.txt); public visibility is not a general open-source grant. Third-party terms are recorded in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md), [ASSET-SOURCES.md](ASSET-SOURCES.md) and the bundled notices.

## Two published experiences

| Address | What it runs |
| --- | --- |
| GitHub Pages | A read-only interactive project demo: search, city/budget/vehicle/facility filters, hourly/daily/monthly price comparisons, listing galleries, illustrative maps, hosting introduction, FAQs and policy pages. It uses twelve fictional samples bundled with the frontend. |
| Full app | The complete server-backed preview: ChatGPT sign-in, profiles, favourites, photos, host drafts/submissions, booking requests, host responses, cancellation, blocked dates, listing review and an internal support inbox. Persistent records are in D1; uploads are in R2. |

**GitHub Pages cannot execute this application's backend.** The demo visibly identifies itself, collects no account credentials and submits no bookings or support messages. Account actions lead to the separately hosted full app. No browser-local pretend account or fake reservation is substituted for the backend. The full app's address currently includes `chatgpt.site`; a GitHub Pages publication does not remove that server dependency. See [hosting details](docs/GITHUB.md).

## Mobile navigation and guides

The responsive app uses Home, Parking, Charging, Bookings and Menu shortcuts. The booking hub separates parking and charging; the hosting hub separates parking spaces and charger ports. [Help & documents](https://parkthara.sheerriver2.chatgpt.site/documents) includes getting started, pricing, cancellations, terms, privacy, safety, EV guidance and feature availability. Mobile forms use readable text and single-column layouts.

## Standalone EV charging

Charging uses its own listings and requests; no parking booking is required. Hosts offer fixed sessions or per-kWh rates. Pending requests hold a port for up to two hours or until arrival, whichever is earlier. Rates and equipment details are saved with the request; future price changes do not change existing quotes. Driver and host activity is separated in the charging dashboard. No live metering, charger control or payment collection is enabled. See [the detailed charging plan](docs/EV-CHARGING-PLAN.md).

## Current scope

The sample properties, photographs, map locations and prices are illustrative. A sample booking in the full app reserves no real property. Real owners choose their own rates, photographs and hours; submitted real listings require administrator review.

The API checks identity, ownership, request origin and input validity. Quotes are calculated on the server. Reservation holds, acceptance and date blocks use atomic overlap checks. Exact entrance details are restricted to the owner, reviewer or an accepted guest with an active booking. One parking listing represents one bay; parking requests expire after 24 hours and must be accepted before arrival.

**Payments, payouts, refunds and SMS/email notifications are not enabled.** Hosts and guests use the dashboard to follow requests. Daily/monthly requests hold the date interval, including closed hours; actual access follows the host's published days and hours. Overnight access windows are not supported in this version.

## Name and rights

ParkThara replaces the previous working name after the owner reported an existing domain using it. The 11 November 2026 web screening found no obvious exact-name parking competitor for ParkThara in the results reviewed. This is a working name, not official trademark, domain or company-name clearance. No trademark, copyright or patent application has been filed through this project. The [IP review](docs/IP-REVIEW.md) records the limits and remaining work; a code licence does not supply local parking permissions or business registrations.

## Configuration

- `.openai/hosting.json` binds D1 as `DB` and R2 as `BUCKET` and retains the registered Site ID.
- Production administrator configuration is stored through Sites runtime configuration. The application accepts `PARKTHARA_ADMIN_EMAIL` and the legacy `PARKNIVA_ADMIN_EMAIL` during the transition. Set it to the reviewing owner's actual sign-in email; it is never read from client input.
- For portable local development, copy `.env.example` to ignored `.dev.vars` and use `PARKTHARA_ADMIN_EMAIL=seedy@sites.test` for the provided loopback identity.
- Migrations: `drizzle/0000_tranquil_scarlet_witch.sql` (parking) and `drizzle/0001_striped_wither.sql` (charging). Apply each pending migration once locally, in order, using the command below with its filename. Hosting applies the tracked migration independently; local QA records are not published.

## Validation

```sh
node node_modules/typescript/bin/tsc --noEmit
npm test
npm run build:pages
node scripts/check-pages.mjs
```

With a portable loopback development server running and the local administrator configured, `node tests/api-smoke.mjs` exercises auth/origin protection, photo upload and access, listing review, address privacy, profile and favourite persistence, server pricing, booking/cancellation, support and pause. It writes clearly named local test records and refuses non-loopback destinations. Do not point it at a hosted deployment.

The mobile and desktop UI has also been exercised through search, a sample booking, saving a space, photo upload and the host submission wizard.

## Framework and local setup

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git and `tar` (including Windows `tar.exe`) are required for publishing; portable publication does not require Bash

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

Publish archives outside the source checkout or under its ignored `outputs/` directory. Local `.env*`, `.dev.vars*`, TypeScript build state, and tool runtime directories are ignored; keep the hosting manifest, migrations, and authored scripts in source control.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--host <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For managed Linux browser QA, follow the Sites skill's managed preview reference. The daemon runs the project's Vite dev script with `--host 0.0.0.0 --port 4173 --strictPort`; use the CLI's returned URL. The ignored local profile survives the daemon's cleared environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `worker/index.ts` is the production Worker entrypoint and preserves request-scoped connector bindings
- `scripts/vite/` contains the maintained Vite integrations and the vendored Sites plugin license
- `scripts/connector-preview/` contains the local connector preview Worker and session helpers
- the remaining `scripts/` files select execution profiles and run installation, development, and builds; the plugin's helpers orchestrate the Sites lifecycle
- `dist/` contains generated deployment output; `.vinext/`, `.wrangler/`, and `.sites-runtime/` contain ignored local tool state
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` declares the parking marketplace tables
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_tranquil_scarlet_witch.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
