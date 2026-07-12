import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, WifiOff, CalendarCheck, CheckSquare, Building, Clock, Route, Activity } from 'lucide-react';
import api from '../../../app/api';
import { Card } from '../../../common/components/ui/Card';
import { AnimatedCounter } from '../../../common/components/ui/AnimatedCounter';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function DashboardKPIs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/dashboard/analytics');
      setData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard KPIs', err);
      setError('Failed to load KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Active Workers', 
      value: data?.workforce?.activeWorkers, 
      icon: Users,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
      trend: '+12%',
      trendUp: true,
    },
    { 
      label: 'Offline Workers', 
      value: data?.workforce?.offlineWorkers, 
      icon: WifiOff,
      colorClass: 'text-muted-foreground',
      bgClass: 'bg-muted/20',
      trend: '-2%',
      trendUp: false,
    },
    { 
      label: 'Present Today', 
      value: data?.attendance?.presentToday, 
      icon: CalendarCheck,
      colorClass: 'text-info',
      bgClass: 'bg-info/10',
      trend: '+5%',
      trendUp: true,
    },
    { 
      label: 'Completed Shifts', 
      value: data?.attendance?.completedShifts, 
      icon: CheckSquare,
      colorClass: 'text-success',
      bgClass: 'bg-success/10',
      trend: '+18%',
      trendUp: true,
    },
    { 
      label: 'Customer Visits', 
      value: data?.customer?.customerVisitsToday, 
      icon: Building,
      colorClass: 'text-warning',
      bgClass: 'bg-warning/10',
      trend: '+8%',
      trendUp: true,
    },
    { 
      label: 'Avg Visit Duration (m)', 
      value: data?.customer?.averageVisitDuration, 
      icon: Clock,
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-500/10',
      trend: '-1%',
      trendUp: true,
    },
    { 
      label: 'Total Distance (km)', 
      value: data?.productivity?.totalDistanceToday, 
      icon: Route,
      colorClass: 'text-fuchsia-500',
      bgClass: 'bg-fuchsia-500/10',
      trend: '+22%',
      trendUp: true,
    },
    { 
      label: 'Avg Working Hours', 
      value: data?.attendance?.averageWorkingHours, 
      icon: Activity,
      colorClass: 'text-violet-500',
      bgClass: 'bg-violet-500/10',
      trend: '+2%',
      trendUp: true,
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <motion.div key={index} variants={itemVariants}>
            <Card variant="interactive" className="relative overflow-hidden group p-5 border-border/50 bg-gradient-to-b from-surface to-surface/50">
              {/* Subtle background glow effect */}
              <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${kpi.bgClass}`} />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bgClass} ${kpi.colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {/* Simulated Trend Indicator */}
                {!loading && data && (
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${kpi.trendUp ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {kpi.trend}
                  </div>
                )}
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="text-sm font-medium text-muted-foreground">{kpi.label}</h3>
                <div className="h-9 flex items-center">
                  {loading && !data ? (
                    <div className="h-7 w-20 bg-muted rounded animate-pulse" />
                  ) : (
                    <div className="text-3xl font-bold tracking-tight text-foreground flex items-baseline gap-1">
                      <AnimatedCounter value={kpi.value ?? 0} />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
