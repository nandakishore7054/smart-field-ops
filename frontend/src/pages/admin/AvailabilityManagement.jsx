import React, { useState, useEffect } from 'react';
import AdminLayout from '../../common/layouts/AdminLayout';
import AvailabilityGrid from '../../features/availability/AvailabilityGrid';
import LeaveRequestList from '../../features/availability/LeaveRequestList';
import api from '../../app/api';
import toast from 'react-hot-toast';
import { Card } from '../../common/components/ui/Card';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { CalendarDays, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AvailabilityManagement() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/users/workers');
      const workerList = res.data?.data?.workers;
      const validWorkers = Array.isArray(workerList) ? workerList : [];
      setWorkers(validWorkers);
      if (validWorkers.length > 0) {
        setSelectedWorkerId(validWorkers[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Premium Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-6 bg-gradient-to-r from-surface to-surface-muted/30 border-none shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Workforce Availability
                </h1>
              </div>
              <p className="text-muted-foreground ml-[52px]">Manage worker schedules and approve leave requests across the organization.</p>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border/50 shadow-sm flex items-center gap-4 min-w-[200px]">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Total Workers</p>
                <p className="text-2xl font-bold text-foreground">{loading ? '-' : workers.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Availability Grid Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-6">
          <Card className="p-6 shadow-sm border-border/50">
            <div className="flex items-center gap-2 mb-6">
              <CalendarDays className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Worker Schedules</h2>
            </div>
            
            {loading ? (
              <Skeleton className="h-12 w-full rounded-xl mb-6" />
            ) : (
              <div className="mb-6 bg-surface-muted/30 p-4 rounded-xl border border-border/50">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Select Worker to View/Edit Schedule
                </label>
                <div className="relative">
                  <select
                    className="w-full h-11 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-input shadow-sm appearance-none transition-all"
                    value={selectedWorkerId || ''}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                  >
                    {Array.isArray(workers) && workers.map(w => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            )}

            {selectedWorkerId && (
              <AvailabilityGrid workerId={selectedWorkerId} />
            )}
          </Card>
        </motion.div>
        
        {/* Leave Requests Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-6">
          <LeaveRequestList isAdmin={true} />
        </motion.div>
      </div>
    </div>
  );
}
