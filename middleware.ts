import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/dashboard", "/virements", "/historique", "/ecritures", "/recu", "/profil", "/admin"];
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me");

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (!protectedPaths.some((item) => path.startsWith(item))) return NextResponse.next();
  const token = req.cookies.get("novabank_session")?.value;
  const session = token ? await jwtVerify(token, secret).then((value) => value.payload).catch(() => null) : null;
  if (!session) return NextResponse.redirect(new URL("/connexion?error=session", req.url));
  if (path.startsWith("/admin") && session.role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/virements/:path*", "/historique/:path*", "/ecritures/:path*", "/recu/:path*", "/profil/:path*", "/admin/:path*"]
};
