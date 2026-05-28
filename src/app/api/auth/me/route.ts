import { requireUser } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function GET() {
  const user = await requireUser();
  if (!user) return fail("Non authentifié", 401);
  return ok({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    account: user.account && {
      id: user.account.id,
      ibanFake: user.account.ibanFake,
      balance: user.account.balance.toString(),
      currency: user.account.currency,
      status: user.account.status,
      card: user.account.card
    }
  });
}
