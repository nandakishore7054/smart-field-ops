import React from 'react';

export default function AttendanceLog({ records, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">No attendance records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">Worker</th>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">Shift</th>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">Date</th>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">Check In</th>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">Check Out</th>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">Status</th>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200">GPS</th>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200 text-right">Worked Hours</th>
            <th className="px-6 py-4 font-medium text-slate-900 dark:text-slate-200 text-right">Overtime</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.map(record => (
            <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                {record.workerId?.name || 'Unknown'}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {record.shiftId?.name || '--'}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {new Date(record.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString() : '--:--'}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString() : '--:--'}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize
                  ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : ''}
                  ${record.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : ''}
                  ${record.status === 'absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : ''}
                  ${['half-day', 'on-leave'].includes(record.status) ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400' : ''}
                `}>
                  {record.status}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {record.checkIn?.method === 'gps' ? 'Verified' : 'Manual'}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-right">
                {record.totalHours}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-right">
                {record.overtime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
