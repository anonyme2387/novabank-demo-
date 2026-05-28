import "server-only";
import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";

export function getIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "0.0.0.0";
}

export function maskIp(ip: string) {
  if (ip.includes(":")) return `${ip.split(":").slice(0, 3).join(":")}:xxxx`;
  const parts = ip.split(".");
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.xxx` : "xxx.xxx.xxx.xxx";
}

export function getClientInfo(req: NextRequest) {
  const parser = new UAParser(req.headers.get("user-agent") ?? "");
  const browser = parser.getBrowser().name ?? "Navigateur inconnu";
  const deviceType = parser.getDevice().type;
  const device = deviceType === "mobile" ? "Mobile" : deviceType === "tablet" ? "Tablette" : "Ordinateur";
  return { browser, device };
}

export async function getApproxCountry(ip: string) {
  if (ip === "0.0.0.0" || ip.startsWith("127.") || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return "France";
  }
  try {
    const response = await fetch(`https://ipapi.co/${ip}/country_name/`, { next: { revalidate: 86400 } });
    const country = (await response.text()).trim();
    return country && country.length < 80 ? country : "Pays inconnu";
  } catch {
    return "Pays inconnu";
  }
}
