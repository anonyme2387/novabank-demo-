import { Decimal } from "@prisma/client/runtime/library";
import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { transferSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user?.account) return fail("Non authentifié", 401);
    if (user.account.status === "BLOCKED") return fail("Compte bloqué", 403);
    const input = transferSchema.parse(await req.json());
    const amount = new Decimal(input.amount);
    if (user.account.balance.lessThan(amount)) return fail("Solde insuffisant", 400);

    const recipient = await prisma.account.findFirst({
      where: {
        OR: [{ ibanFake: input.recipient }, { user: { email: input.recipient.toLowerCase() } }]
      },
      include: { user: true }
    });
    if (!recipient) return fail("Destinataire introuvable", 404);
    if (recipient.id === user.account.id) return fail("Auto-virement impossible", 400);
    if (recipient.status === "BLOCKED") return fail("Compte destinataire bloqué", 403);

    await prisma.$transaction([
      prisma.account.update({ where: { id: user.account.id }, data: { balance: { decrement: amount } } }),
      prisma.account.update({ where: { id: recipient.id }, data: { balance: { increment: amount } } }),
      prisma.transaction.create({
        data: { accountId: user.account.id, relatedAccountId: recipient.id, type: "TRANSFER_OUT", amount, label: input.label, status: "SUCCESS" }
      }),
      prisma.transaction.create({
        data: { accountId: recipient.id, relatedAccountId: user.account.id, type: "TRANSFER_IN", amount, label: input.label, status: "SUCCESS" }
      })
    ]);
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
