import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { ensureDemoAccount } from "@/lib/demo-accounts";
import { getApproxCountry, getClientInfo, getIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/security";
import { logSecurityEvent } from "@/lib/security-log";
import { verifyTurnstile } from "@/lib/turnstile";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) console.error("[NovaBank][auth] DATABASE_URL manquant");
    if (!process.env.JWT_SECRET) console.error("[NovaBank][auth] JWT_SECRET manquant");
    if (!sameOrigin(req)) {
      console.error("[NovaBank][auth] Origine refusée", {
        origin: req.headers.get("origin"),
        host: req.headers.get("host"),
        forwardedHost: req.headers.get("x-forwarded-host")
      });
      return fail("Service momentanément indisponible", 403);
    }
    const ip = getIp(req);
    const input = loginSchema.parse(await req.json());
    const limited = rateLimit(`login:${ip}`, 5, 10 * 60_000, 15 * 60_000);
    if (!limited.ok) {
      console.error("[NovaBank][auth] Rate limit login", { email: input.email, ip });
      await logSecurityEvent({ req, email: input.email, event: "LOGIN_RATE_LIMIT", level: "HIGH", message: "Blocage temporaire après trop de tentatives de connexion" });
      return fail("Trop de tentatives. Réessayez dans quelques minutes.", 429);
    }
    if (!(await verifyTurnstile(input.turnstileToken, ip))) {
      console.error("[NovaBank][auth] Turnstile invalide", { email: input.email });
      await logSecurityEvent({ req, email: input.email, event: "LOGIN_TURNSTILE_FAILED", level: "MEDIUM", message: "CAPTCHA invalide ou absent" });
      return fail("Service momentanément indisponible", 403);
    }

    const bcrypt = await import("bcrypt");
    let user = await prisma.user.findUnique({ where: { email: input.email }, include: { account: true } });
    const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !passwordMatches) {
      user = await ensureDemoAccount(prisma, bcrypt, input.email, input.password);
    }
    if (!user) {
      await logSecurityEvent({ req, email: input.email, event: "LOGIN_FAILED", level: "MEDIUM", message: "Email ou mot de passe incorrect" });
      return fail("Email ou mot de passe incorrect", 401);
    }
    if (!user.account) {
      console.error("[NovaBank][auth] Compte bancaire manquant après auto-seed", { email: user.email });
      return fail("Service momentanément indisponible", 500);
    }
    if (user.account.status === "BLOCKED") {
      await logSecurityEvent({ req, userId: user.id, email: user.email, event: "LOGIN_BLOCKED_ACCOUNT", level: "HIGH", message: "Connexion refusée pour un compte bloqué" });
      return fail("Service momentanément indisponible", 403);
    }

    const { browser, device } = getClientInfo(req);
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        country: await getApproxCountry(ip),
        browser,
        device
      }
    });
    await logSecurityEvent({ req, userId: user.id, email: user.email, event: "LOGIN_SUCCESS", level: "INFO", message: "Connexion réussie" });
    await createSession({ id: user.id, email: user.email, role: user.role });
    return ok({ success: true, role: user.role });
  } catch (error) {
    console.error("[NovaBank][auth] Login route failure", error);
    return handleError(error, "login");
  }
}
