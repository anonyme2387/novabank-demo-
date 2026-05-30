import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { getIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/security";
import { logSecurityEvent } from "@/lib/security-log";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
  const user = await requireUser();
  if (!user) return fail("Non authentifié", 401);
  const limited = rateLimit(`security-report:${user.id}:${getIp(req)}`, 3, 10 * 60_000, 30 * 60_000);
  if (!limited.ok) return fail("Trop de signalements rapprochés.", 429);
  await logSecurityEvent({
    req,
    userId: user.id,
    email: user.email,
    event: "SUSPICIOUS_ACTIVITY_REPORTED",
    level: "HIGH",
    message: "Signalement manuel d’activité suspecte"
  });
  return ok({ success: true });
}
