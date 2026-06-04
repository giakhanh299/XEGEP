export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="glass rounded-[1.5rem] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{detail}</p>
    </div>
  );
}
