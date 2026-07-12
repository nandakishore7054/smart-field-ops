import { useState, useEffect } from 'react';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { Badge } from '../../common/components/ui/Badge';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
    return (
      <Card className="p-6 border-border/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-bold text-foreground">Worker Performance</h3>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/20 bg-destructive/5 shadow-sm">
        <p className="text-sm text-destructive font-medium text-center">{error}</p>
      </Card>
    );
  }

  if (workersStats.length === 0) {
    return (
      <Card className="p-6 border-border/50 shadow-sm">
        <EmptyState
          icon={Users}
          title="No Workers"
          description="No worker performance data found."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <div className="px-6 py-4 border-b border-border/50 bg-surface-muted/30">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Worker Performance</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted/50 text-xs uppercase text-muted-foreground tracking-wider border-b border-border/50">
            <tr>
              <th className="px-4 py-3 font-bold">Worker Name</th>
              <th className="px-4 py-3 text-center font-bold">Assigned</th>
              <th className="px-4 py-3 text-center font-bold">Completed</th>
              <th className="px-4 py-3 text-center font-bold">Verified</th>
              <th className="px-4 py-3 text-center font-bold">Rejected</th>
              <th className="px-4 py-3 text-center font-bold">Verification %</th>
              <th className="px-4 py-3 text-center font-bold">Avg Time (hrs)</th>
            </tr>
          </thead>
          <tbody>
            {workersStats.map((stat, idx) => (
              <motion.tr
                key={stat.workerId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="border-b border-border/30 hover:bg-surface-muted/20 transition-colors"
              >
                <td className="px-4 py-3.5 font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {stat.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                    {stat.name}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center text-muted-foreground font-medium">{stat.assignedTasks}</td>
                <td className="px-4 py-3.5 text-center">
                  <Badge variant="success" className="text-[10px] px-2 py-0.5">{stat.completedTasks}</Badge>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Badge variant="info" className="text-[10px] px-2 py-0.5">{stat.verifiedTasks}</Badge>
                </td>
                <td className="px-4 py-3.5 text-center">
                  <Badge variant="destructive" className="text-[10px] px-2 py-0.5">{stat.rejectedTasks}</Badge>
                </td>
                <td className="px-4 py-3.5 text-center font-mono text-foreground">{stat.verificationRate}%</td>
                <td className="px-4 py-3.5 text-center font-mono text-muted-foreground">{stat.avgCompletionTimeHours}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
