import React, { useEffect, useState } from 'react';
import CheckInButton from '../../features/attendance/CheckInButton';
import api from '../../app/api';
import toast from 'react-hot-toast';

import { useAuth } from '../../app/auth-context';

export default function CheckIn() {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState('not-checked-in');
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);

  useEffect(() => {
    fetchTodayRecord();
  }, []);

  const fetchTodayRecord = async () => {
    try {
      const res = await api.get('/attendance/me');
      const records = res.data.data;
      
      const today = new Date().toISOString().split('T')[0];
      const recordForToday = records.find(r => r.date.startsWith(today));
      
      if (recordForToday) {
        setTodayRecord(recordForToday);
        if (recordForToday.checkOut && recordForToday.checkOut.time) {
          setCurrentStatus('checked-out');
        } else if (recordForToday.checkIn && recordForToday.checkIn.time) {
          setCurrentStatus('checked-in');
        }
      }
    } catch (error) {
      toast.error('Failed to fetch attendance status');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newRecord) => {
    setTodayRecord(newRecord);
    if (newRecord.checkOut && newRecord.checkOut.time) {
      setCurrentStatus('checked-out');
    } else {
      setCurrentStatus('checked-in');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Time & Attendance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your daily check-in and check-out</p>
        </div>
      </div>

      {user?.shiftId && typeof user.shiftId === 'object' && (
        <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-900 dark:text-sky-300 mb-2">Assigned Shift: {user.shiftId.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-sky-700 dark:text-sky-400 font-medium">Schedule</p>
              <p className="text-slate-800 dark:text-slate-200">{user.shiftId.startTime} - {user.shiftId.endTime}</p>
            </div>
            <div>
              <p className="text-sky-700 dark:text-sky-400 font-medium">Grace Period</p>
              <p className="text-slate-800 dark:text-slate-200">{user.shiftId.gracePeriodMinutes} mins</p>
            </div>
          </div>
        </div>
      )}

      <CheckInButton currentStatus={currentStatus} onStatusChange={handleStatusChange} />

      {todayRecord && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Today's Activity</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Check In</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {todayRecord.checkIn ? new Date(todayRecord.checkIn.time).toLocaleTimeString() : '--:--'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Check Out</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {todayRecord.checkOut ? new Date(todayRecord.checkOut.time).toLocaleTimeString() : '--:--'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                {todayRecord.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Hours</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {todayRecord.totalHours} hrs
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Overtime</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {todayRecord.overtime} hrs
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
