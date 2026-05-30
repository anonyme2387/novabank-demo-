import "server-only";
import { fail } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/security";
import { logSecurityEvent } from "@/lib/security-log";

// Garde commune des API admin: rôle ADMIN valide + limite anti-abus dédiée.
export async function requireAdminApi(req: Request) {
  if (!sameOrigin(req)) return { admin: null, response: fail("Service momentanément indisponible", 403) };
  const admin = await requireAdmin(req);
  if (!admin) return { admin: null, response: fail("Accès refusé", 403) };
  const ip = getIp(req);
  const limited = rateLimit(`admin-api:${admin.id}:${ip}`, 10, 60_000, 5 * 60_000);
  if (!limited.ok) {
    await logSecurityEvent({ req, userId: admin.id, email: admin.email, event: "ADMIN_RATE_LIMIT", level: "HIGH", message: "Limite API admin dépassée" });
    return { admin: null, response: fail("Trop de requêtes administrateur. Réessayez plus tard.", 429) };
  }
  return { admin, response: null };
}

export async function logAdminAction(req: Request, admin: { id: string; email: string }, event: string, message: string, metadata?: Record<string, unknown>) {
  await logSecurityEvent({ req, userId: admin.id, email: admin.email, event, level: "INFO", message, metadata });
}
