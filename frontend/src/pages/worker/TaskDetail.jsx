import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../app/api';
import WorkerTaskDetail from '../../features/tasks/WorkerTaskDetail';

export default function TaskDetail() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadTask() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/tasks/my-tasks');
        const tasks = response.data?.data?.tasks || [];
        const nextTask = tasks.find((item) => item._id === id);

        if (isMounted) {
          if (!nextTask) {
            setError('Task not found.');
          } else {
            setTask(nextTask);
          }
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || 'Unable to load the task.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">Loading task...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-300">{error}</div>;
  }

  if (!task) {
    return null;
  }

  return <WorkerTaskDetail task={task} onStatusUpdated={setTask} />;
}