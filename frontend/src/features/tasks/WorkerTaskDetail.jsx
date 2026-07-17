import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../app/api';
import ProofSubmissionForm from '../submissions/ProofSubmissionForm';
import { Card } from '../../common/components/ui/Card';
import { Button } from '../../common/components/ui/Button';
import { Badge } from '../../common/components/ui/Badge';
import { MapPin, Clock, FileText, ArrowLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';

function formatDate(value) {
  if (!value) {
    return 'No deadline';
  }
  return new Date(value).toLocaleString();
}

function getProgressPercentage(status) {
  switch (status) {
    case 'assigned': return 25;
    case 'in-progress': return 50;
    case 'completed': return 75;
    case 'verified': return 100;
    case 'rejected': return 25; // Send them back
    default: return 0;
  }
}

const statusVariant = (status) => {
  switch (status) {
    case 'verified': return 'success';
    case 'completed': return 'info';
    case 'in-progress': return 'warning';
    case 'rejected': return 'destructive';
    default: return 'outline';
  }
};

export default function WorkerTaskDetail({ task, onStatusUpdated }) {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function startTask() {
    setSubmitting(true);
    setMessage('');

    try {
      const response = await api.patch(`/tasks/${task._id}/status`, { status: 'in-progress' });
      onStatusUpdated?.(response.data?.data?.task || null);
      setMessage('Task started successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to start the task.');
    } finally {
      setSubmitting(false);
    }
  }

  const progress = getProgressPercentage(task.status);
  
  const getGoogleMapsLink = () => {
    if (task.locationCoordinates && task.locationCoordinates.coordinates) {
      const [lng, lat] = task.locationCoordinates.coordinates;
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    if (task.locationAddress) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.locationAddress)}`;
    }
    return null;
  };
  
  const mapLink = getGoogleMapsLink();

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="p-5 sm:p-6 border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-primary mb-2">Task Detail</p>
            <h2 className="text-2xl font-bold text-foreground">{task.title}</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{task.locationAddress || 'No location specified'}</span>
              {mapLink && (
                <a 
                  href={mapLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1 bg-primary/5 px-2.5 py-1 rounded-lg transition font-medium text-xs"
                >
                  <MapPin className="w-3 h-3" />
                  Open in Maps
                </a>
              )}
            </div>
          </div>
          <Badge variant={statusVariant(task.status)} className="capitalize text-xs px-3 py-1 font-bold tracking-wider uppercase">
            {task.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-surface-muted/30 p-4 rounded-xl border border-border/50">
          <div className="flex justify-between text-[10px] mb-2 text-muted-foreground uppercase tracking-wider font-bold">
            <span>Assigned</span>
            <span>In Progress</span>
            <span>Completed</span>
            <span>Verified</span>
          </div>
          <div className="w-full bg-border/30 rounded-full h-2.5">
            <motion.div 
              className="bg-primary h-2.5 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-surface-muted/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Description</p>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{task.description || 'No description provided.'}</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-surface-muted/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Deadline</p>
            </div>
            <p className="text-sm text-foreground font-mono">{formatDate(task.deadline)}</p>
          </div>
        </div>

        {/* Status Message */}
        {message ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
            <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success dark:text-success-hover font-medium">{message}</div>
          </motion.div>
        ) : null}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          {task.status === 'assigned' ? (
            <Button
              onClick={startTask}
              isLoading={submitting}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Start Task
            </Button>
          ) : null}
          <Button as={Link} to="/worker/dashboard" variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to tasks
          </Button>
        </div>

        {/* Proof Submission */}
        <div className="mt-6">
          <ProofSubmissionForm task={task} onSubmitted={onStatusUpdated} />
        </div>
      </Card>
    </motion.div>
  );
}