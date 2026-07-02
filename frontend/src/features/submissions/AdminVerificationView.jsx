import { useMemo, useState } from 'react';
import api from '../../app/api';

function mapsLinkFromLocation(submittedLocation) {
  if (!submittedLocation?.coordinates?.length) {
    return null;
  }

  const [longitude, latitude] = submittedLocation.coordinates;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export default function AdminVerificationView({ task, onVerified }) {
  const [isVerified, setIsVerified] = useState(true);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submission = task?.submission || null;
  const mapsLink = useMemo(() => mapsLinkFromLocation(submission?.submittedLocation), [submission]);

  async function submitVerification() {
    if (!task?._id) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await api.patch(`/tasks/${task._id}/verify`, {
        isVerified,
        verificationFeedback,
      });

      setMessage(isVerified ? 'Task approved.' : 'Task rejected.');
      onVerified?.(response.data?.data?.task || null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save verification.');
    } finally {
      setLoading(false);
    }
  }

  if (!task) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-slate-400">
        Select a completed task to review submission details.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Admin verification</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{task.title}</h3>
      </div>

      {!submission ? (
        <p className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
          No submission has been created for this task yet.
        </p>
      ) : (
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {submission.images?.map((image) => (
              <img key={image} src={image} alt="Proof evidence" className="h-48 w-full rounded-2xl object-cover" />
            ))}
          </div>

          <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Notes</p>
            <p className="mt-2 text-sm text-slate-200">{submission.notes || 'No notes provided.'}</p>
          </article>

          {mapsLink ? (
            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-sky-300 hover:border-sky-400"
            >
              Open location in Google Maps
            </a>
          ) : null}

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Verification feedback</span>
            <textarea
              rows={4}
              value={verificationFeedback}
              onChange={(event) => setVerificationFeedback(event.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Add approval or rejection feedback"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsVerified(true)}
              className={`rounded-2xl px-5 py-3 font-semibold transition ${
                isVerified ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 text-slate-200 hover:border-slate-500'
              }`}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setIsVerified(false)}
              className={`rounded-2xl px-5 py-3 font-semibold transition ${
                !isVerified ? 'bg-rose-500 text-slate-950' : 'border border-slate-700 text-slate-200 hover:border-slate-500'
              }`}
            >
              Reject
            </button>
            <button
              type="button"
              onClick={submitVerification}
              disabled={loading}
              className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Saving...' : 'Save verification'}
            </button>
          </div>

          {message ? <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">
            Current task status: <span className="capitalize text-slate-200">{task.status}</span>
          </div>
        </div>
      )}
    </section>
  );
}