import { useEffect, useState } from 'react';
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
    <section className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold">Your task queue</h2>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        {['today', 'upcoming', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <WorkerTaskList tasks={filteredTasks} loading={loading} error={error} />
    </section>
  );
}