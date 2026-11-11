# ParkThara 0.2.0

11 November 2026. Renames the working brand and public repository, keeps the approved P symbol, updates the logo filename/metadata/UI/rights records and preserves the existing database and production authentication. Legacy administrator environment configuration remains supported during the transition.

The complete application source includes the React frontend, Worker entry point, API, D1 schema/migration, R2 upload logic, account/host/admin interfaces, tests, dependency lockfile, licence records and GitHub workflows. The downloadable source excludes secrets, private runtime records and installed/generated dependencies; npm ci and the documented build reproduce the project from its locked inputs.

The former small GitHub showcase is replaced with the actual frontend compiled as an explicitly read-only project demo. It supports sample search, budget/vehicle/facility filters, hourly/daily/monthly plans, listing galleries/maps, direct sample URLs and responsive navigation. Static account actions hand off to the separately hosted full app. No real listing, account or booking data is replicated to GitHub Pages.

Rights in original contributions are retained under LICENSE.txt; third-party licences and media provenance remain separate. The new name and logo have not received official trademark clearance or registration. No copyright/patent registration, corporate registration, property permission or commercial payment approval is claimed. Payments, payouts, refunds and email/SMS remain outside the current request-based preview.

Verification commands: npm run typecheck; npm test; npm run security:source; npm audit --omit=dev; npm run build:pages; node scripts/check-pages.mjs; a loopback-only API smoke test; and the Sites production Worker build. Desktop/mobile browser checks cover the read-only demo and main account-entry flows. Successful publication/build results are recorded in the GitHub Actions runs for the released commit.
