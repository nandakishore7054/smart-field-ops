import React, { useState } from 'react';
import AvailabilityGrid from '../../features/availability/AvailabilityGrid';
import LeaveRequestForm from '../../features/availability/LeaveRequestForm';
import LeaveRequestList from '../../features/availability/LeaveRequestList';
import { Card } from '../../common/components/ui/Card';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

export default function MyAvailability() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeaveSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
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
                  My Availability & Time Off
                </h1>
              </div>
              <p className="text-muted-foreground ml-[52px]">Manage your weekly schedule and submit leave requests.</p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-8">
          <AvailabilityGrid workerId="me" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-8">
          <LeaveRequestForm onSuccess={handleLeaveSuccess} />
          <LeaveRequestList refreshTrigger={refreshTrigger} isAdmin={false} />
        </motion.div>
      </div>
    </div>
  );
}
