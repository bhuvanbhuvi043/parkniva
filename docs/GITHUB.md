# GitHub and hosting

Owner-selected visibility: **private**. Original code: **rights retained**, subject to third-party terms.

- Source repository: https://github.com/bhuvanbhuvi043/parkniva
- Hosted private preview: https://parkniva.sheerriver2.chatgpt.site
- Owner review page: https://parkniva.sheerriver2.chatgpt.site/admin

Only the owner and explicitly authorised collaborators should have repository access. No collaborator invitation or public visibility change is part of this release. The hosted Site's audience is managed separately and remains owner-private.

## Local setup

Use Node 24 and Git. Run `npm ci --no-audit --no-fund`, then `npm run typecheck`, `npm test` and `npm run build`. Copy `.env.example` to ignored `.dev.vars` and configure a local administrator only if needed. The maintained portable preview uses the mock loopback identity described in the main README. Apply the existing migration once to a new local D1 database before using the account API.

The app uses server-side code, identity, D1 and R2. **GitHub Pages cannot host this complete application.** The repository is a source backup and collaboration location; the existing Sites deployment is the running application. No cloud credentials, customer database or user-uploaded photographs are committed.

The CI workflow checks source safety, types, tests, production dependency advisories and the Worker build. It does not automatically deploy, change Site sharing, collect payments or access production records. The local API smoke test is deliberately excluded from CI because it requires a separate loopback server, mock sign-in and local database.

Dependency-update pull requests are configured through Dependabot. Review and test related React/runtime upgrades together. Do not enable paid security products or paid hosting as an assumed part of this repository.

Review `docs/IP-REVIEW.md` for the trademark, patent, copyright and commercial-readiness work that remains outside source publication.
