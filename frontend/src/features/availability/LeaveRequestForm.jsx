import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Button } from '../../common/components/ui/Button';
import { Input } from '../../common/components/ui/Input';
import { CalendarRange, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeaveRequestForm({ onSuccess }) {

  const [loading, setLoading] = useState(false);

  // use proper useState setup
  const [formState, setFormState] = useState({
    type: 'vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formState.startDate || !formState.endDate) {
      toast.error('Start and End dates are required.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/leave-requests', formState);
      toast.success('Leave request submitted successfully');
      setFormState({ type: 'vacation', startDate: '', endDate: '', reason: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error?.details?.startDate?.[0] || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 border-border/50 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
      
      <div className="flex items-center gap-2 mb-6 text-foreground">
        <CalendarRange className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Request Time Off</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Type of Leave</label>
          <div className="relative">
            <select
              name="type"
              value={formState.type}
              onChange={handleChange}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-input shadow-sm appearance-none transition-all"
            >
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Start Date</label>
            <Input
              type="date"
              name="startDate"
              value={formState.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">End Date</label>
            <Input
              type="date"
              name="endDate"
              value={formState.endDate}
              onChange={handleChange}
              min={formState.startDate || new Date().toISOString().split('T')[0]}
              required
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Reason (Optional)</label>
          <textarea
            name="reason"
            value={formState.reason}
            onChange={handleChange}
            rows={3}
            placeholder="Add any additional details..."
            className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
          ></textarea>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            isLoading={loading}
            className="w-full gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Request
          </Button>
        </div>
      </form>
    </Card>
  );
}
