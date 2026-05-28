import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Accès refusé", 403);
  const accounts = await prisma.account.findMany({ include: { user: true, card: true }, orderBy: { createdAt: "desc" } });
  return ok(accounts.map((account) => ({ ...account, balance: account.balance.toString(), user: { ...account.user, passwordHash: undefined } })));
}
