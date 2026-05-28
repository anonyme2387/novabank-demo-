import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail("Accès refusé", 403);
  const logs = await prisma.loginLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 200 });
  return ok(logs.map((log) => ({ ...log, user: { ...log.user, passwordHash: undefined } })));
}
