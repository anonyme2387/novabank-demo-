import { TransactionType } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user?.account) return fail("Non authentifié", 401);
  const type = new URL(req.url).searchParams.get("type") as TransactionType | null;
  const transactions = await prisma.transaction.findMany({
    where: { accountId: user.account.id, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return ok(transactions.map((tx) => ({ ...tx, amount: tx.amount.toString() })));
}
