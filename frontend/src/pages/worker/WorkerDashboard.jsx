import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../app/api';
import WorkerTaskList from '../../features/tasks/WorkerTaskList';

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/tasks/my-tasks');
        if (isMounted) {
          setTasks(response.data?.data?.tasks || []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || 'Unable to load your tasks.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const getFilteredTasks = () => {
    const now = new Date();
    const todayStr = now.toDateString();

    return tasks.filter(task => {
      const isCompleted = task.status === 'completed' || task.status === 'verified' || task.status === 'rejected';
      if (activeTab === 'completed') return isCompleted;

      if (isCompleted) return false;

      if (activeTab === 'today') {
        if (!task.deadline) return true; // No deadline -> treat as anytime
        const deadlineDate = new Date(task.deadline);
        return deadlineDate <= now || deadlineDate.toDateString() === todayStr;
      }

      if (activeTab === 'upcoming') {
        if (!task.deadline) return false;
        const deadlineDate = new Date(task.deadline);
        return deadlineDate > now && deadlineDate.toDateString() !== todayStr;
      }

      return true;
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 p-2 md:p-4 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Task Queue</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your assigned tasks, view upcoming deadlines, and track your progress.
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-border/60 pb-px">
        {['today', 'upcoming', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all relative ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            } rounded-t-lg`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-primary"
                initial={false}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <WorkerTaskList tasks={filteredTasks} loading={loading} error={error} />
      </motion.div>
    </motion.section>
  );
}