import React, { useEffect, useState } from 'react';
import { Clock, CalendarDays, Hourglass, CheckCircle2 } from 'lucide-react';
import CheckInButton from '../../features/attendance/CheckInButton';
import api from '../../app/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../app/auth-context';
import { Card } from '../../common/components/ui/Card';
import { Skeleton } from '../../common/components/ui/Skeleton';

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
      <div className="max-w-3xl mx-auto space-y-6 mt-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Time & Attendance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your daily check-in and check-out with GPS verification
          </p>
        </div>
      </div>

      {user?.shiftId && typeof user.shiftId === 'object' && (
        <Card variant="elevated" className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Assigned Shift: {user.shiftId.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Schedule</p>
              <p className="text-lg font-medium text-foreground">{user.shiftId.startTime} - {user.shiftId.endTime}</p>
            </div>
            <div className="bg-background rounded-xl p-4 border border-border shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Grace Period</p>
              <p className="text-lg font-medium text-foreground">{user.shiftId.gracePeriodMinutes} mins</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-center my-8">
        <CheckInButton currentStatus={currentStatus} onStatusChange={handleStatusChange} />
      </div>

      {todayRecord && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">Today's Activity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-muted border border-border">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check In</p>
                <p className="text-xl font-bold text-foreground">
                  {todayRecord.checkIn ? new Date(todayRecord.checkIn.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-muted border border-border">
              <div className="p-3 bg-secondary/10 rounded-full text-secondary-foreground">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check Out</p>
                <p className="text-xl font-bold text-foreground">
                  {todayRecord.checkOut ? new Date(todayRecord.checkOut.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Status
              </span>
              <span className="text-sm font-bold text-foreground capitalize px-3 py-1 bg-surface-muted rounded-full">
                {todayRecord.status}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hourglass className="w-4 h-4" /> Total Hours
              </span>
              <span className="text-sm font-bold text-foreground">
                {todayRecord.totalHours} hrs
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Hourglass className="w-4 h-4" /> Overtime
              </span>
              <span className="text-sm font-bold text-foreground">
                {todayRecord.overtime} hrs
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
