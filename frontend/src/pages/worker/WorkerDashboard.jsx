import { useEffect, useState } from 'react';
import api from '../../app/api';
import WorkerTaskList from '../../features/tasks/WorkerTaskList';

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Worker Dashboard</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Your task queue</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          This worker view is limited to assigned tasks and supports offline-friendly shell rendering.
        </p>
      </div>

      <WorkerTaskList tasks={tasks} loading={loading} error={error} />
    </section>
  );
}