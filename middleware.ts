import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/dashboard", "/virements", "/historique", "/ecritures", "/recu", "/profil", "/admin"];
const privateApiPaths = ["/api/account", "/api/profile", "/api/transactions", "/api/transfer", "/api/security", "/api/admin", "/api/auth/me", "/api/auth/logout"];

function middlewareSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[NovaBank][middleware] JWT_SECRET manquant en production");
  }
  return new TextEncoder().encode(secret ?? "dev-secret-change-me");
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPrivatePage = protectedPaths.some((item) => path.startsWith(item));
  const isPrivateApi = privateApiPaths.some((item) => path.startsWith(item));
  if (!isPrivatePage && !isPrivateApi) return NextResponse.next();

  const token = req.cookies.get("novabank_session")?.value;
  const session = token ? await jwtVerify(token, middlewareSecret()).then((value) => value.payload).catch((error) => {
    console.warn("[NovaBank][middleware] Token refusé", { path, reason: error instanceof Error ? error.message : "unknown" });
    return null;
  }) : null;

  // Le middleware bloque l’accès direct avant tout rendu privé; les routes serveur journalisent ensuite les refus par rôle.
  if (!session) {
    if (isPrivateApi) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.redirect(new URL("/connexion?error=session", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/virements/:path*",
    "/historique/:path*",
    "/ecritures/:path*",
    "/recu/:path*",
    "/profil/:path*",
    "/admin/:path*",
    "/api/account/:path*",
    "/api/profile/:path*",
    "/api/transactions/:path*",
    "/api/transfer/:path*",
    "/api/security/:path*",
    "/api/admin/:path*",
    "/api/auth/me",
    "/api/auth/logout"
  ]
};
