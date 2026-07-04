import { useState, useEffect } from 'react';
import api from '../../app/api';

export default function WorkerStatsTable() {
  const [workersStats, setWorkersStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        setLoading(true);
        // First get all workers
        const usersResponse = await api.get('/users/workers');
        const workers = usersResponse.data?.data?.workers || [];

        // Then fetch stats for each worker concurrently
        const statsPromises = workers.map((worker) =>
          api.get(`/analytics/worker/${worker._id}`).then((res) => res.data?.data)
        );

        const allStats = await Promise.all(statsPromises);
        
        if (isMounted) {
          setWorkersStats(allStats.filter(Boolean));
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load worker stats');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-slate-400">Loading worker performance...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-rose-400">{error}</div>;
  }

  if (workersStats.length === 0) {
    return <div className="p-4 text-center text-slate-500">No workers found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Worker Name</th>
            <th className="px-4 py-3 text-center">Assigned</th>
            <th className="px-4 py-3 text-center">Completed</th>
            <th className="px-4 py-3 text-center">Verified</th>
            <th className="px-4 py-3 text-center">Rejected</th>
            <th className="px-4 py-3 text-center">Verification %</th>
            <th className="px-4 py-3 text-center">Avg Time (hrs)</th>
          </tr>
        </thead>
        <tbody>
          {workersStats.map((stat) => (
            <tr key={stat.workerId} className="border-b border-slate-700/50 hover:bg-slate-700/30">
              <td className="px-4 py-3 font-medium text-white">{stat.name}</td>
              <td className="px-4 py-3 text-center">{stat.assignedTasks}</td>
              <td className="px-4 py-3 text-center">{stat.completedTasks}</td>
              <td className="px-4 py-3 text-center">{stat.verifiedTasks}</td>
              <td className="px-4 py-3 text-center text-rose-400">{stat.rejectedTasks}</td>
              <td className="px-4 py-3 text-center">{stat.verificationRate}%</td>
              <td className="px-4 py-3 text-center">{stat.avgCompletionTimeHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
