import React, { useState, useEffect } from 'react';
import AdminLayout from '../../common/layouts/AdminLayout';
import AvailabilityGrid from '../../features/availability/AvailabilityGrid';
import LeaveRequestList from '../../features/availability/LeaveRequestList';
import api from '../../app/api';
import toast from 'react-hot-toast';

export default function AvailabilityManagement() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/users/workers');
      const workerList = res.data?.data?.workers;
      const validWorkers = Array.isArray(workerList) ? workerList : [];
      setWorkers(validWorkers);
      if (validWorkers.length > 0) {
        setSelectedWorkerId(validWorkers[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Availability Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Worker Schedules</h2>
            
            {loading ? (
              <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Worker to View/Edit Schedule
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={selectedWorkerId || ''}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                >
                  {Array.isArray(workers) && workers.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedWorkerId && (
              <AvailabilityGrid workerId={selectedWorkerId} />
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <LeaveRequestList isAdmin={true} />
        </div>
      </div>
    </div>
  );
}
