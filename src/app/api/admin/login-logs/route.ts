import { ok } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { response } = await requireAdminApi(req);
  if (response) return response;
  const logs = await prisma.loginLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 200 });
  return ok(logs.map((log) => ({ ...log, user: { ...log.user, passwordHash: undefined } })));
}
