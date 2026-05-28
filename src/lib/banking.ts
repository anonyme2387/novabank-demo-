import "server-only";

export function makeFakeIban() {
  const chunk = () => Math.floor(1000 + Math.random() * 9000);
  return `NVBA FR76 ${chunk()} ${chunk()} ${chunk()} ${chunk()} ${chunk()} 189`;
}

export function makeFakeCardNumber() {
  return `4975 92${Math.floor(10 + Math.random() * 89)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
}

export function makeExpiryDate() {
  const date = new Date();
  return `12/${String(date.getFullYear() + 4).slice(2)}`;
}

export function euro(value: number | string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value));
}
