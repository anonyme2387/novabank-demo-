import { z } from "zod";
import { requireAdminApi, logAdminAction } from "@/lib/admin-security";
import { fail, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const schema = z.object({ status: z.enum(["ACTIVE", "BLOCKED"]) });

export async function POST(req: Request, { params }: { params: { accountId: string } }) {
  try {
    const { admin, response } = await requireAdminApi(req);
    if (response) return response;
    if (!admin) return fail("Accès refusé", 403);
    const { status } = schema.parse(await req.json());
    const account = await prisma.account.update({ where: { id: params.accountId }, data: { status } });
    await logAdminAction(req, admin, "ADMIN_ACCOUNT_STATUS", "Changement de statut de compte", { accountId: params.accountId, status });
    return ok({ status: account.status });
  } catch (error) {
    return handleError(error);
  }
}
