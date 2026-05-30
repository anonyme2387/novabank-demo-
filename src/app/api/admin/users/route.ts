import { ok } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { response } = await requireAdminApi(req);
  if (response) return response;
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
