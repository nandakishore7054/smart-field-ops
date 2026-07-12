import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Button } from '../../common/components/ui/Button';
import { Input } from '../../common/components/ui/Input';

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
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6 text-foreground">Request Time Off</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Type</label>
          <select
            name="type"
            value={formState.type}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal Leave</option>
            <option value="emergency">Emergency Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Start Date</label>
            <Input
              type="date"
              name="startDate"
              value={formState.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">End Date</label>
            <Input
              type="date"
              name="endDate"
              value={formState.endDate}
              onChange={handleChange}
              min={formState.startDate || new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">Reason (Optional)</label>
          <textarea
            name="reason"
            value={formState.reason}
            onChange={handleChange}
            rows={3}
            placeholder="Add any additional details..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          ></textarea>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={loading}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </Card>
  );
}
