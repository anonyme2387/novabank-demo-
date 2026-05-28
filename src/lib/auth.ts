import "server-only";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const cookieName = "novabank_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me");

export type SessionUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSession() {
  cookies().delete(cookieName);
}

export async function readSessionFromRequest(req?: NextRequest): Promise<SessionUser | null> {
  const token = req ? req.cookies.get(cookieName)?.value : cookies().get(cookieName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { id: String(payload.id), email: String(payload.email), role: payload.role as "USER" | "ADMIN" };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await readSessionFromRequest();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.id },
    include: { account: { include: { card: true } } }
  });
}

export async function requireAdmin() {
  const user = await requireUser();
  return user?.role === "ADMIN" ? user : null;
}
