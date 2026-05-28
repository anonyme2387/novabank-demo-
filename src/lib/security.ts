import "server-only";
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(req.url).host;
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
