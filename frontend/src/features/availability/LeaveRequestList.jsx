import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Badge } from '../../common/components/ui/Badge';
import { Button } from '../../common/components/ui/Button';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { CalendarOff, CheckCircle2, XCircle, Info, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <Card className="p-6 border-border/50 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-foreground">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">{isAdmin ? 'Leave Requests' : 'My Leave Requests'}</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-6 border-border/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-foreground">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-bold">{isAdmin ? 'Leave Requests' : 'My Leave Requests'}</h2>
        </div>
        <EmptyState
          icon={CalendarOff}
          title="No Leave Requests"
          description={isAdmin ? "No pending leave requests from workers." : "You don't have any leave requests at the moment."}
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <div className="px-6 py-5 border-b border-border/50 bg-surface-muted/30">
        <div className="flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">
            {isAdmin ? 'Leave Requests' : 'My Leave Requests'}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {requests.map((req, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={req._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-background hover:border-border hover:shadow-sm transition-all"
          >
            <div>
              {isAdmin && req.workerId && (
                <p className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                    {req.workerId.name.charAt(0).toUpperCase()}
                  </span>
                  {req.workerId.name}
                </p>
              )}
              <div className="text-sm font-medium text-foreground flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="uppercase text-[10px] tracking-wider px-2 py-0.5 bg-surface-muted/30">
                  {req.type} Leave
                </Badge>
                <span className="text-muted-foreground/50">&bull;</span>
                <span className="text-muted-foreground font-semibold font-mono">
                  {new Date(req.startDate).toLocaleDateString()}
                </span>
                <span className="text-muted-foreground/50 text-xs">to</span>
                <span className="text-muted-foreground font-semibold font-mono">
                  {new Date(req.endDate).toLocaleDateString()}
                </span>
              </div>
              {req.reason && (
                <div className="mt-3 bg-surface-muted/30 px-4 py-2.5 rounded-lg border border-border/50 flex gap-2 items-start">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground italic">
                    "{req.reason}"
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:items-end gap-3 shrink-0">
              <Badge
                variant={
                  req.status === 'approved' ? 'success' :
                  req.status === 'rejected' ? 'destructive' :
                  'warning'
                }
                className="uppercase tracking-wider text-[10px] px-3 py-1 font-bold"
              >
                {req.status}
              </Badge>

              {isAdmin && req.status === 'pending' && (
                <div className="flex space-x-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(req._id, 'approved')}
                    className="flex-1 sm:flex-none bg-success hover:bg-success-hover text-success-foreground gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleApprove(req._id, 'rejected')}
                    className="flex-1 sm:flex-none gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
