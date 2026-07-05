import React, { useState, useEffect } from 'react';
import AttendanceLog from '../../features/attendance/AttendanceLog';
import ShiftManager from '../../features/attendance/ShiftManager';
import api from '../../app/api';
import toast from 'react-hot-toast';

export default function AttendanceDashboard() {
  const [activeTab, setActiveTab] = useState('log'); // 'log' or 'shifts'
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchRecords = async (date) => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance?date=${date}`);
      setRecords(res.data.data);
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'log') {
      fetchRecords(filterDate);
    }
  }, [filterDate, activeTab]);

  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor workforce attendance and manage shifts</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('log')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'log' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Daily Log
          </button>
          <button
            onClick={() => setActiveTab('shifts')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'shifts' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Shifts
          </button>
        </div>
      </div>

      {activeTab === 'log' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Present</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Late</p>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{lateCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Absent</p>
                <p className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">{absentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Daily Log</h2>
              <input 
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-500"
              />
            </div>
            <AttendanceLog records={records} loading={loading} />
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <ShiftManager />
      )}
    </div>
  );
}
