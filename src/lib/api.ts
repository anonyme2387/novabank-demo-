import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok(data: unknown = {}) {
  return NextResponse.json(data);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(error: unknown, context?: "login") {
  console.error("[NovaBank]", error);
  if (error instanceof ZodError) {
    if (context === "login") return fail("Veuillez compléter tous les champs", 422);
    return fail(error.errors[0]?.message ?? "Données invalides", 422);
  }
  return fail(context === "login" ? "Connexion impossible pour le moment" : "Une erreur est survenue. Réessayez dans quelques instants.", 500);
}
