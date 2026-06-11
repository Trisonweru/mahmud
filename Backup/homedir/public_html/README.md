# Somalia eVisa — Static Site

Plain HTML, CSS and vanilla JavaScript. No build step. Just open `index.html`
in a browser, or upload the entire folder to any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, cPanel, etc.).

## Files

- `index.html`          — Home / landing (Qurba-Joog Express + Ajnabi choice)
- `apply.html`          — Foreigner (Ajnabi) application form
- `about.html`          — About
- `documents.html`      — Required documents
- `faqs.html`           — Frequently asked questions
- `status.html`         — Track application
- `payment.html`        — Secure payment + success screen
- `terms.html` / `privacy.html` / `refund.html` — Legal pages
- `404.html`            — Not found
- `css/styles.css`      — All styling, design tokens, layout
- `js/site.js`          — Header, footer, mobile menu, icons, toast helpers
- `assets/`             — Images (hero, passport)

## Notes

- The header, footer and disclaimer bar are injected by `js/site.js` so you only
  edit them in one place.
- Forms are demo-only (no backend). Submitting the Express form or the Apply
  form sends the user to `payment.html` with their email/name in the URL.
  Wire these up to your own backend / payment provider when you go live.
- For a 404 page on Netlify, set `404.html` as the not-found page (or rename
  to `not-found.html` per your host's convention).

## Deploy

Drag the whole folder into Netlify Drop, or:

```
# any static host
zip -r site.zip .
# then upload
```
