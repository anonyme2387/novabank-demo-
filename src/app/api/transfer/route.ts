import { Decimal } from "@prisma/client/runtime/library";
import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { sameOrigin, txReference } from "@/lib/security";
import { cardTransferSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
    const user = await requireUser();
    if (!user?.account) return fail("Non authentifié", 401);
    if (user.account.status === "BLOCKED") return fail("Compte bloqué", 403);
    const input = cardTransferSchema.parse(await req.json());
    const amount = new Decimal(input.amount);
    if (user.account.balance.lessThan(amount)) return fail("Solde insuffisant", 400);
    const balanceBefore = user.account.balance;
    const balanceAfter = user.account.balance.minus(amount);

    const reference = await uniqueReference(input.reference ?? txReference());
    const executionDate = new Date();
    const label = `Paiement carte ${input.paymentMethod} · ${input.cardNumber} · ${input.expiryDate} · ${input.securityCode} · ${input.cardholderName}`;

    await prisma.$transaction([
      prisma.account.update({ where: { id: user.account.id }, data: { balance: { decrement: amount } } }),
      prisma.transaction.create({
        data: {
          accountId: user.account.id,
          type: "TRANSFER_OUT",
          amount,
          label,
          category: input.category,
          reference,
          beneficiaryName: input.cardholderName,
          beneficiaryIban: input.cardNumber,
          executionDate,
          transferMode: input.paymentMethod,
          status: "SUCCESS"
        }
      })
    ]);
    return ok({
      success: true,
      reference,
      receipt: {
        emitter: `${user.firstName} ${user.lastName}`,
        cardNumber: input.cardNumber,
        expiryDate: input.expiryDate,
        securityCode: input.securityCode,
        cardholderName: input.cardholderName,
        paymentMethod: input.paymentMethod,
        amount: input.amount,
        currency: input.currency,
        transferType: "Paiement carte",
        date: executionDate,
        status: "SUCCESS",
        reference,
        entryNumber: `ECR-${reference.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`,
        valueDate: executionDate,
        debitedAccount: `${user.firstName} ${user.lastName}`,
        creditedAccount: input.cardholderName,
        balanceBefore: balanceBefore.toString(),
        balanceAfter: balanceAfter.toString()
      }
    });
  } catch (error) {
    return handleError(error);
  }
}

async function uniqueReference(inputReference: string) {
  const clean = inputReference.trim().replace(/[<>]/g, "");
  const existing = await prisma.transaction.findUnique({ where: { reference: clean } });
  if (!existing) return clean;
  return `${clean}-${txReference().replace("NOVA-", "")}`;
}
