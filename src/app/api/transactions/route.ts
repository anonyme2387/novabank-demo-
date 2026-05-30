import { TransactionType } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER_IN", "TRANSFER_OUT"]).optional()
});

export async function GET(req: Request) {
  const user = await requireUser();
  if (!user?.account) return fail("Non authentifié", 401);
  const parsed = querySchema.safeParse({ type: new URL(req.url).searchParams.get("type") || undefined });
  if (!parsed.success) return fail("Type de transaction invalide", 422);
  const type = parsed.data.type as TransactionType | undefined;
  const transactions = await prisma.transaction.findMany({
    where: { accountId: user.account.id, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return ok(transactions.map((tx) => ({ ...tx, amount: tx.amount.toString() })));
}
