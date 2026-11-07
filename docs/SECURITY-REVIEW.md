# Security review

Checked 7 November 2026 (Asia/Kolkata). This is a dependency and source hygiene review, not a penetration test or a guarantee of security.

## Results

- Production (`npm audit --omit=dev`): 0 known advisories.
- Full dependency tree: 0 critical, 0 high, 16 moderate and 0 low findings.
- Source heuristic: no common embedded credential patterns or forbidden runtime files detected in the candidate source.
- TypeScript and all 11 automated pricing/calendar/reservation tests passed. The API smoke test and Worker build are separate release checks.

## Changes

Updated the React/RSC runtime together, Vinext, Next compatibility package, Vite, Cloudflare tooling, Zod and image-processing dependencies. Applied targeted patched transitive releases for browser matching, source maps, URI parsing and other affected tools. JSON API bodies now enforce an actual streamed byte limit and reject malformed JSON. The original baseline had 34 dependency findings, including 1 critical and 15 high.

## Application verification

The loopback API smoke test passed after the upgrades: anonymous write protection, sign-in, origin checks, actual JSON size and syntax validation, photo validation/storage/access, host submission/review/privacy, profile and favourites, booking totals/persistence/cancellation, support and pausing. The homepage and software-notices URL returned HTTP 200. Earlier mobile/desktop checks were completed for the original version; the updated browser recheck was blocked by a browser-tool timeout and is not claimed as completed for this release.

## Remaining moderate findings

These packages are classified as development dependencies by npm. That classification alone does not prove they cannot affect a deployed bundle: Vinext is a build dependency that generates Worker runtime code. No exploitability or bundle reachability clearance is claimed. The current application does not intentionally offer OG-image generation or expose an esbuild development server to the internet. Do not apply suggested framework downgrades or incompatible overrides merely to hide audit output. Monitor upstream fixes and reassess before public commercial launch.

| Package | Severity | Advisory references (where directly reported) |
| --- | --- | --- |
| @esbuild-kit/core-utils | moderate |  |
| @esbuild-kit/esm-loader | moderate |  |
| @typescript-eslint/eslint-plugin | moderate |  |
| @typescript-eslint/parser | moderate |  |
| @typescript-eslint/type-utils | moderate |  |
| @typescript-eslint/typescript-estree | moderate |  |
| @typescript-eslint/utils | moderate |  |
| @vercel/og | moderate |  |
| drizzle-kit | moderate |  |
| esbuild | moderate | [1102341](https://github.com/advisories/GHSA-67mh-4wv8-2f99) |
| eslint-config-next | moderate |  |
| fflate | moderate | [1164783](https://github.com/advisories/GHSA-px8p-9vwx-vf98) |
| minimatch | moderate | [1244623](https://github.com/advisories/GHSA-g3hv-75wg-m249) |
| satori | moderate |  |
| typescript-eslint | moderate |  |
| vinext | moderate |  |

Audit findings are time-specific, may overlap through dependency paths, and can change after publication. The repository CI checks production advisories; the full development-tree findings are recorded here rather than silently omitted. Licence and IP questions are addressed separately in [IP-REVIEW.md](IP-REVIEW.md).
