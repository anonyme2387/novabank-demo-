import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getApproxCountry, getClientInfo, getIp } from "@/lib/request-info";

type SecurityLevel = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type SecurityLogInput = {
  req?: Request;
  userId?: string;
  email?: string;
  event: string;
  level?: SecurityLevel;
  message: string;
  metadata?: Record<string, unknown>;
};

const blockedKeys = /password|secret|token|cookie|database_url|jwt/i;

function safeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return undefined;
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !blockedKeys.test(key))
      .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 240) : value])
  );
}

export async function logSecurityEvent({ req, userId, email, event, level = "INFO", message, metadata }: SecurityLogInput) {
  try {
    const ipAddress = req ? getIp(req) : "0.0.0.0";
    const { browser, device } = req ? getClientInfo(req) : { browser: "Serveur", device: "Serveur" };
    await prisma.securityLog.create({
      data: {
        userId,
        email,
        event,
        level,
        message,
        ipAddress,
        country: await getApproxCountry(ipAddress),
        browser,
        device,
        metadata: safeMetadata(metadata) as Prisma.InputJsonValue | undefined
      }
    });
  } catch (error) {
    console.error("[NovaBank][security-log]", error);
  }
}

export function riskForAmount(amount: number) {
  if (amount >= 50000) return { status: "FAILED" as const, level: "CRITICAL" as SecurityLevel, label: "BLOQUÉE" };
  if (amount >= 10000) return { status: "PENDING" as const, level: "HIGH" as SecurityLevel, label: "EN VÉRIFICATION" };
  if (amount >= 5000) return { status: "PENDING" as const, level: "MEDIUM" as SecurityLevel, label: "EN VÉRIFICATION" };
  return { status: "SUCCESS" as const, level: "LOW" as SecurityLevel, label: "APPROUVÉE" };
}
