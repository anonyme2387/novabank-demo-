import { ok } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { response } = await requireAdminApi(req);
  if (response) return response;
  const accounts = await prisma.account.findMany({ include: { user: true, card: true }, orderBy: { createdAt: "desc" } });
  return ok(accounts.map((account) => ({ ...account, balance: account.balance.toString(), user: { ...account.user, passwordHash: undefined } })));
}
