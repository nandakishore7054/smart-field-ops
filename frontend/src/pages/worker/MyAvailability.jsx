import React, { useState } from 'react';
import AvailabilityGrid from '../../features/availability/AvailabilityGrid';
import LeaveRequestForm from '../../features/availability/LeaveRequestForm';
import LeaveRequestList from '../../features/availability/LeaveRequestList';

export default function MyAvailability() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeaveSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Availability & Time Off</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your weekly schedule and submit leave requests.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <AvailabilityGrid workerId="me" />
        </div>
        
        <div className="space-y-8">
          <LeaveRequestForm onSuccess={handleLeaveSuccess} />
          <LeaveRequestList refreshTrigger={refreshTrigger} isAdmin={false} />
        </div>
      </div>
    </div>
  );
}
