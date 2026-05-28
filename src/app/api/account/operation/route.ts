import { Decimal } from "@prisma/client/runtime/library";
import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { sameOrigin } from "@/lib/security";
import { amountSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
    const user = await requireUser();
    if (!user?.account) return fail("Non authentifié", 401);
    if (user.account.status === "BLOCKED") return fail("Compte bloqué", 403);
    const body = await req.json();
    const mode = body.mode === "withdrawal" ? "withdrawal" : "deposit";
    const input = amountSchema.parse(body);
    const cardDetails =
      mode === "deposit" && body.cardNumber
        ? `Paiement carte ${String(body.cardBrand ?? "Carte")} · ${String(body.cardNumber)} · ${String(body.expiryDate ?? "")} · ${String(body.securityCode ?? "")} · ${String(body.cardholderName ?? "")}`
        : undefined;

    const amount = new Decimal(input.amount);
    if (mode === "withdrawal" && user.account.balance.lessThan(amount)) return fail("Solde insuffisant", 400);

    const updated = await prisma.account.update({
      where: { id: user.account.id },
      data: {
        balance: mode === "deposit" ? { increment: amount } : { decrement: amount },
        transactions: {
          create: {
            type: mode === "deposit" ? "DEPOSIT" : "WITHDRAWAL",
            amount,
            label: cardDetails ?? input.label ?? (mode === "deposit" ? "Dépôt" : "Retrait"),
            category: input.category,
            beneficiaryName: mode === "deposit" ? String(body.cardholderName ?? "") || null : null,
            beneficiaryIban: mode === "deposit" ? String(body.cardNumber ?? "") || null : null,
            transferMode: mode === "deposit" && body.cardNumber ? "paiement carte simulé" : null,
            status: "SUCCESS"
          }
        }
      }
    });
    return ok({ balance: updated.balance.toString() });
  } catch (error) {
    return handleError(error);
  }
}
