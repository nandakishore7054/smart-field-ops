import { useMemo, useState } from 'react';
import api from '../../app/api';
import { Card } from '../../common/components/ui/Card';
import { Button } from '../../common/components/ui/Button';
import { Badge } from '../../common/components/ui/Badge';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, MessageSquare, Send, FileX } from 'lucide-react';
import { motion } from 'framer-motion';

function mapsLinkFromLocation(submittedLocation) {
  if (!submittedLocation?.coordinates?.length) {
    return null;
  }

  const [longitude, latitude] = submittedLocation.coordinates;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export default function AdminVerificationView({ task, onVerified }) {
  const [isVerified, setIsVerified] = useState(true);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const submission = task?.submission || null;
  const mapsLink = useMemo(() => mapsLinkFromLocation(submission?.submittedLocation), [submission]);

  async function submitVerification() {
    if (!task?._id) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await api.patch(`/tasks/${task._id}/verify`, {
        isVerified,
        verificationFeedback,
      });

      setMessage(isVerified ? 'Task approved.' : 'Task rejected.');
      onVerified?.(response.data?.data?.task || null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save verification.');
    } finally {
      setLoading(false);
    }
  }

  if (!task) {
    return (
      <Card className="p-6 border-border/50 shadow-sm">
        <EmptyState
          icon={FileX}
          title="No Task Selected"
          description="Select a completed task to review submission details."
        />
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="p-5 sm:p-6 border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-500/50" />

        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400">Admin Verification</p>
            <h3 className="text-xl font-bold text-foreground">{task.title}</h3>
          </div>
        </div>

        {!submission ? (
          <div className="rounded-xl border border-border/50 bg-surface-muted/20 px-5 py-4 text-sm text-muted-foreground">
            No submission has been created for this task yet.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Evidence Images */}
            {submission.images?.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {submission.images.map((image) => (
                  <motion.img
                    key={image}
                    src={image}
                    alt="Proof evidence"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-48 w-full rounded-xl object-cover border border-border/50 shadow-sm"
                  />
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="rounded-xl border border-border/50 bg-surface-muted/20 p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Notes</p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{submission.notes || 'No notes provided.'}</p>
            </div>

            {/* Maps Link */}
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 bg-primary/5 border border-primary/20 px-4 py-3 rounded-xl transition"
              >
                <ExternalLink className="w-4 h-4" />
                Open location in Google Maps
              </a>
            )}

            {/* Verification Feedback */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Verification Feedback</label>
              <textarea
                rows={4}
                value={verificationFeedback}
                onChange={(event) => setVerificationFeedback(event.target.value)}
                className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-sm transition-all"
                placeholder="Add approval or rejection feedback"
              />
            </div>

            {/* Decision Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setIsVerified(true)}
                variant={isVerified ? 'default' : 'outline'}
                className={`gap-2 ${isVerified ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </Button>
              <Button
                type="button"
                onClick={() => setIsVerified(false)}
                variant={!isVerified ? 'destructive' : 'outline'}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                type="button"
                onClick={submitVerification}
                isLoading={loading}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Save Verification
              </Button>
            </div>

            {/* Status Message */}
            {message && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{message}</div>
              </motion.div>
            )}

            {/* Current Status */}
            <div className="rounded-xl border border-border/50 bg-surface-muted/20 px-5 py-3 text-sm text-muted-foreground flex items-center gap-2">
              Current task status:
              <Badge variant="outline" className="capitalize">{task.status}</Badge>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}