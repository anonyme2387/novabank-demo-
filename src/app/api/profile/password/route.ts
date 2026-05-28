import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/security";
import { passwordSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
    const user = await requireUser();
    if (!user) return fail("Non authentifié", 401);
    const input = passwordSchema.parse(await req.json());
    const bcrypt = await import("bcrypt");
    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) return fail("Mot de passe actuel incorrect", 401);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(input.newPassword, 12) } });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
