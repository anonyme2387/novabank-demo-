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
    balance: "8420.75"
  });

  const clara = await createUser({
    firstName: "Clara",
    lastName: "Dubois",
    email: "clara.dubois@novabank-app.com",
    password: "Clara$Vault2026!NB",
    seed: 73,
    balance: "3250.40"
  });

  const yanis = await createUser({
    firstName: "Yanis",
    lastName: "Benali",
    email: "yanis.benali@novabank-app.com",
    password: "YB!Finance2026#Safe",
    seed: 88,
    balance: "1275.90"
  });

  for (const account of [admin.account!, alexandre.account!, clara.account!, yanis.account!]) {
    await addTransactions(account.id);
  }

  await prisma.loginLog.createMany({
    data: [
      { userId: admin.id, ipAddress: "192.168.10.xxx", country: "France", browser: "Chrome", device: "Ordinateur" },
      { userId: alexandre.id, ipAddress: "172.16.24.xxx", country: "France", browser: "Safari", device: "Mobile" },
      { userId: clara.id, ipAddress: "10.12.48.xxx", country: "Belgique", browser: "Chrome", device: "Ordinateur" },
      { userId: yanis.id, ipAddress: "172.20.18.xxx", country: "France", browser: "Firefox", device: "Mobile" }
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
