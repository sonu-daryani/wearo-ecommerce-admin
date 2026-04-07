/**
 * Promote a user to SUPERADMIN by email (MongoDB / Prisma).
 * Usage: npm run set-superadmin -- you@example.com
 * Super admins can delete seeded catalog products (`isDefault: true`).
 */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run set-superadmin -- <email>");
    process.exit(1);
  }

  const result = await prisma.user.updateMany({
    where: { email },
    data: { role: "SUPERADMIN" },
  });

  if (result.count === 0) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  console.log(
    `Updated ${result.count} user(s) to SUPERADMIN. Sign out and sign in again to refresh your session.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
