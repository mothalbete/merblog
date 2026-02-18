const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const r = await prisma.$queryRaw`SELECT 1 AS ok`;
  console.log("✅ Conexión OK:", r);

  const info = await prisma.$queryRaw`
    SELECT current_database() AS db, current_user AS user, inet_server_port() AS port
  `;
  console.log("ℹ️ Info:", info);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
