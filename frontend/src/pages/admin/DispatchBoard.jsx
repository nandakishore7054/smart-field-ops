import { useState } from 'react';
import TaskForm from '../../features/tasks/TaskForm';
import TaskList from '../../features/tasks/TaskList';

export default function DispatchBoard() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [editingTask, setEditingTask] = useState(null);

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
        <TaskList refreshToken={refreshToken} onEditTask={handleEditTask} onDeleted={handleSaved} />
      </div>
    </section>
  );
}