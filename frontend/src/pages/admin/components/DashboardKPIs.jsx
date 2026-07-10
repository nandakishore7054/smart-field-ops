import React, { useState, useEffect } from 'react';
import api from '../../../app/api';

export default function DashboardKPIs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/dashboard/analytics');
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard KPIs', err);
      setError('Failed to load KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-400">
        <p>{error}</p>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Active Workers', 
      value: data?.workforce?.activeWorkers, 
      color: 'text-emerald-400',
      group: 'Workforce' 
    },
    { 
      label: 'Offline Workers', 
      value: data?.workforce?.offlineWorkers, 
      color: 'text-slate-400',
      group: 'Workforce' 
    },
    { 
      label: 'Present Today', 
      value: data?.attendance?.presentToday, 
      color: 'text-sky-400',
      group: 'Attendance' 
    },
    { 
      label: 'Completed Shifts', 
      value: data?.attendance?.completedShifts, 
      color: 'text-indigo-400',
      group: 'Attendance' 
    },
    { 
      label: 'Customer Visits', 
      value: data?.customer?.customerVisitsToday, 
      color: 'text-amber-400',
      group: 'Customer' 
    },
    { 
      label: 'Avg Visit Duration', 
      value: data?.customer?.averageVisitDuration, 
      color: 'text-amber-300',
      group: 'Customer' 
    },
    { 
      label: 'Total Distance', 
      value: data?.productivity?.totalDistanceToday, 
      color: 'text-fuchsia-400',
      group: 'Productivity' 
    },
    { 
      label: 'Avg Working Hours', 
      value: data?.attendance?.averageWorkingHours, 
      color: 'text-violet-400',
      group: 'Productivity' 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div key={index} className="rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 font-bold text-4xl select-none pointer-events-none transition-transform group-hover:scale-110">
            {kpi.group === 'Workforce' && '👷'}
            {kpi.group === 'Attendance' && '📅'}
            {kpi.group === 'Customer' && '🏢'}
            {kpi.group === 'Productivity' && '🚀'}
          </div>
          <p className="text-sm text-slate-400 relative z-10">{kpi.label}</p>
          <div className="mt-2 h-8 flex items-end relative z-10">
            {loading && !data ? (
              <div className="h-6 w-16 bg-slate-700 rounded animate-pulse"></div>
            ) : (
              <p className={`text-2xl font-bold transition-all duration-300 ${kpi.color || 'text-white'}`}>
                {kpi.value ?? '—'}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
