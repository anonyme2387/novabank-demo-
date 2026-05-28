import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Accès refusé", 403);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { account: { include: { card: true } }, loginLogs: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  return ok(
    users.map((user) => ({
      ...user,
      passwordHash: undefined,
      account: user.account && { ...user.account, balance: user.account.balance.toString() }
    }))
  );
}
