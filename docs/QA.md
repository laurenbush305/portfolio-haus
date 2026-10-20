# Verification record — 2026 site refresh

## Build and site health

- Jekyll 3.10.0 build with `--strict_front_matter`: passed. A real Jekyll build was run locally; this is not a template approximation.
- `python3 scripts/check-site.py _site`: passed for all 18 rendered HTML routes. Checks cover internal routes and assets, fragment targets, one H1 per page, titles/descriptions, absolute canonical and OG URLs, JSON-LD, robots, 10 expected sitemap URLs, noindex exclusions, and source/documentation exclusions.
- An alternate Jekyll build with `baseurl: /preview` and a temporary Formspree endpoint passed URL-prefix and configured-form checks. Production config retains `baseurl: ""` and an empty endpoint.
- Existing CNAME preserved. No production deployment, DNS change, or merge was performed.

## Browser evidence

Chrome was used for rendered inspection and browser interaction. Desktop/mobile screenshots were saved separately with the review deliverable.

- All 18 routes at viewport widths 1440, 768, 390, and 320: no horizontal scrolling, local HTTP failures, or page JavaScript exceptions.
- Desktop and mobile inspection: Home, Institutions, Founders, Work, Start; About also inspected on desktop.
- All six diagnostic score outcomes across four buyer contexts (24 combinations): correct diagnosis, canonical recommendation, and working route.
- Diagnostic previous/restart behavior, download content, rapid-click guard, result focus, and reduced-motion behavior: passed.
- Mobile menu keyboard toggle, visible expanded state, Escape dismissal, and link navigation: passed.
- Founder native FAQ disclosure keyboard operation: passed.
- Start validation, allowlisted prefilling, editable review, complete text-file download, and zero automatic POST requests in local mode: passed.
- Optional connected form: rendered POST action, field serialization, and `/preview` prefix behavior verified with an intercepted request. **No live Formspree inbox delivery was attempted or claimed.** That requires Lauren’s verified endpoint.
- Both working instruments: validation, scoring/generation, visible result, retained edit values, and wrapping passed.
- Haus Signal: five guided lanes, typed pricing fallback, escaped user text, safe current-path links, and Escape dismissal passed.
- JavaScript-disabled navigation and contact fallbacks passed.
- Google Fonts loaded: Libre Baskerville display/wordmark and Inter body confirmed in Chrome. Social preview rendered with those hosted fonts.

## Accessibility

Axe-core 4.10.3 WCAG 2 A/AA and WCAG 2.1 AA checks: no violations on 12 content/tool pages and the open Haus Signal panel after fixing the Tools closing-quote contrast. The diagnostic result state was checked separately. Keyboard checks are listed above. Automated scans and browser emulation do not establish exhaustive assistive-technology or physical-device certification.

## Scope of remaining verification

- Optional Formspree receiving inbox, account spam settings, and real success/failure responses require Lauren’s endpoint and a real test.
- After merging, verify the actual GitHub Pages deployment on the custom domain, including fonts, social preview, 404 response, and the selected inquiry flow.
- No physical iPhone/Android device or screen reader was available for this run.

The branch is technically ready for content review and merge with the honest local inquiry flow. Direct form delivery is an optional connection, not a feature represented as already active.
