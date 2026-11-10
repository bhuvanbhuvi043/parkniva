# Security

Parkniva is a public early access preview. The owner authorised public source publication on 10 November 2026. Anonymous app visitors can browse published and example listings. Account data, private photos, host submissions, booking writes and administrator actions require the appropriate authenticated identity. Payments and payouts are disabled. GitHub Pages contains only the separate static project showcase, with no account or booking forms.

Report suspected vulnerabilities privately to the repository owner, `bhuvanbhuvi043`, through an existing private contact channel or a GitHub private security advisory if that facility is available. Do not publish credentials, precise host locations, vehicle registrations, customer records or exploit data in public issues. No monitored support email or guaranteed response time is advertised by this project.

## Checks

- `npm run security:source`: checks the tracked source and selected new project files for private runtime artifacts and common embedded credential patterns. It reports filenames and rule names without printing matched values. It is a limited heuristic, not a comprehensive secret or malware scanner.
- `npm audit --omit=dev`: checks production dependencies against the current npm advisory database. Also run the full `npm audit` when updating development tooling.
- `npm run typecheck` and `npm test`: check types, prices, calendar boundaries and atomic reservation rules.
- `node tests/api-smoke.mjs`: exercises writes only against the explicitly configured loopback development server.

Authentication and the production administrator identity come from trusted platform identity and server configuration. Keep `.dev.vars`, `.env`, local D1/R2 data, source-repository credentials and deployment archives out of Git. `.env.example` contains no secret values. Never copy local mock-auth middleware into production request handling.

The dependency audit is a dated check. It does not establish that the application is free from vulnerabilities. Recheck advisories and test upgrades before a paid commercial launch. Public source access does not grant access to the production environment, credentials, databases or private uploads. There are no client source-map files in the application release build. Keep secrets and privileged actions on the server.
