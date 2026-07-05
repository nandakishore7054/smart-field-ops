import React, { useState } from 'react';
import WorkerLayout from '../../common/layouts/WorkerLayout';
import AvailabilityGrid from '../../features/availability/AvailabilityGrid';
import LeaveRequestForm from '../../features/availability/LeaveRequestForm';
import LeaveRequestList from '../../features/availability/LeaveRequestList';

export default function MyAvailability() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeaveSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Availability & Time Off</h1>
      
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
