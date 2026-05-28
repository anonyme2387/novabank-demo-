import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { getApproxCountry, getClientInfo, getIp, maskIp } from "@/lib/request-info";
import { rateLimit } from "@/lib/rate-limit";
import { sameOrigin } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!sameOrigin(req)) return fail("Connexion impossible pour le moment", 403);
    const ip = getIp(req);
    const input = loginSchema.parse(await req.json());
    const limited = rateLimit(`login:${input.email}:${ip}`, 5, 10 * 60_000, 15 * 60_000);
    if (!limited.ok) return fail("Connexion impossible pour le moment", 429);
    if (!(await verifyTurnstile(input.turnstileToken, ip))) return fail("Connexion impossible pour le moment", 403);

    const bcrypt = await import("bcrypt");
    let user = await prisma.user.findUnique({ where: { email: input.email }, include: { account: true } });
    const passwordMatches = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
    if (!user || !passwordMatches) {
      user = await ensurePresentationAccount(input.email, input.password);
    }
    if (!user) return fail("Email ou mot de passe incorrect", 401);
    if (user.account?.status === "BLOCKED") return fail("Connexion impossible pour le moment", 403);

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
    return handleError(error, "login");
  }
}

const presentationAccounts = [
  { firstName: "Alexandre", lastName: "Martin", email: "alexandre.martin@novabank-app.com", password: "AxM#Secure2026!Bank", balance: "8420.75", seed: 42, role: Role.USER },
  { firstName: "Clara", lastName: "Dubois", email: "clara.dubois@novabank-app.com", password: "Clara$Vault2026!NB", balance: "3250.40", seed: 73, role: Role.USER },
  { firstName: "Yanis", lastName: "Benali", email: "yanis.benali@novabank-app.com", password: "YB!Finance2026#Safe", balance: "1275.90", seed: 88, role: Role.USER },
  { firstName: "Admin", lastName: "NovaBank", email: "admin@novabank-app.com", password: "NovaAdmin#Ultra2026!", balance: "12500.00", seed: 1, role: Role.ADMIN }
] as const;

async function ensurePresentationAccount(email: string, password: string) {
  const demo = presentationAccounts.find((item) => item.email === email && item.password === password);
  if (!demo) return null;
  const bcrypt = await import("bcrypt");
  const passwordHash = await bcrypt.hash(demo.password, 12);
  return prisma.user.upsert({
    where: { email: demo.email },
    update: { passwordHash, firstName: demo.firstName, lastName: demo.lastName, role: demo.role },
    create: {
      firstName: demo.firstName,
      lastName: demo.lastName,
      email: demo.email,
      passwordHash,
      role: demo.role,
      account: {
        create: {
          ibanFake: `NBFR FR76 9900 6000 ${String(200000 + demo.seed)} 0000 ${String(2000 + demo.seed)} 189`,
          balance: demo.balance,
          card: {
            create: {
              cardNumberFake: `4975 9200 ${String(2000 + demo.seed).slice(0, 4)} ${String(8000 + demo.seed).slice(0, 4)}`,
              expiryDate: "12/29",
              cvvFake: String(300 + demo.seed).slice(0, 3)
            }
          },
          transactions: {
            create: [
              { type: "DEPOSIT", amount: "2840.00", label: "Salaire mensuel", category: "autre", status: "SUCCESS" },
              { type: "WITHDRAWAL", amount: "720.00", label: "Loyer résidence", category: "logement", status: "SUCCESS" },
              { type: "WITHDRAWAL", amount: "86.40", label: "Pass transport", category: "transport", status: "SUCCESS" }
            ]
          }
        }
      }
    },
    include: { account: true }
  });
}
