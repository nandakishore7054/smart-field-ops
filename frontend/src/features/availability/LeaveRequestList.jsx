import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';

export default function LeaveRequestList({ isAdmin = false, refreshTrigger = 0 }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [isAdmin, refreshTrigger]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/leave-requests' : '/leave-requests/me';
      const res = await api.get(endpoint);
      setRequests(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await api.patch(`/leave-requests/${id}/approve`, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow">
        No leave requests found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          {isAdmin ? 'Leave Requests' : 'My Leave Requests'}
        </h3>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {requests.map((req) => (
          <li key={req._id} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                {isAdmin && req.workerId && (
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {req.workerId.name}
                  </p>
                )}
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="capitalize font-medium">{req.type} Leave</span> &bull;{' '}
                  {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                </div>
                {req.reason && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    "{req.reason}"
                  </p>
                )}
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${req.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    ${req.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : ''}
                    ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                  `}
                >
                  {req.status}
                </span>

                {isAdmin && req.status === 'pending' && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleApprove(req._id, 'approved')}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(req._id, 'rejected')}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
