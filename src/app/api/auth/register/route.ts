import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { makeExpiryDate, makeFakeCardNumber, makeFakeIban } from "@/lib/banking";
import { getIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/security";
import { logSecurityEvent } from "@/lib/security-log";
import { verifyTurnstile } from "@/lib/turnstile";
import { registerSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!sameOrigin(req)) return fail("Service momentanément indisponible", 403);
    const ip = getIp(req);
    const limited = rateLimit(`register:${ip}`, 5, 10 * 60_000, 15 * 60_000);
    if (!limited.ok) {
      await logSecurityEvent({ req, event: "REGISTER_RATE_LIMIT", level: "HIGH", message: "Blocage temporaire des inscriptions depuis cette adresse IP" });
      return fail("Trop de tentatives. Réessayez plus tard.", 429);
    }
    const input = registerSchema.parse(await req.json());
    if (!(await verifyTurnstile(input.turnstileToken, ip))) {
      await logSecurityEvent({ req, email: input.email, event: "REGISTER_TURNSTILE_FAILED", level: "MEDIUM", message: "CAPTCHA inscription invalide ou absent" });
      return fail("Service momentanément indisponible", 403);
    }

    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) {
      await logSecurityEvent({ req, email: input.email, event: "REGISTER_DUPLICATE_EMAIL", level: "LOW", message: "Tentative d’inscription avec un email existant" });
      return fail("Un compte existe déjà avec cet email", 409);
    }

    const bcrypt = await import("bcrypt");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        firstName: input.firstName.replace(/[<>]/g, ""),
        lastName: input.lastName.replace(/[<>]/g, ""),
        email: input.email,
        passwordHash,
        account: {
          create: {
            ibanFake: makeFakeIban(),
            balance: "1000.00",
            card: {
              create: {
                cardNumberFake: makeFakeCardNumber(),
                expiryDate: makeExpiryDate(),
                cvvFake: String(Math.floor(100 + Math.random() * 900))
              }
            },
            transactions: {
              create: { type: "DEPOSIT", amount: "1000.00", label: "Dépôt initial", category: "autre", status: "SUCCESS" }
            }
          }
        }
      }
    });
    await logSecurityEvent({ req, userId: user.id, email: user.email, event: "REGISTER_SUCCESS", level: "INFO", message: "Compte créé avec validation serveur" });
    await createSession({ id: user.id, email: user.email, role: user.role });
    return ok({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
