import { clearSession, requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";
import { sameOrigin } from "@/lib/security";
import { logSecurityEvent } from "@/lib/security-log";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
  const user = await requireUser();
  if (user) await logSecurityEvent({ req, userId: user.id, email: user.email, event: "LOGOUT", level: "INFO", message: "Déconnexion utilisateur" });
  clearSession();
  return ok({ success: true });
}
