import { z } from "zod";

const strongPassword = z.string()
  .min(10, "10 caractères minimum")
  .regex(/[A-Z]/, "Une majuscule requise")
  .regex(/[a-z]/, "Une minuscule requise")
  .regex(/[0-9]/, "Un chiffre requis")
  .regex(/[^A-Za-z0-9]/, "Un caractère spécial requis");

const cleanText = (min = 1, max = 120) => z.string().trim().min(min).max(max).transform((value) => value.replace(/[<>]/g, ""));

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Prénom requis").max(60),
  lastName: z.string().trim().min(2, "Nom requis").max(60),
  email: z.string().trim().email("Email invalide").toLowerCase(),
  password: strongPassword,
  confirmPassword: z.string().min(1, "Confirmation requise"),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: "Conditions obligatoires" }) }),
  turnstileToken: z.string().optional().default("")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
  turnstileToken: z.string().optional().default("")
});

export const amountSchema = z.object({
  amount: z.coerce.number().positive("Montant invalide").max(100000),
  label: cleanText(2, 120).optional(),
  category: z.enum(["logement", "transport", "alimentation", "loisirs", "études", "autre"]).default("autre")
});

export const transferSchema = z.object({
  recipient: cleanText(3, 120),
  beneficiary: cleanText(2, 120),
  iban: z.string().trim().min(12).max(42).regex(/^[A-Z0-9 ]+$/, "IBAN invalide"),
  amount: z.coerce.number().positive("Montant invalide").max(100000),
  currency: z.literal("EUR").default("EUR"),
  label: cleanText(2, 120),
  reference: cleanText(2, 80),
  executionDate: z.string().trim().min(8),
  mode: z.enum(["immédiat", "programmé"]),
  category: z.enum(["logement", "transport", "alimentation", "loisirs", "études", "autre"])
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: strongPassword,
  confirmPassword: z.string().min(1)
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});
