import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { demoAccounts, ensureDemoAccount } from "../src/lib/demo-accounts";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "clara.dubois@novabank-app.com",
          "yanis.benali@novabank-app.com",
          "clara.dubois@novabank.test",
          "yanis.benali@novabank.test"
        ]
      }
    }
  });

  const users = [];
  for (const account of demoAccounts) {
    const user = await ensureDemoAccount(prisma, bcrypt, account.email, account.password);
    if (user) users.push(user);
  }

  for (const user of users) {
    const existingLogs = await prisma.loginLog.count({ where: { userId: user.id } });
    if (existingLogs === 0) {
      await prisma.loginLog.create({
        data: {
          userId: user.id,
          ipAddress: user.email.startsWith("admin") ? "192.168.10.xxx" : "172.16.24.xxx",
          country: "France",
          browser: user.email.startsWith("admin") ? "Chrome" : "Safari",
          device: user.email.startsWith("admin") ? "Ordinateur" : "Mobile"
        }
      });
    }
  }
}

main()
  .catch((error) => {
    console.error("[NovaBank][seed]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
