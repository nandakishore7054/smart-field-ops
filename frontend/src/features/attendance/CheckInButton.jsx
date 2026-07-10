import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';

export default function CheckInButton({ currentStatus, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const endpoint = action === 'check-in' ? '/attendance/check-in' : '/attendance/check-out';
          const res = await api.post(endpoint, {
            location: { latitude, longitude },
            method: 'gps',
          });
          toast.success(res.data.message);
          if (onStatusChange) onStatusChange(res.data.data);
        } catch (error) {
          toast.error(error.response?.data?.message || `Failed to ${action}.`);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please enable location services to check in.');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  if (currentStatus === 'checked-out') {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Shift Completed</h3>
        <p className="text-slate-500 dark:text-slate-400">You have successfully checked out for today. See you tomorrow!</p>
      </div>
    );
  }

  const isCheckedIn = currentStatus === 'checked-in';
  
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 flex flex-col items-center justify-center text-center shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isCheckedIn ? 'Active Shift' : 'Ready to Start?'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {isCheckedIn ? 'You are currently checked in and your location was recorded.' : 'Check in to begin your shift. Your GPS location will be verified.'}
        </p>
      </div>

      <button
        onClick={() => handleAction(isCheckedIn ? 'check-out' : 'check-in')}
        disabled={loading}
        className={`w-48 h-48 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          isCheckedIn 
            ? 'bg-gradient-to-br from-rose-400 to-rose-600 hover:from-rose-500 hover:to-rose-700 shadow-rose-500/30'
            : 'bg-gradient-to-br from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 shadow-sky-500/30'
        } ${loading ? 'opacity-75 cursor-not-allowed animate-pulse' : ''}`}
      >
        {loading ? 'Processing...' : (isCheckedIn ? 'Check Out' : 'Check In')}
      </button>
    </div>
  );
}
