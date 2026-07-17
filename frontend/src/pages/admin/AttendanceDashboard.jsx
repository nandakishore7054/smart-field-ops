import React, { useState, useEffect } from 'react';
import AttendanceLog from '../../features/attendance/AttendanceLog';
import ShiftManager from '../../features/attendance/ShiftManager';
import api from '../../app/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Card } from '../../common/components/ui/Card';
import { Input } from '../../common/components/ui/Input';
import { UserCheck, UserX, Clock, CalendarClock, Briefcase } from 'lucide-react';

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

  const presentCount = records.filter(r => r.status === 'present' || r.status === 'half-day' || r.status === 'on-leave').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-80px)] max-w-[1600px] mx-auto pb-10">
      
      {/* Premium Header */}
      <Card className="p-6 bg-gradient-to-r from-surface to-surface-muted/30 border-none shadow-sm relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <CalendarClock className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Attendance Management
              </h1>
            </div>
            <p className="text-muted-foreground ml-[52px]">Monitor workforce attendance, manage shifts, and track performance.</p>
          </div>
          
          <div className="flex bg-surface-muted/50 p-1.5 rounded-xl border border-border/50 shadow-inner">
            <button
              onClick={() => setActiveTab('log')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'log' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {activeTab === 'log' && (
                <motion.div layoutId="attendance-tab" className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50" />
              )}
              <span className="relative z-10 flex items-center gap-2"><UserCheck className="w-4 h-4" /> Daily Log</span>
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`relative px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === 'shifts' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {activeTab === 'shifts' && (
                <motion.div layoutId="attendance-tab" className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50" />
              )}
              <span className="relative z-10 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Shifts</span>
            </button>
          </div>
        </div>
      </Card>

      {activeTab === 'log' && (
        <div className="space-y-6 flex-1 flex flex-col">
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="p-6 flex items-center justify-between hover:shadow-md transition-all group relative overflow-hidden bg-success/5 border-success/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-success/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <p className="text-xs font-bold text-success dark:text-success-hover uppercase tracking-wider">Present</p>
                  <p className="mt-1 text-4xl font-black text-foreground">{presentCount}</p>
                </div>
                <div className="p-4 rounded-full bg-success/10 text-success dark:text-success-hover group-hover:scale-110 transition-transform">
                  <UserCheck className="w-7 h-7" />
                </div>
              </Card>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6 flex items-center justify-between hover:shadow-md transition-all group relative overflow-hidden bg-warning/5 border-warning/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-warning/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <p className="text-xs font-bold text-warning dark:text-warning-hover uppercase tracking-wider">Late</p>
                  <p className="mt-1 text-4xl font-black text-foreground">{lateCount}</p>
                </div>
                <div className="p-4 rounded-full bg-warning/10 text-warning dark:text-warning-hover group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7" />
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="p-6 flex items-center justify-between hover:shadow-md transition-all group relative overflow-hidden bg-destructive/5 border-destructive/20">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <p className="text-xs font-bold text-destructive dark:text-destructive-hover uppercase tracking-wider">Absent</p>
                  <p className="mt-1 text-4xl font-black text-foreground">{absentCount}</p>
                </div>
                <div className="p-4 rounded-full bg-destructive/10 text-destructive dark:text-destructive-hover group-hover:scale-110 transition-transform">
                  <UserX className="w-7 h-7" />
                </div>
              </Card>
            </motion.div>
          </div>

          <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-sm">
            <div className="p-4 border-b border-border/50 bg-surface-muted/30 sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-foreground">Daily Log Details</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Input 
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full sm:w-48 h-10"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto">
              <AttendanceLog records={records} loading={loading} />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'shifts' && (
        <ShiftManager />
      )}
    </div>
  );
}
