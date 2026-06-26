# Portfolio Haus — Launch Checklist

A short, linear checklist for getting V1 live on GitHub Pages. For more detail on any step, see `README.md` in this same folder.

## Before uploading anything

- [ ] Open `index.html`, search for "TODO," and replace the placeholder email (`hello@example.com`, appears twice)
- [ ] In the same file, replace the placeholder LinkedIn URL (currently a generic `linkedin.com` link) with Lauren's real profile URL

## Put it on GitHub

- [ ] Create a free GitHub account if one doesn't exist yet
- [ ] Create a new **public** repository (GitHub Pages requires public on the free tier)
- [ ] Upload every file and folder from this package into that repository (drag-and-drop works, no command line needed)
- [ ] In the repo's Settings → Pages, set Source to "Deploy from a branch," branch `main`, folder `/ (root)`, then Save
- [ ] Wait a minute or two, then visit the `https://yourusername.github.io/your-repo-name/` URL GitHub gives you

## Check the live site

- [ ] Homepage loads and all five sections (Method, Ways to Work, Receipt Rule, About, FAQ) render correctly
- [ ] On a phone or a narrow browser window, tap the menu icon, confirm the mobile nav opens and closes
- [ ] Click every button: Start a Conversation, See the Method, Email Portfolio Haus, Connect on LinkedIn
- [ ] Confirm the email button opens to the real address, not `example.com`
- [ ] Confirm the LinkedIn button opens to the real profile, not the generic homepage
- [ ] Type a broken URL (like `/nothing-here`) and confirm the custom 404 page shows up instead of GitHub's default

## Later, not tonight

- [ ] Buy a domain on Porkbun (portfoliohaus.co, portfolio.haus, or portfoliohaus.studio)
- [ ] Connect it under Settings → Pages → Custom domain, then add the DNS records GitHub shows you
- [ ] Open `_config.yml`, set `url: "https://yourdomain.com"` (your real domain), commit and push. This makes `og:image` resolve to a full URL, which Facebook, LinkedIn, and Slack need to render link previews reliably.
- [ ] Revisit the open items in the private roadmap doc (kept separate from this package on purpose, see note in `README.md`): House Build™ naming, the first free resource, the Haus Map design concept, and the dormant Insights/Resources/Founder Lane/Government/About pages already sitting in this codebase
