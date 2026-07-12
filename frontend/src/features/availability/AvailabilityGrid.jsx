import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Input } from '../../common/components/ui/Input';
import { Button } from '../../common/components/ui/Button';
import { Skeleton } from '../../common/components/ui/Skeleton';

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
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6 text-foreground">Weekly Schedule</h2>
      <div className="space-y-4">
        {grid.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors ${
              day.isAvailable
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-surface-muted'
            }`}
          >
            <div className="flex items-center space-x-4 mb-3 sm:mb-0">
              <label className="relative flex items-center p-3 rounded-full cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.isAvailable}
                  onChange={() => handleToggleDay(day.dayOfWeek)}
                  disabled={readOnly}
                  className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-border transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-primary before:opacity-0 before:transition-opacity checked:border-primary checked:bg-primary checked:before:bg-primary hover:before:opacity-10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
              </label>
              <span className={`font-semibold ${day.isAvailable ? 'text-primary' : 'text-muted-foreground'}`}>
                {DAYS_OF_WEEK[day.dayOfWeek]}
              </span>
            </div>

            {day.isAvailable ? (
              <div className="flex items-center space-x-3">
                <Input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                  disabled={readOnly}
                  className="w-32 py-1.5"
                />
                <span className="text-muted-foreground text-sm font-medium">to</span>
                <Input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                  disabled={readOnly}
                  className="w-32 py-1.5"
                />
              </div>
            ) : (
              <span className="text-muted-foreground/60 italic text-sm font-medium px-4">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSave}
            isLoading={saving}
          >
            Save Availability
          </Button>
        </div>
      )}
    </Card>
  );
}
