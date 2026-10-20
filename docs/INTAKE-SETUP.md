# Start intake: current operation and optional connection

## Usable immediately

Leave `intake_endpoint: ""` in `_config.yml`. The visitor completes labeled, browser-validated fields and chooses **Prepare My Inquiry**. The page shows the complete editable text and explicitly says nothing has been sent. They can copy it into email, download it, or open an email draft addressed to `biz.portfoliohaus@gmail.com`.

The draft intentionally contains a short note asking the visitor to paste or attach the full inquiry. Mailto URI length limits differ between clients; the complete inquiry always remains in the selectable text and download. No silent truncation or success claim is used. No form values are persisted to browser storage or placed in a URL. Only allowlisted pathway, offer, and diagnosis names are accepted from incoming query parameters.

Without JavaScript, email and LinkedIn remain available. A disconnected local form has its preparation button disabled in the HTML and enabled only when its client script is available. A configured native POST works without JavaScript.

## Connect direct delivery (Lauren’s account)

1. Sign into [Formspree](https://formspree.io/), create a form, set the receiving address, and complete any required email verification.
2. Copy the form’s **public endpoint**, shaped `https://formspree.io/f/FORM_ID`.
3. Set `_config.yml` → `intake_endpoint` to that exact HTTPS endpoint. Never add an account token, secret, or API key.
4. Rebuild and preview. The button should now say **Send Inquiry** and the form should have `method="post"` and the configured action.
5. Submit one clearly labeled test using a real address you control. Confirm all visible answers plus pathway, requested offer, and diagnosis arrive in the receiving inbox; check reply-to handling and spam settings in Formspree.
6. Confirm the handler’s success page and an intentional failure response. A successful delivery is **not** established until the test reaches the inbox. The website uses native POST and never fabricates a sent state.
7. Delete the test inquiry when finished. Publish only when the recipient and success / failure behavior are correct.

The endpoint is intentionally blank because no Formspree account or verified endpoint was supplied. This does not block the local preparation / email flow. Account selection, pricing, retention settings, spam controls, and inbox verification belong to Lauren. The site discloses the processor and links its privacy policy when connected.

## Data and security

The site does not accept file uploads. Visitors are asked to keep confidential, patient, and sensitive internal information out of the first inquiry. The direct form includes a honeypot field. Apply any further spam or domain rules in the handler account. GitHub Pages cannot securely operate a custom server or conceal an API key; do not implement email delivery with a client-side secret.

## Haus Signal

The floating router is static and rule based. Messages stay in memory on the current page, and disappear on navigation or reload. It routes to founder, institutional, opportunity, or scoped inquiry paths. It does not send the conversation, make availability promises, quote fees, or operate an AI backend.

References: [Formspree native HTML forms](https://formspree.io/html/), [Google Fonts CSS API](https://developers.google.com/fonts/docs/css2).
