import { useState, useEffect } from 'react';
import api from '../../app/api';
import DashboardKPIs from '../../pages/admin/components/DashboardKPIs';
import DashboardCharts from '../../pages/admin/components/DashboardCharts';

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Operations Overview</h2>
        <DashboardKPIs />
        <DashboardCharts />
      </div>
    </div>
  );
}
