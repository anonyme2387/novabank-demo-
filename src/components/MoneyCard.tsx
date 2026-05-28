export function MoneyCard({ name, number, expiry, balance }: { name: string; number: string; expiry: string; balance: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-night p-6 text-white shadow-premium soft-grid">
      <div className="flex items-center justify-between text-sm opacity-80">
        <span>NovaBank Virtual</span>
        <span>FICTIVE</span>
      </div>
      <div className="mt-12 font-mono text-xl tracking-wide">{number}</div>
      <div className="mt-8 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase text-white/60">Titulaire</div>
          <div className="font-semibold">{name}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-white/60">Expire</div>
          <div className="font-semibold">{expiry}</div>
        </div>
      </div>
      <div className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm">Solde virtuel: {balance}</div>
    </div>
  );
}
