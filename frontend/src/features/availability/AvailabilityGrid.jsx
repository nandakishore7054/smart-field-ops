import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';

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
      const endpoint = workerId === 'me' ? '/availability/me' : `/availability/${workerId}`;
      await api.put(endpoint, { availabilities: payload });
      toast.success('Availability saved successfully');
      fetchAvailability();
    } catch (error) {
      toast.error(error.response?.data?.error?.details?.time?.[0] || 'Failed to save availability');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Weekly Availability</h2>
      <div className="space-y-4">
        {grid.map((day) => (
          <div
            key={day.dayOfWeek}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border ${
              day.isAvailable
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <input
                type="checkbox"
                checked={day.isAvailable}
                onChange={() => handleToggleDay(day.dayOfWeek)}
                disabled={readOnly}
                className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 disabled:opacity-50"
              />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {DAYS_OF_WEEK[day.dayOfWeek]}
              </span>
            </div>

            {day.isAvailable ? (
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={day.startTime}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)}
                  disabled={readOnly}
                  className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="time"
                  value={day.endTime}
                  onChange={(e) => handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)}
                  disabled={readOnly}
                  className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                />
              </div>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 italic text-sm">Unavailable</span>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Availability
          </button>
        </div>
      )}
    </div>
  );
}
