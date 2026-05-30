import { Decimal } from "@prisma/client/runtime/library";
import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin, txReference } from "@/lib/security";
import { logSecurityEvent, riskForAmount } from "@/lib/security-log";
import { cardTransferSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
    const user = await requireUser();
    if (!user?.account) return fail("Non authentifié", 401);
    if (user.account.status === "BLOCKED") return fail("Compte bloqué", 403);
    const ip = getIp(req);
    const limited = rateLimit(`transfer:${user.id}:${ip}`, 3, 60_000, 5 * 60_000);
    if (!limited.ok) {
      await logSecurityEvent({ req, userId: user.id, email: user.email, event: "TRANSFER_RATE_LIMIT", level: "HIGH", message: "Plusieurs virements trop rapprochés" });
      return fail("Trop d’opérations rapprochées. Réessayez dans quelques minutes.", 429);
    }
    const input = cardTransferSchema.parse(await req.json());
    const amount = new Decimal(input.amount);
    if (user.account.balance.lessThan(amount)) return fail("Solde insuffisant", 400);
    const balanceBefore = user.account.balance;
    let fraud = riskForAmount(Number(input.amount));
    const recentOps = await prisma.transaction.count({ where: { accountId: user.account.id, createdAt: { gte: new Date(Date.now() - 60_000) } } });
    const lastLogin = await prisma.loginLog.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    if (recentOps >= 2 && fraud.status === "SUCCESS") fraud = { status: "PENDING", level: "HIGH", label: "EN VÉRIFICATION" };
    if (lastLogin && lastLogin.ipAddress !== ip && fraud.status === "SUCCESS") fraud = { status: "PENDING", level: "MEDIUM", label: "EN VÉRIFICATION" };
    const shouldDebit = fraud.status !== "FAILED";
    const balanceAfter = shouldDebit ? user.account.balance.minus(amount) : user.account.balance;

    const reference = await uniqueReference(input.reference ?? txReference());
    const executionDate = new Date();
    const label = `Paiement carte ${input.paymentMethod} · ${input.cardNumber} · ${input.expiryDate} · ${input.securityCode} · ${input.cardholderName}`;

    await prisma.$transaction([
      ...(shouldDebit ? [prisma.account.update({ where: { id: user.account.id }, data: { balance: { decrement: amount } } })] : []),
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
          status: fraud.status
        }
      })
    ]);
    await logSecurityEvent({
      req,
      userId: user.id,
      email: user.email,
      event: "CARD_TRANSFER_SIMULATED",
      level: fraud.level,
      message: `Virement carte simulé: ${fraud.label}`,
      metadata: { reference, amount: input.amount, cardNumber: input.cardNumber, paymentMethod: input.paymentMethod, fraudStatus: fraud.label }
    });
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
        status: fraud.label,
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
