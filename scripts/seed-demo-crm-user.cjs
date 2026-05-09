/**
 * Upserts a public demo admin user: CONTRIBUTOR role (create new CMS + products only;
 * cannot edit/delete existing rows — enforced in RBAC + server actions).
 *
 * Usage:
 *   npm run seed:demo-crm
 *   DEMO_CRM_EMAIL=x@y.com DEMO_CRM_PASSWORD='secret' npm run seed:demo-crm
 *
 * Requires DATABASE_URL (use dotenv via package.json). After changing Role enum, run:
 *   npm run db:push
 */
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.DEMO_CRM_EMAIL || "demo.crm@wearo.in").trim().toLowerCase();
  const password = process.env.DEMO_CRM_PASSWORD || "WearoPublicDemo!2026";
  const name = (process.env.DEMO_CRM_NAME || "Public CRM demo").trim();

  const hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      password: hash,
      role: "CONTRIBUTOR",
      emailVerified: new Date(),
    },
    update: {
      name,
      password: hash,
      role: "CONTRIBUTOR",
    },
  });

  console.log("");
  console.log("Demo CRM user ready (role: CONTRIBUTOR — create-only).");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("");
  console.log(
    "Sign in at /auth/login → opens CRM overview, orders, customers (read), can add new CMS docs and products only."
  );
  console.log(
    "Change DEMO_CRM_PASSWORD in production; do not expose real secrets in public demos."
  );
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
