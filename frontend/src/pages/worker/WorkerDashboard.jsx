export default function WorkerDashboard() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Worker Dashboard</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Your task queue</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          This placeholder page confirms the worker layout and protected routing for Phase 2.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {['Today', 'Upcoming', 'Completed'].map((card) => (
          <article key={card} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">{card}</p>
            <div className="mt-4 h-28 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60" />
          </article>
        ))}
      </div>
    </section>
  );
}