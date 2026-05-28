const points = [38, 46, 43, 58, 52, 68, 64, 76, 72, 84, 81, 92];

export function BalanceChart() {
  return (
    <div className="premium-panel rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-night">Évolution</h2>
          <p className="mt-1 text-sm text-steel">Activité des 12 dernières semaines</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">+8,4%</span>
      </div>
      <div className="mt-8 flex h-48 items-end gap-2 rounded-2xl bg-white/70 p-4">
        {points.map((point, index) => (
          <div key={index} className="flex flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-night via-slate-700 to-cyan shadow-sm transition-all duration-500 hover:opacity-80"
              style={{ height: `${point}%`, animationDelay: `${index * 40}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
