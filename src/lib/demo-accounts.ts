import { Role, TransactionType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

type BcryptLike = {
  hash(password: string, rounds: number): Promise<string>;
};

export const demoAccounts = [
  {
    firstName: "Alexandre",
    lastName: "Martin",
    email: "alexandre.martin@novabank-app.com",
    password: "NovaSecure#2026",
    balance: "10234.00",
    seed: 42,
    role: Role.USER
  },
  {
    firstName: "Admin",
    lastName: "NovaBank",
    email: "admin@novabank-app.com",
    password: "NovaAdmin#Ultra2026!",
    balance: "12500.00",
    seed: 1,
    role: Role.ADMIN
  }
] as const;

export function demoIban(seed: number) {
  return `NBFR FR76 9900 6000 ${String(200000 + seed)} 0000 ${String(2000 + seed)} 189`;
}

export function demoCardNumber(seed: number) {
  return `4975 9200 ${String(2000 + seed).slice(0, 4)} ${String(8000 + seed).slice(0, 4)}`;
}

export async function ensureDemoAccount(prisma: PrismaClient, bcrypt: BcryptLike, email: string, password: string) {
  const demo = demoAccounts.find((item) => item.email === email && item.password === password);
  if (!demo) return null;

  const passwordHash = await bcrypt.hash(demo.password, 12);
  const user = await prisma.user.upsert({
    where: { email: demo.email },
    update: { passwordHash, firstName: demo.firstName, lastName: demo.lastName, role: demo.role },
    create: {
      firstName: demo.firstName,
      lastName: demo.lastName,
      email: demo.email,
      passwordHash,
      role: demo.role
    },
    include: { account: true }
  });

  let account = user.account;
  if (!account) {
    account = await prisma.account.create({
      data: {
        userId: user.id,
        ibanFake: demoIban(demo.seed),
        balance: demo.balance,
        card: {
          create: {
            cardNumberFake: demoCardNumber(demo.seed),
            expiryDate: "12/29",
            cvvFake: String(300 + demo.seed).slice(0, 3)
          }
        }
      }
    });
  } else {
    account = await prisma.account.update({
      where: { id: account.id },
      data: {
        ibanFake: account.ibanFake || demoIban(demo.seed),
        status: "ACTIVE",
        card: {
          upsert: {
            create: {
              cardNumberFake: demoCardNumber(demo.seed),
              expiryDate: "12/29",
              cvvFake: String(300 + demo.seed).slice(0, 3)
            },
            update: {
              cardNumberFake: demoCardNumber(demo.seed),
              expiryDate: "12/29",
              status: "ACTIVE"
            }
          }
        }
      }
    });
  }

  const transactionCount = await prisma.transaction.count({ where: { accountId: account.id } });
  if (transactionCount === 0) {
    await prisma.transaction.createMany({
      data: [
        { accountId: account.id, type: TransactionType.DEPOSIT, amount: "2840.00", label: "Salaire mensuel", category: "autre", reference: `NOVA-SEED-${demo.seed}-SALARY`, status: "SUCCESS" },
        { accountId: account.id, type: TransactionType.WITHDRAWAL, amount: "720.00", label: "Loyer résidence", category: "logement", reference: `NOVA-SEED-${demo.seed}-RENT`, status: "SUCCESS" },
        { accountId: account.id, type: TransactionType.WITHDRAWAL, amount: "86.40", label: "Pass transport", category: "transport", reference: `NOVA-SEED-${demo.seed}-TRANSPORT`, status: "SUCCESS" }
      ],
      skipDuplicates: true
    });
  }

  return prisma.user.findUnique({ where: { id: user.id }, include: { account: true } });
}
