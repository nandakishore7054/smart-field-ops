import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Input } from '../../common/components/ui/Input';
import { Button } from '../../common/components/ui/Button';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { CalendarDays, Save, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function AvailabilityGrid({ workerId = 'me', readOnly = false }) {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // default grid state
  const [grid, setGrid] = useState(
    DAYS_OF_WEEK.map((_, index) => ({
      dayOfWeek: index,
      isAvailable: false,
      startTime: '09:00',
      endTime: '17:00',
    }))
  );

  useEffect(() => {
    fetchAvailability();
  }, [workerId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const endpoint = workerId === 'me' ? '/availability/me' : `/availability/${workerId}`;
      const res = await api.get(endpoint);
      const data = res.data.data || [];
      setAvailabilities(data);

      const newGrid = DAYS_OF_WEEK.map((_, index) => {
        const existing = data.find((a) => a.dayOfWeek === index);
        if (existing) {
          return {
            dayOfWeek: index,
            isAvailable: true,
            startTime: existing.startTime,
            endTime: existing.endTime,
          };
        }
        return {
          dayOfWeek: index,
          isAvailable: false,
          startTime: '09:00',
          endTime: '17:00',
        };
      });
      setGrid(newGrid);
    } catch (error) {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayOfWeek) => {
    if (readOnly) return;
    setGrid((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isAvailable: !d.isAvailable } : d))
    );
  };

  const handleTimeChange = (dayOfWeek, field, value) => {
    if (readOnly) return;
    setGrid((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = async () => {
    const payload = grid
      .filter((d) => d.isAvailable)
      .map((d) => ({
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
        isRecurring: true,
      }));

    try {
      setSaving(true);
      const endpoint = workerId === 'me' ? '/availability/me' : `/availability/${workerId}`;
      await api.put(endpoint, { availabilities: payload });
      toast.success('Availability saved successfully');
      fetchAvailability();
    } catch (error) {
      toast.error(error.response?.data?.error?.details?.time?.[0] || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-border/50 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground">Weekly Schedule</h2>
        </div>
        <div className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border/50 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Weekly Schedule</h2>
        </div>
        <div className="space-y-3">
          {grid.map((day, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={day.dayOfWeek}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                day.isAvailable
                  ? 'border-primary shadow-[0_4px_12px_rgba(var(--primary-rgb),0.05)] bg-primary/5'
                  : 'border-border/50 bg-background hover:border-border hover:bg-surface-muted/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <button
                  type="button"
                  onClick={() => handleToggleDay(day.dayOfWeek)}
                  disabled={readOnly}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border ${
                    day.isAvailable 
                      ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]' 
                      : 'bg-background border-border text-transparent hover:border-primary/50'
                  } ${readOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <span className={`font-bold text-sm tracking-wide uppercase ${day.isAvailable ? 'text-primary' : 'text-muted-foreground'}`}>
                  {DAYS_OF_WEEK[day.dayOfWeek]}
                </span>
              </div>

              {day.isAvailable ? (
                <div className="flex items-center gap-2 bg-background p-1.5 rounded-lg border border-border/50 shadow-sm">
                  <div className="relative flex items-center">
                    <Clock className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                      disabled={readOnly}
                      className="h-8 w-28 pl-8 pr-2 rounded-md bg-transparent text-sm font-medium outline-none focus:ring-1 focus:ring-primary focus:bg-surface-muted/30 disabled:opacity-50"
                    />
                  </div>
                  <span className="text-muted-foreground text-xs font-bold uppercase">to</span>
                  <div className="relative flex items-center">
                    <Clock className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                      disabled={readOnly}
                      className="h-8 w-28 pl-8 pr-2 rounded-md bg-transparent text-sm font-medium outline-none focus:ring-1 focus:ring-primary focus:bg-surface-muted/30 disabled:opacity-50"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground/60 italic text-sm font-semibold px-4">Unavailable</span>
              )}
            </motion.div>
          ))}
        </div>

        {!readOnly && (
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleSave}
              isLoading={saving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Availability
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
