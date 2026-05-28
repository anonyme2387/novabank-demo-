import "server-only";
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const requestHosts = [
      new URL(req.url).host,
      req.headers.get("host"),
      req.headers.get("x-forwarded-host")
    ].filter(Boolean);
    return requestHosts.some((host) => host === originHost);
  } catch {
    return false;
  }
}

export function maskIban(iban: string) {
  const compact = iban.replace(/\s+/g, "");
  if (compact.length < 10) return "••••";
  return `${compact.slice(0, 4)} ${"•".repeat(Math.max(4, compact.length - 8))} ${compact.slice(-4)}`;
}

export function txReference() {
  return `NOVA-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
