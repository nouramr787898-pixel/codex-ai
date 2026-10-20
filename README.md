# Codexa AI — GitHub root files

All web files are now at the ZIP top level: `index.html`, `style.css`, `app.js`, images, and server files. Upload the extracted contents directly to the repository root (not the enclosing folder).

**Important:** GitHub Pages only hosts static files. This project uses Node.js + SQLite for customer inquiries and the admin dashboard. On GitHub Pages, the visual interface is visible but the API-dependent services (form submission and admin functionality) **will not work**. Run the Node server on a Node-capable host with persistent storage, and connect your domain there to enable them. Do not add a real `.env` file, database, or credentials to your public GitHub repository.

For the full setup instructions, see below.

---

# Codexa AI — production-oriented full-stack website

Arabic/English responsive brand website, five service cards, price offer, real inquiry storage, portfolio, and password-protected content and inquiry management.

## Quick start

1. Install **Node.js 20 or 22** and run `npm install`.
2. Copy `.env.example` to `.env` and change `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `SESSION_SECRET` (generate secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
3. For local testing use `NODE_ENV=development`, `TRUST_PROXY=0`, and `BASE_URL=http://localhost:3000` in `.env`.
4. Start with `npm start`. Public site: `http://localhost:3000`, admin: `http://localhost:3000/admin`.
5. In the admin panel, verify the 5-year experience wording, starting price, 50% discount eligibility and all offer terms **before publishing**.

## Real features

- Inquiries submitted to `/api/inquiries` are saved in persistent server-side SQLite. Success appears only after a database insert succeeds.
- Admin session authentication uses a bcrypt-hashed environment password and an HttpOnly, SameSite cookie; HTTPS-only cookie in production.
- Admin can review/delete inquiries and edit all copy, service cards, offers and portfolio project records using a JSON editor.
- Portfolio defaults to empty instead of fabricated client examples.
- Language and light/dark mode use localStorage **only for appearance preferences**. Customer inquiries are never stored in the browser.
- WhatsApp contact buttons open the provided business number. They do not claim a message was sent.
- The 3D-like hero uses CSS animation plus the **unchanged original user-provided image**.

## Deployment

Use a **Node.js host with persistent storage** such as Railway with a mounted persistent volume. GitHub Pages alone cannot run the Node/SQLite backend.

1. Push the project to a **private repository** (never include `.env` or the DB).
2. Provision a Node web service, set build `npm install`, start `npm start`, and set `NODE_ENV=production`, `BASE_URL=https://codexaai.online`, `SESSION_SECRET` (32+ characters), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), `TRUST_PROXY=1` (only if the host terminates HTTPS as a trusted proxy), `DATA_DIR=/data`.
3. Attach **persistent volume mounted at `/data`** (or use a permanent path on your server). Without it, redeployments may erase inquiries, sessions, or edits. Configure backups.
4. Add custom domain `codexaai.online` in the hosting control panel. Update the A/CNAME records **to exactly what that provider specifies**, then enable HTTPS. Never guess the DNS target.
5. Verify both public site and `/admin`, submit a test inquiry, confirm it appears in dashboard; check HTTPS and security headers.
6. Consider production anti-spam upgrades: CAPTCHA/Turnstile server-side verification and distributed rate limiting if you scale to multiple instances. The included IP rate limit and honeypot are basic safeguards only.

## Important operational notes

- Service/offer/project content is edited as JSON; invalid JSON will not save. Admin is for trusted staff only.
- Admin login has **one server-configured credential**; no multi-user permissions/roles, password reset, rich WYSIWYG editor, native image uploads or third-party analytics. These require further implementation.
- Project images are HTTPS URLs managed by the administrator. Do not enter arbitrary URLs unless trusted.
- The 5 years claim is **marked as unverified**, per the brief. Update it in the admin panel after confirming.
- The price and discount are drafts until verified; there is no payment processing, automatic WhatsApp submission, or false analytics data.
- The privacy page is a draft, **not legal advice**; adapt to actual retention rules, company contact details and applicable laws before launch.
- Backups: back up `/data` regularly, including SQLite WAL/shm files consistently (prefer SQLite online backup procedures).
- If user-generated HTML/rich text is later added, enforce strict sanitization.


### Visual update (20 October 2026)
- Replaced static hero cube with self-contained animated laptop dashboard. All numbers on dashboard are illustrative, not live analytics.
- Technology logo strip uses local SVG files in `logo-*.svg`; upload these files alongside the root files to GitHub Pages (it is required).
- Dashboard sidebar automatically cycles and is clickable; respects reduced-motion setting.
- GitHub Pages cannot run the Node.js backend; contact form/admin features require server deployment.


## Glow effect (v5)
Blue cursor-following spotlight and luminous rim added site-wide to interactive cards, project tiles, stats, buttons, WhatsApp, and form panels. No external assets. Respects reduced-motion and touch preferences.

## October 20 consolidated website update
- Hero statistics: 230 websites, 50 apps, 5 years (animated on each visibility entry). Confirm figures before publication.
- Animated shine + hover effects, four-card statistics, orbital Why Codexa, four FAQs, call/WhatsApp buttons with phone vibration.
- Top 3 services are previewed, and an expandable catalog contains 11 total services. The footer links to all 11 services.
- Project cards open a local details dialog; no outbound competitor portfolio URLs remain in the project metadata. The gallery currently displays 47 named samples and does **not** establish Codexa authorship, ownership, or customer approval. Replace or obtain permissions before making public claims.
- Added site-data.js for static GitHub Pages rendering when API is unavailable. **Important:** GitHub Pages is static only: inquiry submission, admin and persistent content editing will not work there.
- The service-area strip uses bundled local technology logo SVGs, not purported customer logos.
