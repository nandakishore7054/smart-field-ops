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

function getProgressPercentage(status) {
  switch (status) {
    case 'assigned': return 25;
    case 'in-progress': return 50;
    case 'completed': return 75;
    case 'verified': return 100;
    case 'rejected': return 25; // Send them back
    default: return 0;
  }
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

  const progress = getProgressPercentage(task.status);
  
  const getGoogleMapsLink = () => {
    if (task.locationCoordinates && task.locationCoordinates.coordinates) {
      const [lng, lat] = task.locationCoordinates.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    if (task.locationAddress) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.locationAddress)}`;
    }
    return null;
  };
  
  const mapLink = getGoogleMapsLink();

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky-500 dark:text-sky-300">Task detail</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{task.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{task.locationAddress || 'No location specified'}</span>
            {mapLink && (
              <a 
                href={mapLink} 
                target="_blank" 
                rel="noreferrer"
                className="text-sky-500 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Maps
              </a>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs capitalize text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50">
            {task.status}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1 text-slate-500">
          <span>Assigned</span>
          <span>In Progress</span>
          <span>Completed</span>
          <span>Verified</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
          <div 
            className="bg-sky-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Description</p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{formatDate(task.deadline)}</p>
        </article>
      </div>

      {message ? <p className="mt-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">{message}</p> : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {task.status === 'assigned' ? (
          <button
            type="button"
            onClick={startTask}
            disabled={submitting}
            className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Starting...' : 'Start Task'}
          </button>
        ) : null}
        <Link to="/worker/dashboard" className="rounded-2xl border border-slate-300 dark:border-slate-700 px-5 py-3 font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:border-slate-500 dark:hover:text-white">
          Back to tasks
        </Link>
      </div>

      <div className="mt-6">
        <ProofSubmissionForm task={task} onSubmitted={onStatusUpdated} />
      </div>
    </section>
  );
}