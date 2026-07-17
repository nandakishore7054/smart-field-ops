import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { Badge } from '../../common/components/ui/Badge';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { FileX, ShieldCheck, User } from 'lucide-react';

export default function AttendanceLog({ records, loading }) {
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-4 p-4 border border-border/50 rounded-xl bg-background">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg hidden sm:block" />
            <Skeleton className="h-8 w-24 rounded-lg hidden md:block" />
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-12">
        <EmptyState
          icon={FileX}
          title="No Attendance Records"
          description="There are no check-ins or absences recorded for this date."
        />
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm whitespace-nowrap min-w-[900px]">
      <thead className="bg-surface-muted/30 text-xs uppercase text-muted-foreground font-semibold sticky top-0 z-10 border-b border-border/50">
        <tr>
          <th className="px-6 py-4">Worker</th>
          <th className="px-6 py-4">Shift</th>
          <th className="px-6 py-4">Date</th>
          <th className="px-6 py-4">Check In</th>
          <th className="px-6 py-4">Check Out</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">GPS Verification</th>
          <th className="px-6 py-4 text-right">Hours</th>
          <th className="px-6 py-4 text-right">Overtime</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/50">
        {records.map((record, idx) => (
          <motion.tr 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={record._id} 
            className="hover:bg-surface-muted/30 transition-colors group"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shadow-sm group-hover:ring-2 ring-primary/20 transition-all shrink-0">
                  {record.workerId?.name ? record.workerId.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-foreground">{record.workerId?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{record.workerId?.email || 'No email'}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 font-medium text-foreground">
              {record.shiftId?.name || '--'}
            </td>
            <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
              {new Date(record.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 font-mono text-sm text-foreground">
              {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '--:--'}
            </td>
            <td className="px-6 py-4 font-mono text-sm text-foreground">
              {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '--:--'}
            </td>
            <td className="px-6 py-4">
              <Badge 
                variant={
                  record.status === 'present' ? 'success' :
                  record.status === 'late' ? 'warning' :
                  record.status === 'absent' ? 'destructive' :
                  'info'
                } 
                className="uppercase text-[10px] tracking-wider px-2.5 py-1"
              >
                {record.status}
              </Badge>
            </td>
            <td className="px-6 py-4">
              {record.checkIn?.method === 'gps' ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-success dark:text-success-hover bg-success/10 px-2 py-1 rounded-md w-fit">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </div>
              ) : (
                <span className="text-xs text-muted-foreground font-medium">Manual</span>
              )}
            </td>
            <td className="px-6 py-4 text-right font-mono font-medium text-foreground">
              {record.totalHours ? `${record.totalHours}h` : '--'}
            </td>
            <td className="px-6 py-4 text-right font-mono font-medium text-foreground">
              {record.overtime ? `${record.overtime}h` : '--'}
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  );
}
