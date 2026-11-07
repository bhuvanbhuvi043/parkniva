# Third-party material

Parkniva's proprietary notice applies only to original contributions. It does not claim ownership of the software, fonts, maps or photography listed here.

| Material | Terms and notice location |
| --- | --- |
| npm dependencies | Exact lockfile inventory in `docs/dependency-licenses.json`; installed-package licence and notice texts in `public/legal/third-party-notices.txt`. The inventory distinguishes development, optional and installed entries. |
| shadcn-derived starter UI components | MIT notice retained in `vendor/shadcn-tailwind-4.13.0.LICENSE.md`. |
| Vendored Sites Vite integration | MIT notice retained in `scripts/vite/sites-vite-plugin.LICENSE`; its source provenance header is preserved. |
| Pexels sample photographs | Separate Pexels licence and third-party-rights limitations, with individual sources in `ASSET-SOURCES.md`. No exclusive ownership is claimed; no standalone stock-asset redistribution is licensed by Parkniva. |
| Manrope and DM Sans | Loaded from Google Fonts, under their respective SIL Open Font Licences. Fonts are not licensed by Parkniva's proprietary notice. Upstream font licence links are listed below. |
| OpenStreetMap embedded maps | Rendered by OpenStreetMap with their visible attribution. Map data is governed by the ODbL; map tiles and service use have separate policies. No OSM database or map tile collection is bundled here. |
| Approved Parkniva logo | AI-generated development asset, separate from stock photos. No third-party logo was intentionally used as a reference. This is not a guarantee of originality or legal exclusivity; trademark/device-mark clearance remains pending. |

Some locked platform image-processing dependencies declare LGPL licences, and some tooling declares MPL licences. These are not relabelled as proprietary. The repository excludes installed dependency trees and native binaries. Before separately distributing a compiled desktop app, native image-processing bundle or modified third-party source, review the relevant component's exact source, notice and redistribution obligations. Serving a website and distributing native binaries are different release scenarios.

Run `npm run licenses:generate` after dependency changes. The generated notices include licence texts found in the installed packages, but cannot include texts for optional packages not installed on the current platform. The JSON inventory retains those entries and their declared licences. Review those packages on the release target before distributing their binaries.

Sources:

- [React licence](https://github.com/facebook/react/blob/main/LICENSE)
- [Vinext licence](https://github.com/cloudflare/vinext/blob/main/LICENSE)
- [Manrope OFL](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt)
- [DM Sans OFL](https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt)
- [OpenStreetMap copyright and licence](https://www.openstreetmap.org/copyright)
- [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/)
- [Pexels licence](https://www.pexels.com/license/)
