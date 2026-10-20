# Portfolio Haus

Jekyll / GitHub Pages website for https://portfolio.haus. Production branch: `main`.

## Current architecture

Primary navigation: Home, Institutions, Founders, Work, About, Start.

Method, the Receipt Rule, and Tools stay in the footer. `/contact/` is a noindex compatibility page with a canonical to `/start/`; `/ways-to-work/` remains a useful noindex pathway chooser. `/government/`, `/insights/`, and `/resources/` are noindex signposts, excluded from the sitemap. Working instruments are noindex and excluded from the sitemap; this does **not** provide authentication or privacy.

The founder sequence is Founder Message Audit → Name the Headline™ Sprint → Receipts That Travel™. Doctrine Build™ is the Diagnose / Design / Deliver methodology. No pricing is published.

## Local build

Use a supported Ruby (3.3 recommended) and Bundler:

```sh
bundle install
bundle exec jekyll build --strict_front_matter
python3 scripts/check-site.py _site
bundle exec jekyll serve
```

`jekyll-sitemap` is supported by GitHub Pages and produces `/sitemap.xml`. `_config.yml` sets the custom-domain URL and excludes documentation, scripts, and tests from public output. The `CNAME` remains `portfolio.haus`.

Optional browser regression checks require Playwright and Chrome/Chromium. They do not participate in the production build:

```sh
PH_BASE_URL=http://127.0.0.1:4000 node tests/browser.cjs
```

Set `PH_BROWSER_EXECUTABLE` when using a system Chrome. Set `PH_SCREENSHOT_DIR` to save screenshots. No JavaScript framework, client bundler, or production Node dependency is used.

## Intake

The default intake prepares a selectable, editable inquiry with copy, download, and email draft actions. It sends nothing automatically and stores no answers across reloads. Email and LinkedIn remain available, including without JavaScript.

Direct submission is optional. See [the setup guide](docs/INTAKE-SETUP.md) for the exact Formspree connection and acceptance check. No API key belongs in this repository.

## Brand and evidence

Google Fonts supplies Inter and Libre Baskerville with `display=swap` and fallback fonts. Wordmark and display headings use Libre Baskerville Bold; signature moments use its italic. The fixed palette is navy, gold, and cream with neutral text tones. The Haus Lines have a 3px gap and a lighter second rule.

Work cases are explicitly Lauren Bush’s prior professional experience, with Hatcher, Martin Investment Group / Black Women Invest, and APLU credited. No source résumés, sensitive client work, confidential artifacts, or private proposal materials are included. See [the editorial record](docs/EDITORIAL-NOTES.md).

See [the launch checklist](LAUNCH-CHECKLIST.md) for remaining release actions.
