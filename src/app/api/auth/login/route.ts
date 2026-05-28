import bcrypt from "bcrypt";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { getApproxCountry, getClientInfo, getIp, maskIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const ip = getIp(req);
    const input = loginSchema.parse(await req.json());
    const limited = rateLimit(`login:${input.email}:${ip}`, 5, 10 * 60_000, 15 * 60_000);
    if (!limited.ok) return fail("Compte temporairement bloqué après plusieurs erreurs.", 429);
    if (!(await verifyTurnstile(input.turnstileToken, ip))) return fail("CAPTCHA invalide", 403);

    const user = await prisma.user.findUnique({ where: { email: input.email }, include: { account: true } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return fail("Identifiants incorrects", 401);
    if (user.account?.status === "BLOCKED") return fail("Compte bloqué. Contactez l’administrateur.", 403);

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
    return handleError(error);
  }
}
