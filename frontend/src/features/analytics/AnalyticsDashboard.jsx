import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PlusCircle, UserPlus, Map, LayoutDashboard, CalendarRange } from 'lucide-react';
import api from '../../app/api';
import DashboardKPIs from '../../pages/admin/components/DashboardKPIs';
import DashboardCharts from '../../pages/admin/components/DashboardCharts';
import { Card } from '../../common/components/ui/Card';

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Operations Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time insights and workforce metrics for your organization.
          </p>
        </div>
        
        {/* Placeholder Date Range Picker (Visual Only) */}
        <div className="flex items-center gap-2 bg-surface border border-border px-3 py-2 rounded-lg text-sm text-muted-foreground shadow-sm">
          <CalendarRange className="w-4 h-4" />
          <span>Last 7 Days</span>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="interactive" as={Link} to="/admin/dashboard" className="p-4 flex items-center gap-3 bg-surface/50 hover:bg-surface">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Create Task</span>
          </Card>
          
          <Card variant="interactive" as={Link} to="/admin/workers" className="p-4 flex items-center gap-3 bg-surface/50 hover:bg-surface">
            <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Add Worker</span>
          </Card>

          <Card variant="interactive" as={Link} to="/admin/live-tracking" className="p-4 flex items-center gap-3 bg-surface/50 hover:bg-surface">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Live Tracking</span>
          </Card>

          <Card variant="interactive" as={Link} to="/admin/dispatch-board" className="p-4 flex items-center gap-3 bg-surface/50 hover:bg-surface">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground">Dispatch Board</span>
          </Card>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-6">
        <DashboardKPIs />
        <DashboardCharts />
      </div>
    </div>
  );
}
