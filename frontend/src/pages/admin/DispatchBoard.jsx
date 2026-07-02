import { useState } from 'react';
import api from '../../app/api';
import TaskForm from '../../features/tasks/TaskForm';
import TaskList from '../../features/tasks/TaskList';
import AdminVerificationView from '../../features/submissions/AdminVerificationView';

export default function DispatchBoard() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedReviewTask, setSelectedReviewTask] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  function handleSaved() {
    setEditingTask(null);
    setRefreshToken((value) => value + 1);
  }

  function handleEditTask(task) {
    setEditingTask(task);
  }

  function handleCancelEdit() {
    setEditingTask(null);
  }

  async function handleReviewTask(task) {
    setLoadingReview(true);
    setReviewError('');

    try {
      const response = await api.get(`/tasks/${task._id}`);
      setSelectedReviewTask(response.data?.data?.task || null);
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Unable to load verification details.');
    } finally {
      setLoadingReview(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Task management</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Dispatch Board</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          Create, update, and remove tasks from the admin workspace. This page is limited to Phase 3 functionality.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <TaskForm editingTask={editingTask} onSaved={handleSaved} onCancel={handleCancelEdit} />
        <TaskList refreshToken={refreshToken} onEditTask={handleEditTask} onDeleted={handleSaved} onReviewTask={handleReviewTask} />
      </div>

      <div className="space-y-4">
        {reviewError ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{reviewError}</p> : null}
        {loadingReview ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">Loading verification details...</div>
        ) : (
          <AdminVerificationView task={selectedReviewTask} onVerified={setSelectedReviewTask} />
        )}
      </div>
    </section>
  );
}