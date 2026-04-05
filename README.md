# Wearo Admin

Separate Next.js app for **CMS**, **site images**, **product catalog**, **company & payment settings**, and future **CRM** screens. It shares the **same MongoDB database and Prisma schema** as the storefront ([wearo-ecommerce](https://github.com/sonu-daryani/wearo-ecommerce)).

---

## Run locally

```bash
git clone https://github.com/sonu-daryani/wearo-ecommerce-admin.git
cd wearo-admin
npm install
cp .env.example .env.local
```

Set in **`.env.local`**:

- **`DATABASE_URL`** — same MongoDB as the storefront
- **`AUTH_SECRET`**, **`AUTH_URL=http://localhost:3001`**
- **Google OAuth** (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) — redirect URI: `http://localhost:3001/api/auth/callback/google`
- **`R2_*`** — optional R2 uploads for CMS / catalog images
- **`NEXT_PUBLIC_STOREFRONT_URL`** — sidebar “Storefront” link (e.g. `http://localhost:3000`)

```bash
npm run dev
```

Open [http://localhost:3001/admin](http://localhost:3001/admin). Roles: `VIEWER`, `EDITOR`, `ADMIN` (use `npm run set-admin` or your DB script).

After schema changes: **`npx prisma db push`** (or your `db:push` script) so `CompanySettings` and related models exist.

---

## Company & payment settings

- **`/admin/settings`** — company name, logo, SEO, **currency** (code, symbol, locale, decimals).
- **`/admin/settings/payment`** — COD fees, online channels (UPI, card, wallet, net banking), **payment providers** (Stripe, Razorpay, Cashfree):
  - Add providers from a dropdown; each provider has a card with **integration + keys** modal and **remove**.
  - **Publishable / App ID** fields and **API secrets** are stored in MongoDB and used only on the server (storefront reads the same DB for payment APIs).

The storefront exposes public flags via **`GET /api/company-settings`** (no secrets).

---

## Storefront link

In the **customer app** `.env`:

- `NEXT_PUBLIC_ADMIN_PORTAL_URL=http://localhost:3001` — “Admin portal” on `/account`.

---

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Dev server on port **3001** |
| `npm run build` | `prisma generate` + `next build` |
| `npm run db:push` | Prisma `db push` with `.env.local` |
| `npm run set-admin` | Promote a user to admin (see `package.json`) |

---

## Reverse proxy (optional)

- Storefront can proxy APIs via `BACKEND_PROXY_*` (see storefront `.env.example`).
- Serving admin under the storefront origin (`/__/admin`) needs `ADMIN_APP_ORIGIN` / cookie setup on the storefront — separate tabs + `NEXT_PUBLIC_ADMIN_PORTAL_URL` is simpler.

---

## Maintainer

**Sonu Daryani** — [@sonu-daryani](https://github.com/sonu-daryani)
