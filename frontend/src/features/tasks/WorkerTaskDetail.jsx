import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../app/api';
import ProofSubmissionForm from '../submissions/ProofSubmissionForm';

function formatDate(value) {
  if (!value) {
    return 'No deadline';
  }

  return new Date(value).toLocaleString();
}

export default function WorkerTaskDetail({ task, onStatusUpdated }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function startTask() {
    setSubmitting(true);
    setMessage('');

    try {
      const response = await api.patch(`/tasks/${task._id}/status`, { status: 'in-progress' });
      onStatusUpdated?.(response.data?.data?.task || null);
      setMessage('Task started successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to start the task.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Task detail</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{task.title}</h2>
          <p className="mt-2 text-sm text-slate-400">{task.locationAddress || 'No location specified'}</p>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs capitalize text-slate-300">{task.status}</span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Description</p>
          <p className="mt-2 text-sm text-slate-200">{task.description || 'No description provided.'}</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
          <p className="mt-2 text-sm text-slate-200">{formatDate(task.deadline)}</p>
        </article>
      </div>

      {message ? <p className="mt-5 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {task.status === 'assigned' ? (
          <button
            type="button"
            onClick={startTask}
            disabled={submitting}
            className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Starting...' : 'Start Task'}
          </button>
        ) : null}
        <Link to="/worker/dashboard" className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white">
          Back to tasks
        </Link>
      </div>

      <div className="mt-6">
        <ProofSubmissionForm task={task} onSubmitted={onStatusUpdated} />
      </div>
    </section>
  );
}