import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../app/api';
import WorkerTaskDetail from '../../features/tasks/WorkerTaskDetail';
import { Card } from '../../common/components/ui/Card';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { AlertTriangle, FileX } from 'lucide-react';

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
    return (
      <Card className="p-6 border-border/50 shadow-sm space-y-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-destructive/20 bg-destructive/5 shadow-sm">
        <EmptyState
          icon={AlertTriangle}
          title="Error"
          description={error}
        />
      </Card>
    );
  }

  if (!task) {
    return (
      <Card className="p-6 border-border/50 shadow-sm">
        <EmptyState
          icon={FileX}
          title="Task Not Found"
          description="The requested task could not be found."
        />
      </Card>
    );
  }

  return <WorkerTaskDetail task={task} onStatusUpdated={setTask} />;
}