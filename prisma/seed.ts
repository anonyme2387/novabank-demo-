import bcrypt from "bcrypt";
import { PrismaClient, Role, TransactionType } from "@prisma/client";

const prisma = new PrismaClient();

function ibanFake(seed: number) {
  return `NVBA FR76 3000 4000 ${String(seed).padStart(6, "0")} 0000 0000 189`;
}

function cardNumber(seed: number) {
  return `4975 9200 ${String(seed).padStart(4, "0")} ${String(1000 + seed).slice(0, 4)}`;
}

async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
  seed: number;
  balance?: string;
}) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.upsert({
    where: { email: input.email },
    update: {},
    create: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: input.role ?? Role.USER,
      account: {
        create: {
          ibanFake: ibanFake(input.seed),
          balance: input.balance ?? "1000.00",
          card: {
            create: {
              cardNumberFake: cardNumber(input.seed),
              expiryDate: "12/29",
              cvvFake: String(100 + input.seed).slice(0, 3)
            }
          }
        }
      }
    },
    include: { account: true }
  });
  return user;
}

async function main() {
  const admin = await createUser({
    firstName: "Admin",
    lastName: "NovaBank",
    email: "admin@novabank.demo",
    password: "Admin123!",
    role: Role.ADMIN,
    seed: 1,
    balance: "8500.00"
  });

  const alice = await createUser({
    firstName: "Alice",
    lastName: "Martin",
    email: "alice@novabank.demo",
    password: "Demo123!",
    seed: 2,
    balance: "1840.75"
  });

  const yanis = await createUser({
    firstName: "Yanis",
    lastName: "Benali",
    email: "yanis@novabank.demo",
    password: "Demo123!",
    seed: 3,
    balance: "720.20"
  });

  await prisma.transaction.deleteMany({});
  const accounts = [admin.account!, alice.account!, yanis.account!];
  for (const account of accounts) {
    await prisma.transaction.createMany({
      data: [
        { accountId: account.id, type: TransactionType.DEPOSIT, amount: "1000.00", label: "Dépôt fictif initial" },
        { accountId: account.id, type: TransactionType.WITHDRAWAL, amount: "45.50", label: "Retrait virtuel de démonstration" },
        { accountId: account.id, type: TransactionType.DEPOSIT, amount: "220.00", label: "Prime virtuelle NovaBank" }
      ]
    });
  }

  await prisma.loginLog.createMany({
    data: [
      { userId: admin.id, ipAddress: "192.168.10.xxx", country: "France", browser: "Chrome", device: "Ordinateur" },
      { userId: alice.id, ipAddress: "172.16.24.xxx", country: "France", browser: "Safari", device: "Mobile" }
    ]
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
