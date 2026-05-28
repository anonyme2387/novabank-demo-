import { Decimal } from "@prisma/client/runtime/library";
import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { sameOrigin, txReference } from "@/lib/security";
import { transferSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
    const user = await requireUser();
    if (!user?.account) return fail("Non authentifié", 401);
    if (user.account.status === "BLOCKED") return fail("Compte bloqué", 403);
    const input = transferSchema.parse(await req.json());
    const amount = new Decimal(input.amount);
    if (user.account.balance.lessThan(amount)) return fail("Solde insuffisant", 400);
    const balanceBefore = user.account.balance;
    const balanceAfter = user.account.balance.minus(amount);

    const recipient = await prisma.account.findFirst({
      where: {
        OR: [{ ibanFake: input.iban }, { ibanFake: input.recipient }, { user: { email: input.recipient.toLowerCase() } }]
      },
      include: { user: true }
    });
    if (recipient?.id === user.account.id) return fail("Auto-virement impossible", 400);
    if (recipient?.status === "BLOCKED") return fail("Compte destinataire bloqué", 403);

    const reference = await uniqueReference(input.reference);
    const creditReference = recipient ? await uniqueReference(`${reference}-C`) : "";
    const executionDate = new Date(input.executionDate);
    const writes = [
      prisma.account.update({ where: { id: user.account.id }, data: { balance: { decrement: amount } } }),
      prisma.transaction.create({
        data: {
          accountId: user.account.id,
          relatedAccountId: recipient?.id,
          type: "TRANSFER_OUT",
          amount,
          label: input.label,
          category: input.category,
          reference,
          beneficiaryName: input.beneficiary,
          beneficiaryIban: input.iban,
          executionDate,
          transferMode: input.mode,
          status: "SUCCESS"
        }
      })
    ];

    if (recipient) {
      writes.push(
        prisma.account.update({ where: { id: recipient.id }, data: { balance: { increment: amount } } }),
        prisma.transaction.create({
        data: {
          accountId: recipient.id,
          relatedAccountId: user.account.id,
          type: "TRANSFER_IN",
          amount,
          label: input.label,
          category: input.category,
          reference: creditReference,
          beneficiaryName: `${user.firstName} ${user.lastName}`,
          beneficiaryIban: user.account.ibanFake,
          executionDate,
          transferMode: input.mode,
          status: "SUCCESS"
        }
        })
      );
    }

    await prisma.$transaction(writes);
    return ok({
      success: true,
      reference,
      receipt: {
        emitter: `${user.firstName} ${user.lastName}`,
        beneficiary: input.beneficiary,
        iban: input.iban,
        amount: input.amount,
        currency: input.currency,
        transferType: recipient ? "Interne NovaBank" : "Externe simulé",
        date: executionDate,
        status: "SUCCESS",
        reference,
        entryNumber: `ECR-${reference.replace(/[^A-Z0-9]/gi, "").slice(0, 12).toUpperCase()}`,
        valueDate: executionDate,
        debitedAccount: `${user.firstName} ${user.lastName}`,
        creditedAccount: input.beneficiary,
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
