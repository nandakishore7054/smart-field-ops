import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../app/api';
import { socket } from '../../app/socket';
import TaskForm from '../../features/tasks/TaskForm';
import TaskList from '../../features/tasks/TaskList';
import AdminVerificationView from '../../features/submissions/AdminVerificationView';

export default function DispatchBoard() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedReviewTask, setSelectedReviewTask] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    function handleSubmissionCreated() {
      setRefreshToken((value) => value + 1);
    }
    
    function handleTaskCreated() {
      setRefreshToken((value) => value + 1);
    }

    socket.on('submission:created', handleSubmissionCreated);
    socket.on('task:created', handleTaskCreated);

    return () => {
      socket.off('submission:created', handleSubmissionCreated);
      socket.off('task:created', handleTaskCreated);
    };
  }, []);

  function handleSaved() {
    setEditingTask(null);
    setRefreshToken((value) => value + 1);
  }

  function handleEditTask(task) {
    setEditingTask(task);
  }

  function handleCancelEdit() {
    setEditingTask(null);
  }

  async function handleReviewTask(task) {
    setLoadingReview(true);
    setReviewError('');

    try {
      const response = await api.get(`/tasks/${task._id}`);
      setSelectedReviewTask(response.data?.data?.task || null);
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Unable to load verification details.');
    } finally {
      setLoadingReview(false);
    }
  }

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 p-2 md:p-6"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dispatch Board</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Create, update, and remove tasks from the admin workspace. Monitor real-time status and proofs of work.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <TaskForm editingTask={editingTask} onSaved={handleSaved} onCancel={handleCancelEdit} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <TaskList refreshToken={refreshToken} onEditTask={handleEditTask} onDeleted={handleSaved} onReviewTask={handleReviewTask} />
        </motion.div>
      </div>

      <AnimatePresence>
        {(reviewError || loadingReview || selectedReviewTask) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-border"
          >
            {reviewError ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium border border-destructive/20">
                {reviewError}
              </motion.div>
            ) : null}
            
            {loadingReview ? (
              <div className="rounded-2xl border border-border bg-surface p-8 text-center flex flex-col items-center justify-center">
                 <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
                 <p className="text-muted-foreground font-medium text-sm">Loading verification details...</p>
              </div>
            ) : selectedReviewTask ? (
              <AdminVerificationView task={selectedReviewTask} onVerified={setSelectedReviewTask} />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}