import bcrypt from "bcrypt";
import { PrismaClient, Role, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

function ibanFake(seed: number) {
  return `NBFR FR76 3000 6000 ${String(100000 + seed)} 0000 ${String(1000 + seed)} 189`;
}

function cardNumber(seed: number) {
  return `4975 9200 ${String(2000 + seed).slice(0, 4)} ${String(8000 + seed).slice(0, 4)}`;
}

async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
  seed: number;
  balance: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.user.deleteMany({ where: { email: input.email } });
  return prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: input.role ?? Role.USER,
      account: {
        create: {
          ibanFake: ibanFake(input.seed),
          balance: input.balance,
          card: {
            create: {
              cardNumberFake: cardNumber(input.seed),
              expiryDate: "12/29",
              cvvFake: String(300 + input.seed).slice(0, 3)
            }
          }
        }
      }
    },
    include: { account: true }
  });
}

async function addTransactions(accountId: string) {
  const rows = [
    [TransactionType.DEPOSIT, "Salaire mensuel", "2840.00", "autre"],
    [TransactionType.WITHDRAWAL, "Loyer résidence", "720.00", "logement"],
    [TransactionType.WITHDRAWAL, "Pass Navigo", "86.40", "transport"],
    [TransactionType.WITHDRAWAL, "Courses Carrefour", "64.20", "alimentation"],
    [TransactionType.WITHDRAWAL, "Cinéma vendredi", "18.50", "loisirs"],
    [TransactionType.WITHDRAWAL, "Librairie universitaire", "42.90", "études"],
    [TransactionType.DEPOSIT, "Remboursement ami", "120.00", "autre"]
  ] as const;
  await prisma.transaction.createMany({
    data: rows.map(([type, label, amount, category], index) => ({
      accountId,
      type,
      amount,
      label,
      category,
      reference: `NOVA-2026-SEED-${accountId.slice(-4)}-${index}`,
      status: "SUCCESS",
      createdAt: new Date(Date.now() - index * 36 * 60 * 60 * 1000)
    }))
  });
}

async function main() {
  await prisma.loginLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: ["clara.dubois@novabank-app.com", "yanis.benali@novabank-app.com", "clara.dubois@novabank.test", "yanis.benali@novabank.test"] } } });

  const admin = await createUser({
    firstName: "Admin",
    lastName: "NovaBank",
    email: "admin@novabank-app.com",
    password: "NovaAdmin#Ultra2026!",
    role: Role.ADMIN,
    seed: 1,
    balance: "12500.00"
  });

  const alexandre = await createUser({
    firstName: "Alexandre",
    lastName: "Martin",
    email: "alexandre.martin@novabank-app.com",
    password: "AxM#Secure2026!Bank",
    seed: 42,
    balance: "10234.00"
  });

  for (const account of [admin.account!, alexandre.account!]) {
    await addTransactions(account.id);
  }

  await prisma.loginLog.createMany({
    data: [
      { userId: admin.id, ipAddress: "192.168.10.xxx", country: "France", browser: "Chrome", device: "Ordinateur" },
      { userId: alexandre.id, ipAddress: "172.16.24.xxx", country: "France", browser: "Safari", device: "Mobile" }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
