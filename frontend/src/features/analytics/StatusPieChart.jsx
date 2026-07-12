import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { PieChart as PieChartIcon } from 'lucide-react';

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
    return (
      <div className="flex h-64 items-center justify-center">
        <EmptyState
          icon={PieChartIcon}
          title="No Data"
          description="No status data available to display."
        />
      </div>
    );
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
            contentStyle={{ 
              backgroundColor: 'hsl(var(--surface))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '0.875rem',
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground capitalize">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
