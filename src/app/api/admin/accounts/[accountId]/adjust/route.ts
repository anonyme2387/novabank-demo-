import { Decimal } from "@prisma/client/runtime/library";
import { requireAdmin } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { amountSchema } from "@/lib/validation";

export async function POST(req: Request, { params }: { params: { accountId: string } }) {
  try {
    const admin = await requireAdmin();
    if (!admin) return fail("Accès refusé", 403);
    const body = await req.json();
    const mode = body.mode === "remove" ? "remove" : "add";
    const input = amountSchema.parse(body);
    const account = await prisma.account.findUnique({ where: { id: params.accountId } });
    if (!account) return fail("Compte introuvable", 404);
    const amount = new Decimal(input.amount);
    if (mode === "remove" && account.balance.lessThan(amount)) return fail("Solde insuffisant", 400);
    const updated = await prisma.account.update({
      where: { id: params.accountId },
      data: {
        balance: mode === "add" ? { increment: amount } : { decrement: amount },
        transactions: {
          create: {
            type: mode === "add" ? "DEPOSIT" : "WITHDRAWAL",
            amount,
            label: input.label ?? "Ajustement administrateur fictif",
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
