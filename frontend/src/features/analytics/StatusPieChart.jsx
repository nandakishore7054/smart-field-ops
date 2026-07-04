import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  unassigned: '#64748b', // slate-500
  assigned: '#0ea5e9',   // sky-500
  'in-progress': '#f59e0b', // amber-500
  completed: '#10b981',  // emerald-500
  verified: '#3b82f6',   // blue-500
  rejected: '#f43f5e',   // rose-500
};

export default function StatusPieChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-slate-500">No data available</div>;
  }

  const chartData = data.map((d) => ({
    name: d.status,
    value: d.count,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
