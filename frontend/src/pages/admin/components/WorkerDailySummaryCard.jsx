import React, { useEffect, useState } from 'react';
import api from '../../../app/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Map, MapPin, Gauge, Target, UserCheck, Timer, Briefcase } from 'lucide-react';
import { Card } from '../../../common/components/ui/Card';
import { Badge } from '../../../common/components/ui/Badge';

export default function WorkerDailySummaryCard({ workerId, date, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workerId) return;
    
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        let url = `/tracking/daily-summary/${workerId}`;
        if (date) {
          url += `?date=${date}`;
        }
        const response = await api.get(url);
        if (isMounted) {
          setSummary(response.data.data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch daily summary", err);
        if (isMounted) {
          setError(err.response?.data?.error || "Failed to load summary");
          setLoading(false);
        }
      }
    };

    fetchSummary();
    return () => { isMounted = false; };
  }, [workerId, date]);

  if (loading) {
    return (
      <div className="bg-surface border-t border-border/50 p-4 shrink-0 flex-1 flex flex-col justify-center">
        <div className="animate-pulse space-y-4 max-w-sm mx-auto w-full">
          <div className="h-6 bg-border/50 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-border/50 rounded-xl"></div>
            <div className="h-20 bg-border/50 rounded-xl"></div>
          </div>
          <div className="h-32 bg-border/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface border-t border-border/50 p-6 text-center flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-foreground mb-1">Summary Unavailable</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">{error}</p>
        <button onClick={onClose} className="bg-surface-muted hover:bg-border text-foreground px-4 py-2 rounded-xl font-medium transition-colors text-sm">
          Dismiss
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const {
    workerName, attendanceStatus, checkIn, checkOut,
    workingHours, distanceTravelled, customerVisits,
    customerTime, travelTime, performanceScore,
    performanceRating, isOnline, lastGPSUpdate,
    latitude, longitude
  } = summary;

  // Determine score color classes based on semantic variables
  let scoreClass = 'text-destructive';
  if (performanceScore >= 90) scoreClass = 'text-success';
  else if (performanceScore >= 75) scoreClass = 'text-info';
  else if (performanceScore >= 60) scoreClass = 'text-warning';

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-surface-muted/30 flex flex-col shrink-0 flex-1 overflow-hidden relative border-t border-border/50"
    >
      {/* Sticky Header */}
      <div className="p-4 bg-background border-b border-border/50 flex justify-between items-center shrink-0 z-10 shadow-sm relative">
        <div className="absolute right-2 top-2">
           <button onClick={onClose} className="p-1.5 text-muted-foreground hover:bg-surface-muted rounded-full transition-colors">
              <X className="w-4 h-4" />
           </button>
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            {workerName}
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success ring-2 ring-success/20' : 'bg-muted-foreground'}`} title={isOnline ? 'Online' : 'Offline'}></div>
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={attendanceStatus?.toLowerCase() === 'present' ? 'success' : attendanceStatus?.toLowerCase() === 'late' ? 'warning' : 'destructive'} className="text-[10px] px-2 uppercase">
              {attendanceStatus}
            </Badge>
          </div>
        </div>
        <div className="text-right flex flex-col items-end mr-6">
          <div className={`text-3xl font-black leading-none ${scoreClass}`}>{performanceScore}</div>
          <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-1">{performanceRating}</div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-surface-muted/20">
        
        {/* Attendance Timeline */}
        <div className="grid grid-cols-2 gap-3 relative">
          <div className="absolute top-1/2 left-8 right-8 h-px bg-border/50 -translate-y-1/2 hidden sm:block"></div>
          <div className="bg-background p-3 rounded-xl border border-border/50 shadow-sm relative z-10 hover:border-primary/30 transition-colors">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Check In
            </div>
            <div className="font-black text-foreground text-lg">{checkIn || '--:--'}</div>
          </div>
          <div className="bg-background p-3 rounded-xl border border-border/50 shadow-sm relative z-10 hover:border-primary/30 transition-colors">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span> Check Out
            </div>
            <div className="font-black text-foreground text-lg">{checkOut || '--:--'}</div>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 shadow-sm relative overflow-hidden group">
            <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-10 h-10 text-primary" />
            </div>
            <div className="text-xs text-primary font-bold tracking-wide mb-1 uppercase">Working Hours</div>
            <div className="font-black text-2xl text-foreground">{workingHours}</div>
          </div>
          <div className="bg-info/5 p-4 rounded-xl border border-info/10 shadow-sm relative overflow-hidden group">
            <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Map className="w-10 h-10 text-info" />
            </div>
            <div className="text-xs text-info font-bold tracking-wide mb-1 uppercase">Distance Travelled</div>
            <div className="font-black text-2xl text-foreground">{distanceTravelled}</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="bg-background rounded-xl border border-border/50 shadow-sm divide-y divide-border/50">
          <div className="p-3.5 flex justify-between items-center group hover:bg-surface-muted/30 transition-colors">
            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Customer Visits
            </div>
            <div className="font-bold text-foreground bg-surface px-2.5 py-0.5 rounded-lg border border-border">{customerVisits}</div>
          </div>
          <div className="p-3.5 flex justify-between items-center group hover:bg-surface-muted/30 transition-colors">
            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-success" />
              Customer Time
            </div>
            <div className="font-bold text-foreground">{customerTime}</div>
          </div>
          <div className="p-3.5 flex justify-between items-center group hover:bg-surface-muted/30 transition-colors">
            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <Timer className="w-4 h-4 text-warning" />
              Travel Time
            </div>
            <div className="font-bold text-foreground">{travelTime}</div>
          </div>
        </div>

        {/* Live Location Details */}
        <div className="bg-background p-3.5 rounded-xl border border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-border" />
          <div className="flex justify-between items-center mb-2.5 pl-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Latest Coordinates
            </span>
            <span className="text-[10px] font-mono text-muted-foreground bg-surface px-2 py-0.5 rounded shadow-inner border border-border">
              {lastGPSUpdate ? new Date(lastGPSUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </span>
          </div>
          <div className="font-mono text-xs text-foreground bg-surface p-2 rounded-lg border border-border text-center shadow-inner ml-2">
            {latitude && longitude ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'No GPS data available'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
