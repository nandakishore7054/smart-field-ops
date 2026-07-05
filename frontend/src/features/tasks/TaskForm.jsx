import { useEffect, useMemo, useState } from 'react';
import api from '../../app/api';

const initialFormState = {
  title: '',
  description: '',
  priority: 'medium',
  deadline: '',
  locationAddress: '',
  assignedTo: '',
};

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

function validateTaskForm(formState) {
  const errors = {};

  if (!formState.title.trim()) {
    errors.title = 'Title is required.';
  }

  if (!formState.deadline) {
    errors.deadline = 'Deadline is required.';
  } else if (new Date(formState.deadline).getTime() <= Date.now()) {
    errors.deadline = 'Deadline must be in the future.';
  }

  return errors;
}

export default function TaskForm({ editingTask, onSaved, onCancel }) {
  const [formState, setFormState] = useState(initialFormState);
  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [workerAvailabilityStatus, setWorkerAvailabilityStatus] = useState(null);

  const isEditing = Boolean(editingTask);

  useEffect(() => {
    if (editingTask) {
      setFormState({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        deadline: editingTask.deadline ? new Date(editingTask.deadline).toISOString().slice(0, 16) : '',
        locationAddress: editingTask.locationAddress || '',
        assignedTo: editingTask.assignedTo?._id || editingTask.assignedTo || '',
      });
      return;
    }

    setFormState(initialFormState);
  }, [editingTask]);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkers() {
      try {
        const response = await api.get('/users/workers');
        const workerList = response.data?.data?.workers || [];

        if (isMounted) {
          setWorkers(workerList);
        }
      } catch (error) {
        if (isMounted) {
          setServerMessage(error.response?.data?.message || 'Unable to load workers.');
        }
      } finally {
        if (isMounted) {
          setLoadingWorkers(false);
        }
      }
    }

    loadWorkers();

    return () => {
      isMounted = false;
    };
  }, []);

  const workerOptions = useMemo(
    () => workers.map((worker) => ({ value: worker._id, label: `${worker.name} (${worker.email})` })),
    [workers]
  );

  useEffect(() => {
    async function checkAvailability() {
      if (!formState.assignedTo || !formState.deadline) {
        setWorkerAvailabilityStatus(null);
        return;
      }
      try {
        const res = await api.get(`/availability/${formState.assignedTo}`);
        const availabilities = res.data?.data || [];
        
        const date = new Date(formState.deadline);
        const dayOfWeek = date.getDay();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        const dayAvail = availabilities.find(a => a.dayOfWeek === dayOfWeek);
        
        if (!dayAvail || timeStr < dayAvail.startTime || timeStr > dayAvail.endTime) {
          setWorkerAvailabilityStatus('Worker is unavailable during this time.');
        } else {
          setWorkerAvailabilityStatus(null);
        }
      } catch (e) {
        console.error('Failed to fetch worker availability', e);
      }
    }
    
    checkAvailability();
  }, [formState.assignedTo, formState.deadline]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateTaskForm(formState);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setServerMessage('');

    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      priority: formState.priority,
      deadline: new Date(formState.deadline).toISOString(),
      locationAddress: formState.locationAddress.trim(),
      assignedTo: formState.assignedTo || null,
    };

    try {
      if (isEditing) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }

      setFormState(initialFormState);
      onSaved?.();
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to save the task.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Task form</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{isEditing ? 'Edit task' : 'Create task'}</h3>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Title</span>
          <input
            value={formState.title}
            onChange={(event) => setFormState({ ...formState, title: event.target.value })}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            placeholder="Inspect north warehouse"
          />
          {errors.title ? <p className="text-sm text-rose-400">{errors.title}</p> : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Description</span>
          <textarea
            rows={4}
            value={formState.description}
            onChange={(event) => setFormState({ ...formState, description: event.target.value })}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            placeholder="Provide any important instructions"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Priority</span>
            <select
              value={formState.priority}
              onChange={(event) => setFormState({ ...formState, priority: event.target.value })}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-300">Deadline</span>
            <input
              type="datetime-local"
              value={formState.deadline}
              onChange={(event) => setFormState({ ...formState, deadline: event.target.value })}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
            {errors.deadline ? <p className="text-sm text-rose-400">{errors.deadline}</p> : null}
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Location address</span>
          <input
            value={formState.locationAddress}
            onChange={(event) => setFormState({ ...formState, locationAddress: event.target.value })}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            placeholder="Warehouse 14, Industrial Park"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Assignee</span>
          <select
            value={formState.assignedTo}
            onChange={(event) => setFormState({ ...formState, assignedTo: event.target.value })}
            disabled={loadingWorkers}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Unassigned</option>
            {workerOptions.map((worker) => (
              <option key={worker.value} value={worker.value}>
                {worker.label}
              </option>
            ))}
          </select>
          {loadingWorkers ? <p className="text-xs text-slate-500">Loading workers...</p> : null}
          {workerAvailabilityStatus && (
            <p className="text-sm text-yellow-500 mt-1">{workerAvailabilityStatus}</p>
          )}
        </label>

        {serverMessage ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{serverMessage}</p> : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update task' : 'Create task'}
          </button>
          {isEditing ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}