import "server-only";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security-log";

const cookieName = "novabank_session";

function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET obligatoire en production");
  }
  return new TextEncoder().encode(secret ?? "dev-secret-change-me");
}

export type SessionUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(jwtSecret());

  cookies().set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 2
  });
}

export function clearSession() {
  cookies().delete(cookieName);
}

export async function readSessionFromRequest(req?: NextRequest): Promise<SessionUser | null> {
  const token = req ? req.cookies.get(cookieName)?.value : cookies().get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    return { id: String(payload.id), email: String(payload.email), role: payload.role as "USER" | "ADMIN" };
  } catch (error) {
    if (req) {
      await logSecurityEvent({
        req,
        event: "INVALID_TOKEN",
        level: "HIGH",
        message: "Jeton JWT invalide ou expiré",
        metadata: { reason: error instanceof Error ? error.message : "unknown" }
      });
    }
    return null;
  }
}

export async function requireUser() {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  const session = await readSessionFromRequest();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.id },
    include: { account: { include: { card: true } } }
  });
}

export async function requireAdmin(req?: Request) {
  const user = await requireUser();
  if (!user) return null;
  if (user.role !== "ADMIN") {
    await logSecurityEvent({
      req,
      userId: user.id,
      email: user.email,
      event: "ADMIN_ACCESS_DENIED",
      level: "HIGH",
      message: "Tentative d’accès administrateur refusée"
    });
    return null;
  }
  return user;
}
