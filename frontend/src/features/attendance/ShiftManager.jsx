import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';

export default function ShiftManager() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({ name: '', startTime: '', endTime: '', gracePeriodMinutes: 15, workers: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeWorkers, setActiveWorkers] = useState([]);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      setShifts(res.data.data);
    } catch (error) {
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/users/workers');
      // The API returns { status: 'success', data: { workers: [...] } }
      // which means res.data.data.workers is the array.
      const workersData = res.data?.data?.workers || res.data?.data || [];
      if (Array.isArray(workersData)) {
        setActiveWorkers(workersData);
      } else {
        setActiveWorkers([]);
      }
    } catch (error) {
      toast.error('Failed to load workers');
      setActiveWorkers([]);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchWorkers();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setFormState({ ...formState, [e.target.name]: value });
  };

  const handleWorkerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormState({ ...formState, workers: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/shifts/${editingId}`, formState);
        toast.success('Shift updated successfully');
      } else {
        await api.post('/shifts', formState);
        toast.success('Shift created successfully');
      }
      setFormState({ name: '', startTime: '', endTime: '', gracePeriodMinutes: 15, workers: [] });
      setEditingId(null);
      fetchShifts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (shift) => {
    setFormState({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      gracePeriodMinutes: shift.gracePeriodMinutes,
      workers: shift.workers ? shift.workers.map(w => w._id || w) : []
    });
    setEditingId(shift._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) return;
    try {
      await api.delete(`/shifts/${id}`);
      toast.success('Shift deleted');
      fetchShifts();
    } catch (error) {
      toast.error('Failed to delete shift');
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create New Shift</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Shift Name</span>
            <input
              type="text"
              name="name"
              required
              value={formState.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-sky-500"
              placeholder="e.g., Morning Shift"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Grace Period (minutes)</span>
            <input
              type="number"
              name="gracePeriodMinutes"
              min="0"
              required
              value={formState.gracePeriodMinutes}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-sky-500"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time (HH:mm)</span>
            <input
              type="time"
              name="startTime"
              required
              value={formState.startTime}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-sky-500"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">End Time (HH:mm)</span>
            <input
              type="time"
              name="endTime"
              required
              value={formState.endTime}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-sky-500"
            />
          </label>
          <label className="block space-y-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign Workers</span>
            <select
              multiple
              name="workers"
              value={formState.workers}
              onChange={handleWorkerChange}
              className="w-full h-32 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-sky-500"
            >
              {activeWorkers.map(worker => (
                <option key={worker._id} value={worker._id}>
                  {worker.name} ({worker.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple workers.</p>
          </label>
          <div className="md:col-span-2 flex justify-end mt-2 gap-4">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormState({ name: '', startTime: '', endTime: '', gracePeriodMinutes: 15 });
                }}
                className="rounded-xl border border-slate-300 dark:border-slate-600 px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Shift' : 'Create Shift')}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Existing Shifts</h3>
        {shifts.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No shifts defined yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map(shift => (
              <div key={shift._id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 relative group">
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${shift.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                <h4 className="font-semibold text-slate-900 dark:text-white">{shift.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {shift.startTime} - {shift.endTime}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Grace Period: {shift.gracePeriodMinutes} mins
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Assigned Workers: {shift.workers?.length || 0}
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => handleEdit(shift)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(shift._id)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
