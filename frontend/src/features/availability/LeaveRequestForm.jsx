import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';

export default function LeaveRequestForm({ onSuccess }) {

  const [loading, setLoading] = useState(false);

  // use proper useState setup
  const [formState, setFormState] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formState.startDate || !formState.endDate) {
      toast.error('Start and End dates are required.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/leave-requests', formState);
      toast.success('Leave request submitted successfully');
      setFormState({ type: 'vacation', startDate: '', endDate: '', reason: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error?.details?.startDate?.[0] || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Request Time Off</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
          <select
            name="type"
            value={formState.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="emergency">Emergency Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formState.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formState.endDate}
              onChange={handleChange}
              min={formState.startDate || new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason (Optional)</label>
          <textarea
            name="reason"
            value={formState.reason}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
