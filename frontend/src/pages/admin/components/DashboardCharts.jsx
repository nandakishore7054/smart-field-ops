import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../../../app/api';

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
    intervalId = setInterval(() => fetchCharts(true), 30000); // 30 seconds auto refresh

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading && !chartsData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm h-[350px] animate-pulse">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-6"></div>
            <div className="h-[250px] w-full bg-slate-100 dark:bg-slate-800/50 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error && !chartsData) {
    return (
      <div className="mt-6 rounded-2xl border border-rose-500/50 bg-rose-500/10 p-4 text-rose-400">
        <p>{error}</p>
      </div>
    );
  }

  if (!chartsData) return null;

  const { customerVisitsPerDay, attendanceDistribution, workerDistanceTravelled, distanceTrend } = chartsData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-slate-300 font-medium mb-1">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || entry.fill }} className="text-sm font-bold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* 1. Customer Visits Per Day */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-white">Customer Visits Per Day</h3>
        <div className="h-[300px] w-full">
          {customerVisitsPerDay?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerVisitsPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="visits" name="Visits" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">No visit data</div>
          )}
        </div>
      </div>

      {/* 2. Attendance Distribution */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-white">Attendance (Today)</h3>
        <div className="h-[300px] w-full">
          {attendanceDistribution?.some(a => a.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Pie
                  data={attendanceDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {attendanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">No attendance records today</div>
          )}
        </div>
      </div>

      {/* 3. Worker Distance Travelled */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-white">Top 5 Distances (Today)</h3>
        <div className="h-[300px] w-full">
          {workerDistanceTravelled?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerDistanceTravelled} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="workerName" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.split(' ')[0]} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}km`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="distance" name="Distance (km)" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">No distance data today</div>
          )}
        </div>
      </div>

      {/* 4. Distance Trend */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-white">Distance Trend</h3>
        <div className="h-[300px] w-full">
          {distanceTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val}km`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="distance" name="Total Distance (km)" stroke="#10b981" fillOpacity={1} fill="url(#colorDistance)" animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">No distance data for the last 7 days</div>
          )}
        </div>
      </div>

    </div>
  );
}
