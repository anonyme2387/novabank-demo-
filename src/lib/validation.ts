import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom requis").max(60),
  lastName: z.string().trim().min(2, "Nom requis").max(60),
  email: z.string().trim().email("Email invalide").toLowerCase(),
  password: z.string().min(8, "8 caractères minimum").regex(/[A-Z]/, "Une majuscule requise").regex(/[0-9]/, "Un chiffre requis"),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "Conditions obligatoires" }) }),
  turnstileToken: z.string().min(1, "CAPTCHA obligatoire")
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
  turnstileToken: z.string().min(1, "CAPTCHA obligatoire")
});

export const amountSchema = z.object({
  amount: z.coerce.number().positive("Montant invalide").max(100000),
  label: z.string().trim().min(2).max(120).optional()
});

export const transferSchema = z.object({
  recipient: z.string().trim().min(3),
  amount: z.coerce.number().positive("Montant invalide").max(100000),
  label: z.string().trim().min(2).max(120).default("Virement")
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
});
