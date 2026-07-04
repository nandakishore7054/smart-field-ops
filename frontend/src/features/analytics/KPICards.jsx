export default function KPICards({ data }) {
  const cards = [
    { label: 'Total Tasks', value: data.totalTasks },
    { label: 'Completed', value: data.completedTasks, color: 'text-emerald-400' },
    { label: 'Pending', value: data.pendingTasks, color: 'text-amber-400' },
    { label: 'Verified', value: data.verifiedTasks, color: 'text-blue-400' },
    { label: 'Rejected', value: data.rejectedTasks, color: 'text-rose-400' },
    { label: 'Completion Rate', value: `${data.completionRate}%` },
    { label: 'Active Workers', value: data.activeWorkers },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm">
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className={`mt-2 text-2xl font-bold ${card.color || 'text-white'}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
