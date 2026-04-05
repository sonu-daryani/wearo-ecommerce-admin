# Wearo E-commerce Admin

Next.js admin app for **CMS**, **company & payment settings**, **site images**, **product catalog**, and staff workflows. It uses the **same MongoDB database** and Prisma `CompanySettings` model as the storefront.

**Repository:** [github.com/sonu-daryani/wearo-ecommerce-admin](https://github.com/sonu-daryani/wearo-ecommerce-admin)

## Requirements

- Node.js 18+
- MongoDB (e.g. Atlas) — same `DATABASE_URL` as the storefront
- Optional: Cloudflare R2 (or compatible S3) for uploads

## Run locally

```bash
git clone https://github.com/sonu-daryani/wearo-ecommerce-admin.git
cd wearo-ecommerce-admin
npm install
cp .env.example .env.local
```

Set in `.env.local`:

- `DATABASE_URL` — Mongo connection string  
- `AUTH_SECRET` — random secret (e.g. `openssl rand -base64 32`)  
- `AUTH_URL` — `http://localhost:3001` locally  
- Google OAuth (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) — redirect URI: `http://localhost:3001/api/auth/callback/google`  
- `R2_*` variables if you use R2 uploads  
- `NEXT_PUBLIC_STOREFRONT_URL` — customer site (sidebar “Storefront” link)

```bash
npx prisma generate
npm run dev
```

Open [http://localhost:3001/admin](http://localhost:3001/admin). Roles: `VIEWER`, `EDITOR`, `ADMIN` (promote users with `npm run set-admin` or your seed script).

## Payment settings

**Admin → Payment settings:** configure COD fees, online channels, and gateways (**Stripe**, **Razorpay**, **Cashfree**). API secrets are stored in MongoDB and used only on the server; the storefront reads the same DB for payment APIs.

After schema changes: `npx prisma db push` (or your migration flow), then open **Company settings** / **Payment settings** once if the default `CompanySettings` row is missing.

## Storefront

The customer app loads public branding and checkout flags from **`GET /api/company-settings`** on the storefront (not from this repo).

In the storefront `.env`:

- `NEXT_PUBLIC_ADMIN_PORTAL_URL=http://localhost:3001` — “Admin portal” link on `/account`.

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema to MongoDB |
| `npm run db:studio` | Prisma Studio |
| `npm run set-admin` | Set admin role (see script / `.env`) |

## Optional: reverse proxy

The storefront can proxy APIs or mount admin under a path; see the storefront `next.config` and env docs. Separate tabs + `NEXT_PUBLIC_ADMIN_PORTAL_URL` are usually simpler for OAuth.

## License

Private / use per your organization.
