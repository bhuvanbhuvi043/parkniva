# GitHub publication and hosting

The owner explicitly authorised public source publication on 10 November 2026. The project was renamed **ParkThara** on 11 November. Original contributions remain proprietary under LICENSE.txt; third-party grants remain intact.

- Complete source: https://github.com/bhuvanbhuvi043/parkthara
- Interactive project demo: https://bhuvanbhuvi043.github.io/parkthara/
- Full server-backed app: https://parkthara.sheerriver2.chatgpt.site

## GitHub Pages

The Pages workflow installs locked dependencies, builds the same frontend with an explicit read-only demo target, checks the generated output and publishes only outputs/github-pages. This output is ignored by Git and uploaded as the Pages artifact. The repository includes its source in pages-demo/, pages.vite.config.ts and scripts/build-pages.mjs.

The demo includes sample search/filtering, plan prices, detail galleries/maps, hosting introduction and information pages. It has repository-prefixed assets and links, direct HTML entry points for the known routes and all twelve sample listings, and a 404 entry point for unknown routes. It never calls the production account API or stores pretend reservations. Registration plates, host notes and support-message inputs are excluded from the static demo. Its account buttons open the real full app.

Pages is static hosting, and its terms do not permit using it as free hosting for an online business, commercial transactions or commercial SaaS. This publication is a clearly labelled non-transactional project demo. Running the actual marketplace requires server hosting. See [what Pages runs](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) and [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Full application

The full app uses a Cloudflare Worker through Sites, with dispatch-owned ChatGPT sign-in, D1 and R2. Its registered project ID is retained in .openai/hosting.json. It is public for browsing; protected operations check the signed-in user and resource ownership. Production credentials, database rows and private uploads are not included in GitHub.

Application CI checks source safety, TypeScript, domain/reservation/navigation tests, production dependency advisories and the Worker build. Main-branch builds store parkthara-worker-<commit> for three days, with exact source provenance in github-build.json. Pages has a separate build/deployment workflow. A passing push does not automatically deploy the Sites backend; the authorised Sites save/deploy flow publishes the matching archive and commit.

No cloud secret has been added to Actions, and no paid hosting or domain has been purchased. The connected external Cloudflare credentials currently lack D1/storage provisioning permissions. A complete migration off chatgpt.site needs an authorised destination with database and photo storage, plus a supported production authentication plan. This release preserves the established authentication instead of replacing it with an unverified login system.

## Running from the complete source

Use Node 24. Run npm ci --no-audit --no-fund, copy .env.example to ignored .dev.vars, and configure PARKTHARA_ADMIN_EMAIL=seedy@sites.test only for loopback development. Run npm run build, then apply the existing migration once to a new local D1 database using the exact command in README.md. Run npm run dev -- --host 127.0.0.1 --port 5174. The provided mock identity works only on loopback in development; it is absent from production builds.

Run npm run typecheck and npm test. With the local server running, node tests/api-smoke.mjs verifies the authenticated local workflows and refuses non-loopback URLs. Run npm run build:pages and node scripts/check-pages.mjs for the independent static demo. It can be previewed with node node_modules/vite/bin/vite.js preview --config pages.vite.config.ts --host 127.0.0.1 --port 5176; open /parkthara/ on the printed URL.

Only the owner is a repository collaborator. Public source visibility does not supply anyone with administrator access, service credentials, production database access or general permission to run a commercial copy. See docs/IP-REVIEW.md for the distinction between a rights notice and formal legal registration.
