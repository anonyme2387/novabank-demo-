import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { ensureDemoAccount } from "@/lib/demo-accounts";
import { getApproxCountry, getClientInfo, getIp, maskIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) console.error("[NovaBank][auth] DATABASE_URL manquant");
    if (!process.env.JWT_SECRET) console.error("[NovaBank][auth] JWT_SECRET manquant, fallback dev utilisé");
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
    const limited = rateLimit(`login:${input.email}:${ip}`, 5, 10 * 60_000, 15 * 60_000);
    if (!limited.ok) {
      console.error("[NovaBank][auth] Rate limit login", { email: input.email, ip: maskIp(ip) });
      return fail("Service momentanément indisponible", 429);
    }
    if (!(await verifyTurnstile(input.turnstileToken, ip))) {
      console.error("[NovaBank][auth] Turnstile invalide", { email: input.email });
      return fail("Service momentanément indisponible", 403);
    }

    const bcrypt = await import("bcrypt");
    let user = await prisma.user.findUnique({ where: { email: input.email }, include: { account: true } });
    const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !passwordMatches) {
      user = await ensureDemoAccount(prisma, bcrypt, input.email, input.password);
    }
    if (!user) return fail("Email ou mot de passe incorrect", 401);
    if (!user.account) {
      console.error("[NovaBank][auth] Compte bancaire manquant après auto-seed", { email: user.email });
      return fail("Service momentanément indisponible", 500);
    }
    if (user.account.status === "BLOCKED") return fail("Service momentanément indisponible", 403);

    const { browser, device } = getClientInfo(req);
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ipAddress: maskIp(ip),
        country: await getApproxCountry(ip),
        browser,
        device
      }
    });
    await createSession({ id: user.id, email: user.email, role: user.role });
    return ok({ success: true, role: user.role });
  } catch (error) {
    console.error("[NovaBank][auth] Login route failure", error);
    return handleError(error, "login");
  }
}
