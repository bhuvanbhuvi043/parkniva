# Security

Parkniva is currently an owner-private development preview. This repository is private. Payments and payouts are disabled.

Report suspected vulnerabilities privately to the repository owner, `bhuvanbhuvi043`, through an existing private contact channel or a GitHub private security advisory if that facility is available. Do not publish credentials, precise host locations, vehicle registrations, customer records or exploit data in issues. No monitored support email or guaranteed response time is advertised by this project.

## Checks

- `npm run security:source`: checks the tracked source and selected new project files for private runtime artifacts and common embedded credential patterns. It reports filenames and rule names without printing matched values. It is a limited heuristic, not a comprehensive secret or malware scanner.
- `npm audit --omit=dev`: checks production dependencies against the current npm advisory database. Also run the full `npm audit` when updating development tooling.
- `npm run typecheck` and `npm test`: check types, prices, calendar boundaries and atomic reservation rules.
- `node tests/api-smoke.mjs`: exercises writes only against the explicitly configured loopback development server.

Authentication and the production administrator identity come from trusted platform identity and server configuration. Keep `.dev.vars`, `.env`, local D1/R2 data, source-repository credentials and deployment archives out of Git. `.env.example` contains no secret values. Never copy local mock-auth middleware into production request handling.

The dependency audit is a dated check. It does not establish that the application is free from vulnerabilities. Recheck advisories and test upgrades before a public launch. The private preview and source repository should remain private until the owner deliberately changes their audiences.
