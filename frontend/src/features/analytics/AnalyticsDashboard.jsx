import { useState, useEffect } from 'react';
import api from '../../app/api';
import KPICards from './KPICards';
import StatusPieChart from './StatusPieChart';
import WeeklyTrendChart from './WeeklyTrendChart';
import WorkerStatsTable from './WorkerStatsTable';

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSummary() {
      try {
        setLoading(true);
        const response = await api.get('/analytics/summary');
        if (isMounted) {
          setSummary(response.data?.data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load analytics summary');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-400">
        <p>{error}</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Operations Overview</h2>
        <KPICards data={summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-white">Task Status Distribution</h3>
          <StatusPieChart data={summary.statusDistribution} />
        </div>
        
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-medium text-white">Weekly Completion Trend</h3>
          <WeeklyTrendChart data={summary.weeklyCompletionTrend} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-white">Worker Performance</h3>
        <WorkerStatsTable />
      </div>
    </div>
  );
}
