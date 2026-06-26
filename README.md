# Portfolio Haus Website — V1 (Launch)

This is the full source for the Portfolio Haus site. It's built as a Jekyll site, but **you do not need to install Ruby or anything else on your computer.** GitHub Pages builds Jekyll sites automatically on its own servers the moment you upload files. Your job is just to get the files into a GitHub repository.

**Start with `LAUNCH-CHECKLIST.md`** in this same folder for the short, linear version of everything below.

## Before you publish

Open `index.html` and replace these placeholders. Each one is marked with an HTML comment (`<!-- TODO before launch... -->`) directly above it, in the Contact section, so search for "TODO" to find both fast.

1. `hello@example.com` → your real email
2. `https://www.linkedin.com/` → your real LinkedIn profile URL

`example.com` is a placeholder on purpose. It isn't a real domain, so the site can't quietly point to a wrong or fake address if you forget to swap it before publishing.

## Publishing with no command line

1. Go to [github.com](https://github.com) and create a free account if you don't already have one.
2. Click the **+** in the top right corner → **New repository**.
   - Name it `portfolio-haus-website` (or anything you like).
   - Set it to **Public** (GitHub Pages requires this on a free account).
   - Don't add a README, .gitignore, or license — leave it empty.
3. On the new repo's page, click **uploading an existing file**.
4. Drag in every file and folder from this project and commit them. That's `_config.yml`, `_includes`, `_layouts`, `assets` (including the headshot at `assets/images/lauren-bush-headshot.jpg`), `index.html`, `404.html`, `README.md`, `LAUNCH-CHECKLIST.md`, the now-live `about`, `ways-to-work`, `method`, `receipts`, and `contact` folders, and the still-dormant `insights`, `resources`, `founders`, and `government` folders.
   - GitHub's drag-and-drop upload preserves folder structure, so you can drop the whole unzipped project folder in at once.
   - `404.html` must stay at the root (not inside a folder) for GitHub Pages to serve it automatically on any broken link.
5. Go to the repo's **Settings** tab → **Pages** in the left sidebar.
6. Under "Build and deployment," set **Source** to "Deploy from a branch," branch `main`, folder `/ (root)`. Save.
7. Wait one to two minutes. GitHub will show you a live URL like `https://yourusername.github.io/portfolio-haus-website/`. That's your site.

## Connecting a custom domain later (Porkbun)

1. Buy the domain on Porkbun (portfoliohaus.co, portfolio.haus, or portfoliohaus.studio per the brief).
2. In the GitHub repo → Settings → Pages → "Custom domain," enter your domain and save. GitHub will create a `CNAME` file in your repo automatically.
3. In Porkbun's DNS settings for that domain, add the records GitHub shows you on that same Pages settings screen.
4. DNS changes can take anywhere from a few minutes to a few hours to take effect.

## A note on what's NOT in this package

The private roadmap doc is deliberately not included here, even though it was requested as `roadmap.md` inside the launch zip. That file's own header says "not part of the public site, not for client or prospect distribution," and this repository will be public the moment it's on GitHub Pages (a requirement of the free tier). Bundling internal strategy notes, naming deliberations, and future positioning thinking into a public repo would contradict the reason that file exists. It's still being delivered, just as a separate file outside this package, the way it has been all along.

## Site structure as of this version

Portfolio Haus is now a real multi-page site, not a single-page scroll. Live, linked-in-nav pages: `/` (home), `/about/`, `/ways-to-work/`, `/method/`, `/receipts/`, `/contact/`. The homepage keeps short "snapshot" versions of each, with pathway links to the full page, so nothing on the homepage duplicates the deeper pages, it previews them.

Still dormant, not in nav: `insights/`, `resources/`, `founders/`, `government/`. Each links back to the homepage and is marked "Coming Later."

A possible future "Lauren Bush" personal hub (connecting Portfolio Haus, Rally Off Court, and other projects) is intentionally not part of this folder structure. If it happens, it's a separate site on its own domain, not a Portfolio Haus subpage.
