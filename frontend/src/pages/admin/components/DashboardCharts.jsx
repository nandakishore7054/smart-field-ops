import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Map } from 'lucide-react';
import api from '../../../app/api';
import { Card } from '../../../common/components/ui/Card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function DashboardCharts() {
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    async function fetchCharts(isAuto = false) {
      if (!isAuto) setLoading(true);
      try {
        const response = await api.get('/dashboard/charts');
        if (isMounted) {
          setChartsData(response.data?.data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load dashboard charts', err);
        if (isMounted && !isAuto) setError('Failed to load charts');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCharts();
    intervalId = setInterval(() => fetchCharts(true), 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading && !chartsData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="p-6 h-[400px]">
             <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-muted/30 rounded-xl animate-pulse" />
               <div className="h-5 w-40 bg-muted rounded animate-pulse" />
             </div>
             <div className="h-[260px] w-full bg-muted/20 rounded-lg animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (error && !chartsData) {
    return (
      <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!chartsData) return null;

  const { customerVisitsPerDay, attendanceDistribution, workerDistanceTravelled, distanceTrend } = chartsData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-muted-foreground font-medium mb-3 text-sm">{label || payload[0].name}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                 <span className="text-foreground font-medium text-sm">
                   {entry.name}: <span className="font-bold">{entry.value}</span>
                 </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6"
    >
      
      {/* 1. Customer Visits Per Day */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 h-[400px] flex flex-col bg-surface/50">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-foreground tracking-tight">Customer Visits</h3>
               <p className="text-sm text-muted-foreground">Visits per day over the last week</p>
             </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            {customerVisitsPerDay?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerVisitsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                  <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground text-xs" tickFormatter={(val) => val.split('-').slice(1).join('/')} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-xs" allowDecimals={false} tickMargin={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3', className: 'text-border' }} />
                  <Line type="monotone" dataKey="visits" name="Visits" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                 <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-sm">No visit data available</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* 2. Attendance Distribution */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 h-[400px] flex flex-col bg-surface/50">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center text-info">
                <PieChartIcon className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-foreground tracking-tight">Attendance Today</h3>
               <p className="text-sm text-muted-foreground">Breakdown of workforce status</p>
             </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            {attendanceDistribution?.some(a => a.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} iconType="circle" />
                  <Pie
                    data={attendanceDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1000}
                    stroke="none"
                  >
                    {attendanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                 <PieChartIcon className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-sm">No attendance records today</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* 3. Worker Distance Travelled */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 h-[400px] flex flex-col bg-surface/50">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
                <Map className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-foreground tracking-tight">Top Distances</h3>
               <p className="text-sm text-muted-foreground">Workers who travelled furthest today</p>
             </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            {workerDistanceTravelled?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workerDistanceTravelled} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                  <XAxis dataKey="workerName" stroke="currentColor" className="text-muted-foreground text-xs" tickFormatter={(val) => val.split(' ')[0]} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickFormatter={(val) => `${val}km`} tickMargin={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', className: 'text-muted/10' }} />
                  <Bar dataKey="distance" name="Distance (km)" fill="#d946ef" radius={[6, 6, 6, 6]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                 <Map className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-sm">No distance data today</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* 4. Distance Trend */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 h-[400px] flex flex-col bg-surface/50">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <TrendingUp className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-foreground tracking-tight">Distance Trend</h3>
               <p className="text-sm text-muted-foreground">Total organizational travel over 7 days</p>
             </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            {distanceTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={distanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/40" vertical={false} />
                  <XAxis dataKey="date" stroke="currentColor" className="text-muted-foreground text-xs" tickFormatter={(val) => val.split('-').slice(1).join('/')} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground text-xs" tickFormatter={(val) => `${val}km`} tickMargin={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3', className: 'text-border' }} />
                  <Area type="monotone" dataKey="distance" name="Total Distance (km)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDistance)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                 <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                 <p className="text-sm">No distance data for the last 7 days</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

    </motion.div>
  );
}
