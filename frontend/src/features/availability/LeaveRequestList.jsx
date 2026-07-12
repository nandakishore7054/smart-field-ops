import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Badge } from '../../common/components/ui/Badge';
import { Button } from '../../common/components/ui/Button';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { CalendarOff } from 'lucide-react';

export default function LeaveRequestList({ isAdmin = false, refreshTrigger = 0 }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [isAdmin, refreshTrigger]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/leave-requests' : '/leave-requests/me';
      const res = await api.get(endpoint);
      setRequests(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await api.patch(`/leave-requests/${id}/approve`, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={CalendarOff}
          title="No Leave Requests"
          description="You don't have any leave requests at the moment."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-surface-muted/50">
        <h3 className="text-lg font-bold text-foreground">
          {isAdmin ? 'Leave Requests' : 'My Leave Requests'}
        </h3>
      </div>
      <ul className="divide-y divide-border">
        {requests.map((req) => (
          <li key={req._id} className="p-6 hover:bg-surface-muted/30 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {isAdmin && req.workerId && (
                  <p className="text-sm font-bold text-foreground mb-1">
                    {req.workerId.name}
                  </p>
                )}
                <div className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="capitalize">{req.type} Leave</span>
                  <span className="text-muted-foreground">&bull;</span>
                  <span className="text-muted-foreground font-normal">
                    {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                  </span>
                </div>
                {req.reason && (
                  <p className="text-sm text-muted-foreground mt-2 italic bg-surface-muted px-3 py-2 rounded-lg border border-border/50">
                    "{req.reason}"
                  </p>
                )}
              </div>
              
              <div className="flex flex-col sm:items-end gap-3">
                <Badge
                  variant={
                    req.status === 'approved' ? 'success' :
                    req.status === 'rejected' ? 'error' :
                    'warning'
                  }
                  className="w-fit"
                >
                  {req.status}
                </Badge>

                {isAdmin && req.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(req._id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleApprove(req._id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
