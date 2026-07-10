import React, { useEffect, useState } from 'react';
import api from '../../../app/api';

export default function WorkerDailySummaryCard({ workerId, date, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workerId) return;
    
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        let url = `/tracking/daily-summary/${workerId}`;
        if (date) {
          url += `?date=${date}`;
        }
        const response = await api.get(url);
        if (isMounted) {
          setSummary(response.data.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch daily summary", err);
        if (isMounted) {
          setError(err.response?.data?.error || "Failed to load summary");
          setLoading(false);
        }
      }
    };

    fetchSummary();
    return () => { isMounted = false; };
  }, [workerId, date]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shrink-0 flex-1 flex flex-col justify-center">
        <div className="animate-pulse space-y-4 max-w-sm mx-auto w-full">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 text-center flex-1">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Failed to load summary</h3>
        <p className="text-red-500 text-sm mb-6">{error}</p>
        <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-medium transition-colors">Go Back</button>
      </div>
    );
  }

  if (!summary) return null;

  const {
    workerName, attendanceStatus, checkIn, checkOut,
    workingHours, distanceTravelled, customerVisits,
    customerTime, travelTime, performanceScore,
    performanceRating, isOnline, lastGPSUpdate,
    latitude, longitude
  } = summary;

  // Determine attendance badge styling
  let attendanceColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  if (attendanceStatus?.toLowerCase() === 'present') attendanceColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
  if (attendanceStatus?.toLowerCase() === 'late') attendanceColor = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  if (attendanceStatus?.toLowerCase() === 'absent') attendanceColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';

  // Determine score color
  let scoreColor = 'text-red-500';
  if (performanceScore >= 90) scoreColor = 'text-emerald-500';
  else if (performanceScore >= 75) scoreColor = 'text-blue-500';
  else if (performanceScore >= 60) scoreColor = 'text-amber-500';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 flex flex-col shrink-0 flex-1 overflow-hidden relative">
      {/* Sticky Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            {workerName}
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 ring-2 ring-emerald-500/30' : 'bg-slate-400'}`} title={isOnline ? 'Online' : 'Offline'}></div>
          </h3>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${attendanceColor}`}>
            {attendanceStatus}
          </span>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className={`text-3xl font-black leading-none ${scoreColor}`}>{performanceScore}</div>
          <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-1">{performanceRating}</div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Attendance Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 font-medium"><span className="text-emerald-500">▶</span> Check In</div>
            <div className="font-bold text-slate-800 dark:text-white">{checkIn || '--:--'}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 font-medium"><span className="text-rose-500">■</span> Check Out</div>
            <div className="font-bold text-slate-800 dark:text-white">{checkOut || '--:--'}</div>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 font-medium">Working Hours</div>
            <div className="font-black text-xl text-indigo-700 dark:text-indigo-300">{workingHours}</div>
          </div>
          <div className="bg-sky-50 dark:bg-sky-900/20 p-3.5 rounded-xl border border-sky-100 dark:border-sky-800 shadow-sm">
            <div className="text-xs text-sky-600 dark:text-sky-400 mb-1 font-medium">Distance Travelled</div>
            <div className="font-black text-xl text-sky-700 dark:text-sky-300">{distanceTravelled}</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/50">
          <div className="p-3.5 flex justify-between items-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Customer Visits</div>
            <div className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">{customerVisits}</div>
          </div>
          <div className="p-3.5 flex justify-between items-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Customer Time</div>
            <div className="font-bold text-slate-800 dark:text-white">{customerTime}</div>
          </div>
          <div className="p-3.5 flex justify-between items-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Travel Time</div>
            <div className="font-bold text-slate-800 dark:text-white">{travelTime}</div>
          </div>
        </div>

        {/* Live Location Details */}
        <div className="bg-slate-100 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latest Location</span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700">
              {lastGPSUpdate ? new Date(lastGPSUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </span>
          </div>
          <div className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 text-center shadow-inner">
            {latitude && longitude ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'No GPS data available'}
          </div>
        </div>
      </div>
      
      {/* Sticky Footer */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          Close Summary
        </button>
      </div>
    </div>
  );
}
