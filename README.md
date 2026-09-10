# Skyclerk.com

Public marketing site for Skyclerk.

# Development Notes

- `npx tailwindcss build assets/css/style.css -o assets/css/build.css`

- `hugo server -D`

# Github Pages

To support github pages we build to `docs` instead of a `public` directory.

# Support form spam protection

The contact form uses Cloudflare Turnstile with the public `turnstileSiteKey` in
`config.toml`. The matching secret is stored only in the `app.skyclerk.com`
server's `TURNSTILE_SECRET_KEY`; never add it to this repository. The keys belong
to 1Password item **Cloudflare Turnstile - Skyclerk.com**, also used for signup.
The widget must allow `skyclerk.com` (including `www.skyclerk.com`) as well as
`app.skyclerk.com` for signup.

The form sends `turnstile_token` to
`https://app.skyclerk.com/support/contact-us`. That server verifies the token,
the `support_contact` action, and the hostname before sending any email or Slack
notification. The server change is in the sibling `app.skyclerk.com` repository.
Both repositories must be deployed to activate protection; deploy the marketing
site first so its form supplies tokens before the backend starts requiring them.

Run `npm test` for form lifecycle and submission tests and `hugo` to build the
site. Build into a temporary destination when checking changes to avoid
overwriting unrelated work in `docs`.

For browser checks, Cloudflare's public testing key
`1x00000000000000000000AA` can render a test widget, with the support endpoint
intercepted by the test. Never send test support messages to production or deploy
the testing key. Backend tests mock Siteverify; production always requires real
verification, including the expected action and hostname.
