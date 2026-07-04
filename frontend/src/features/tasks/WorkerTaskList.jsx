import { Link } from 'react-router-dom';

function formatDate(value) {
  if (!value) {
    return 'No deadline';
  }

  return new Date(value).toLocaleString();
}

export default function WorkerTaskList({ tasks, loading, error }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-48 animate-pulse rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/70" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>;
  }

  if (!tasks.length) {
    return <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 text-center text-slate-500 dark:text-slate-400">No tasks found in this view.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <Link
          key={task._id}
          to={`/worker/tasks/${task._id}`}
          className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 transition hover:border-sky-400 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-500 dark:text-sky-300">{task.priority}</p>
              <h3 className="mt-2 text-lg font-semibold">{task.title}</h3>
            </div>
            <span className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs capitalize text-slate-600 dark:text-slate-300">{task.status}</span>
          </div>

          <p className="mt-4 line-clamp-3 text-sm text-slate-400">{task.description || 'No description provided.'}</p>

          <div className="mt-5 space-y-2 text-sm text-slate-300">
            <p>
              <span className="text-slate-500">Location:</span> {task.locationAddress || 'No location'}
            </p>
            <p>
              <span className="text-slate-500">Deadline:</span> {formatDate(task.deadline)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}