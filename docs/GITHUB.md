# GitHub and hosting

Owner-selected visibility: **public**, explicitly authorised on 10 November 2026 to enable GitHub Pages. Original code: **rights retained**, subject to third-party terms. This is not an MIT or other general open-source licence.

- Source repository: https://github.com/bhuvanbhuvi043/parkniva
- GitHub Pages project preview: https://bhuvanbhuvi043.github.io/parkniva/
- Public website preview: https://parkniva.sheerriver2.chatgpt.site
- Owner review page: https://parkniva.sheerriver2.chatgpt.site/admin

Anyone can view the public source repository. Only the owner has collaborator access; no additional administrator or collaborator is authorised by this release. Public source access grants no access to production credentials, user accounts, databases or private uploads.

## Local setup

Use Node 24 and Git. Run `npm ci --no-audit --no-fund`, then `npm run typecheck`, `npm test` and `npm run build`. Copy `.env.example` to ignored `.dev.vars` and configure a local administrator only if needed. The maintained portable preview uses the mock loopback identity described in the main README. Apply the existing migration once to a new local D1 database before using the account API.

The app uses server-side code, identity, D1 and R2. **GitHub Pages serves only the static project showcase from `github-pages/`.** The full interactive prototype continues on its existing application host. No account, booking or payment forms are hosted on Pages. No cloud credentials, customer database or private uploaded photographs are committed.

The application CI workflow checks source safety, types, tests, production dependency advisories and the Worker build. A successful main-branch build stores an artifact named `parkniva-worker-<commit>` for three days. Its `github-build.json` records the repository, exact commit and workflow run. The full interactive prototype is published through the existing Sites hosting integration. GitHub deployment records link its source revision and workflow to the application URL.

The separate `Publish GitHub Pages` workflow validates the three showcase files and publishes them when `github-pages/` or the Pages workflow changes on `main`. It uses read-only source access and grants Pages/identity-token write access only to the deployment job. It publishes no application build artifacts or server files.

Publishing remains an authorised Sites operation after the build; a push creates and checks the build artifact but does not by itself redeploy production. No hosting credential is stored in the repository or added to GitHub Actions by this setup. The local API smoke test is excluded from CI because it needs a separate loopback server, mock sign-in and local database.

The source is public, but production credentials, databases and private uploads remain restricted. The application release does not include public client source maps or runtime data. The separate GitHub Pages showcase contains only HTML/CSS, the public logo and `.nojekyll`.

Dependency-update pull requests are configured through Dependabot. Review and test related React/runtime upgrades together. Do not enable paid security products or paid hosting as an assumed part of this repository.

Review `docs/IP-REVIEW.md` for the trademark, patent, copyright and commercial-readiness work that remains outside source publication.
