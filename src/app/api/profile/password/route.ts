import { requireUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/security";
import { logSecurityEvent } from "@/lib/security-log";
import { passwordSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
    const user = await requireUser();
    if (!user) return fail("Non authentifié", 401);
    const ip = getIp(req);
    const limited = rateLimit(`password:${user.id}:${ip}`, 5, 10 * 60_000, 15 * 60_000);
    if (!limited.ok) {
      await logSecurityEvent({ req, userId: user.id, email: user.email, event: "PASSWORD_RATE_LIMIT", level: "HIGH", message: "Trop de tentatives de changement de mot de passe" });
      return fail("Trop de tentatives. Réessayez plus tard.", 429);
    }
    const input = passwordSchema.parse(await req.json());
    const bcrypt = await import("bcrypt");
    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      await logSecurityEvent({ req, userId: user.id, email: user.email, event: "PASSWORD_CHANGE_FAILED", level: "MEDIUM", message: "Mot de passe actuel incorrect" });
      return fail("Mot de passe actuel incorrect", 401);
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(input.newPassword, 12) } });
    await logSecurityEvent({ req, userId: user.id, email: user.email, event: "PASSWORD_CHANGE_SUCCESS", level: "INFO", message: "Mot de passe modifié" });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
