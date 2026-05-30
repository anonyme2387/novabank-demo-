import { Decimal } from "@prisma/client/runtime/library";
import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { sameOrigin } from "@/lib/security";
import { getIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { logSecurityEvent, riskForAmount } from "@/lib/security-log";
import { amountSchema, cardPaymentSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
    const user = await requireUser();
    if (!user?.account) return fail("Non authentifié", 401);
    if (user.account.status === "BLOCKED") return fail("Compte bloqué", 403);
    const body = await req.json();
    const mode = body.mode === "withdrawal" ? "withdrawal" : "deposit";
    const isCardPayment = mode === "deposit" && body.cardNumber;
    const cardInput = isCardPayment ? cardPaymentSchema.parse(body) : null;
    const input = cardInput ?? amountSchema.parse(body);
    const ip = getIp(req);
    const limited = rateLimit(`${isCardPayment ? "card-payment" : "account-operation"}:${user.id}:${ip}`, isCardPayment ? 3 : 8, 60_000, 5 * 60_000);
    if (!limited.ok) {
      await logSecurityEvent({ req, userId: user.id, email: user.email, event: isCardPayment ? "CARD_PAYMENT_RATE_LIMIT" : "ACCOUNT_OPERATION_RATE_LIMIT", level: "HIGH", message: "Trop d’opérations rapprochées" });
      return fail("Trop d’opérations rapprochées. Réessayez dans quelques minutes.", 429);
    }
    const cardDetails =
      cardInput
        ? `Paiement carte ${cardInput.cardBrand} · ${cardInput.cardNumber} · ${cardInput.expiryDate} · ${cardInput.securityCode} · ${cardInput.cardholderName}`
        : undefined;

    const amount = new Decimal(input.amount);
    if (mode === "withdrawal" && user.account.balance.lessThan(amount)) return fail("Solde insuffisant", 400);
    const fraud = isCardPayment ? riskForAmount(Number(input.amount)) : { status: "SUCCESS" as const, level: "LOW" as const, label: "APPROUVÉE" };
    const shouldApplyBalance = fraud.status !== "FAILED";

    await prisma.$transaction([
      ...(shouldApplyBalance ? [prisma.account.update({
        where: { id: user.account.id },
        data: { balance: mode === "deposit" ? { increment: amount } : { decrement: amount } }
      })] : []),
      prisma.transaction.create({
        data: {
          accountId: user.account.id,
          type: mode === "deposit" ? "DEPOSIT" : "WITHDRAWAL",
          amount,
          label: cardDetails ?? input.label ?? (mode === "deposit" ? "Dépôt" : "Retrait"),
          category: input.category,
          beneficiaryName: cardInput ? cardInput.cardholderName : null,
          beneficiaryIban: cardInput ? cardInput.cardNumber : null,
          transferMode: isCardPayment ? "paiement carte simulé" : null,
          status: fraud.status
        }
      })
    ]);
    if (cardInput) {
      await logSecurityEvent({
        req,
        userId: user.id,
        email: user.email,
        event: "CARD_PAYMENT_SIMULATED",
        level: fraud.level,
        message: `Paiement carte simulé: ${fraud.label}`,
        metadata: { amount: input.amount, cardNumber: cardInput.cardNumber, cardBrand: cardInput.cardBrand, fraudStatus: fraud.label }
      });
    }
    const updated = await prisma.account.findUniqueOrThrow({ where: { id: user.account.id } });
    return ok({ balance: updated.balance.toString() });
  } catch (error) {
    return handleError(error);
  }
}
