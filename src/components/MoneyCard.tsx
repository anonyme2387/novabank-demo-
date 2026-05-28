export function MoneyCard({ name, number, expiry, balance }: { name: string; number: string; expiry: string; balance: string }) {
  return (
    <div className="relative overflow-hidden rounded-[1.7rem] bg-[radial-gradient(circle_at_20%_0%,rgba(53,208,255,.34),transparent_30%),radial-gradient(circle_at_100%_100%,rgba(49,214,160,.18),transparent_26%),linear-gradient(135deg,#040714,#101828_55%,#202939)] p-6 text-white shadow-premium">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10" />
      <div className="absolute -bottom-16 right-10 h-44 w-44 rounded-full border border-white/10" />
      <div className="relative flex items-center justify-between text-sm">
        <span className="font-semibold text-white/85">NovaBank Black</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">World Elite</span>
      </div>
      <div className="relative mt-8 h-10 w-14 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 shadow-lg shadow-black/20">
        <div className="absolute left-1/2 top-0 h-full w-px bg-black/20" />
      </div>
      <div className="relative mt-8 font-mono text-xl tracking-wide">{number}</div>
      <div className="relative mt-8 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase text-white/60">Titulaire</div>
          <div className="font-semibold">{name}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-white/60">Expire</div>
          <div className="font-semibold">{expiry}</div>
        </div>
      </div>
      <div className="relative mt-6 rounded-xl bg-white/10 px-4 py-3 text-sm backdrop-blur">Solde disponible: {balance}</div>
    </div>
  );
}
