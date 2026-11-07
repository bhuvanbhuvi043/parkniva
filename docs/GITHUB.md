# GitHub and hosting

Owner-selected visibility: **private**. Original code: **rights retained**, subject to third-party terms.

- Source repository: https://github.com/bhuvanbhuvi043/parkniva
- Public website preview: https://parkniva.sheerriver2.chatgpt.site
- Owner review page: https://parkniva.sheerriver2.chatgpt.site/admin

Only the owner has collaborator access to the source repository. No additional collaborator is authorised by this release. The owner explicitly requested a public website while keeping its GitHub source private. These are separate access settings.

## Local setup

Use Node 24 and Git. Run `npm ci --no-audit --no-fund`, then `npm run typecheck`, `npm test` and `npm run build`. Copy `.env.example` to ignored `.dev.vars` and configure a local administrator only if needed. The maintained portable preview uses the mock loopback identity described in the main README. Apply the existing migration once to a new local D1 database before using the account API.

The app uses server-side code, identity, D1 and R2. **GitHub Pages cannot host this complete application.** The repository is a source backup and collaboration location; the existing Sites deployment is the running application. No cloud credentials, customer database or user-uploaded photographs are committed.

The CI workflow checks source safety, types, tests, production dependency advisories and the Worker build. A successful main-branch build stores a private artifact named `parkniva-worker-<commit>` for three days. Its `github-build.json` records the repository, exact commit and workflow run. The public website is published from that verified GitHub-built artifact using the existing Sites hosting integration. GitHub deployment records link the source revision and workflow to the website URL.

Publishing remains an authorised Sites operation after the build; a push creates and checks the build artifact but does not by itself redeploy production. No hosting credential is stored in the repository or added to GitHub Actions by this setup. The local API smoke test is excluded from CI because it needs a separate loopback server, mock sign-in and local database.

The private source and server implementation remain restricted. Public visitors necessarily receive and can inspect the frontend HTML, styles, images and browser JavaScript. The release does not include public client source maps, credentials, runtime databases or private uploads.

Dependency-update pull requests are configured through Dependabot. Review and test related React/runtime upgrades together. Do not enable paid security products or paid hosting as an assumed part of this repository.

Review `docs/IP-REVIEW.md` for the trademark, patent, copyright and commercial-readiness work that remains outside source publication.
