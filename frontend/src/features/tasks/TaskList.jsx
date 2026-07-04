import { useEffect, useState } from 'react';
import api from '../../app/api';

function formatDate(value) {
  if (!value) return 'No deadline';
  return new Date(value).toLocaleString();
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-4 py-4" colSpan={6}>
            <div className="h-8 rounded-2xl bg-slate-800/80" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function TaskList({ refreshToken, onEditTask, onDeleted, onReviewTask }) {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState('');

  async function loadTasks(nextPage = pagination.page, nextStatus = statusFilter, nextPriority = priorityFilter, nextSearch = search) {
    setLoading(true);
    setServerMessage('');

    try {
      const response = await api.get('/tasks', {
        params: {
          page: nextPage,
          limit: pagination.limit,
          status: nextStatus || undefined,
          priority: nextPriority || undefined,
          search: nextSearch || undefined,
        },
      });

      const payload = response.data?.data || {};
      setTasks(payload.tasks || []);
      setPagination({
        ...payload.pagination,
        limit: payload.pagination?.limit || pagination.limit,
      });
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks(1, statusFilter, priorityFilter, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken, statusFilter, priorityFilter, search]);

  async function handleDelete(taskId) {
    if (!window.confirm('Delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      onDeleted?.();
      await loadTasks(pagination.page, statusFilter);
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to delete the task.');
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-500 dark:text-sky-300">Task list</p>
            <h3 className="mt-2 text-2xl font-semibold">Existing tasks</h3>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-sm outline-none focus:border-sky-500"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-sm outline-none focus:border-sky-500"
          >
            <option value="">All statuses</option>
            {['unassigned', 'assigned', 'in-progress', 'completed', 'verified'].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2 text-sm outline-none focus:border-sky-500"
          >
            <option value="">All priorities</option>
            {['low', 'medium', 'high', 'urgent'].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {serverMessage ? <p className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{serverMessage}</p> : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900/60 text-sm">
              {loading ? (
                <LoadingRows />
              ) : tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task._id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{task.locationAddress || 'No location'}</p>
                    </td>
                    <td className="px-4 py-4 capitalize">{task.priority}</td>
                    <td className="px-4 py-4">{task.assignedTo?.name || 'Unassigned'}</td>
                    <td className="px-4 py-4 capitalize">{task.status}</td>
                    <td className="px-4 py-4">{formatDate(task.deadline)}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEditTask?.(task)}
                          className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-sky-400 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onReviewTask?.(task)}
                          className="rounded-xl border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(task._id)}
                          className="rounded-xl border border-rose-500/40 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 lg:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800/80" />
            ))
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <article key={task._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-white">{task.title}</h4>
                    <p className="mt-1 text-sm text-slate-400">{task.locationAddress || 'No location'}</p>
                  </div>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase text-slate-300">{task.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div>
                    <span className="block text-xs uppercase text-slate-500">Priority</span>
                    {task.priority}
                  </div>
                  <div>
                    <span className="block text-xs uppercase text-slate-500">Assignee</span>
                    {task.assignedTo?.name || 'Unassigned'}
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs uppercase text-slate-500">Deadline</span>
                    {formatDate(task.deadline)}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditTask?.(task)}
                    className="flex-1 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onReviewTask?.(task)}
                    className="flex-1 rounded-xl border border-emerald-500/40 px-3 py-2 text-sm font-semibold text-emerald-300"
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(task._id)}
                    className="flex-1 rounded-xl border border-rose-500/40 px-3 py-2 text-sm font-semibold text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 text-center text-slate-400">No tasks found.</p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <p>
          Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadTasks(Math.max(1, pagination.page - 1), statusFilter)}
            disabled={!pagination.hasPrevPage}
            className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => loadTasks(pagination.page + 1, statusFilter)}
            disabled={!pagination.hasNextPage}
            className="rounded-xl border border-slate-700 px-4 py-2 font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}