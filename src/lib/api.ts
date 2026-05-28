import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok(data: unknown = {}) {
  return NextResponse.json(data);
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(error: unknown) {
  console.error("[NovaBank]", error);
  if (error instanceof ZodError) {
    return fail(error.errors[0]?.message ?? "Données invalides", 422);
  }
  return fail("Une erreur est survenue. Réessayez dans quelques instants.", 500);
}
