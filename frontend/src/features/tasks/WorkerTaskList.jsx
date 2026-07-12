import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ListTodo, ChevronRight } from 'lucide-react';
import { Card } from '../../common/components/ui/Card';
import { Badge } from '../../common/components/ui/Badge';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { EmptyState } from '../../common/components/ui/EmptyState';

function formatDate(value) {
  if (!value) return 'No deadline';
  return new Date(value).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

function getPriorityVariant(priority) {
  switch (priority?.toLowerCase()) {
    case 'urgent': return 'error';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'default';
    default: return 'default';
  }
}

function getStatusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'verified': return 'success';
    case 'completed': return 'success';
    case 'in-progress': return 'info';
    case 'assigned': return 'warning';
    case 'unassigned': return 'error';
    default: return 'default';
  }
}

export default function WorkerTaskList({ tasks, loading, error }) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-5 h-48 bg-surface/50 border-border/50">
            <div className="flex justify-between items-start mb-4">
               <Skeleton className="h-6 w-1/2" />
               <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
            <div className="flex justify-between items-center mt-auto">
               <Skeleton className="h-4 w-1/3" />
               <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-destructive/20 bg-destructive/10 px-6 py-4 text-sm font-medium text-destructive">
        {error}
      </motion.div>
    );
  }

  if (!tasks.length) {
    return (
      <Card className="p-8">
         <EmptyState 
           icon={ListTodo} 
           title="You're all caught up!" 
           description="There are no tasks assigned to you in this category at the moment." 
         />
      </Card>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {tasks.map((task) => (
        <motion.div variants={item} key={task._id} className="h-full">
          <Card 
            as={Link}
            to={`/worker/tasks/${task._id}`}
            variant="interactive"
            className="flex flex-col h-full p-5 bg-surface/50 group"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <Badge variant={getPriorityVariant(task.priority)} className="mb-2 text-[10px] px-2 py-0 uppercase">
                  {task.priority} Priority
                </Badge>
                <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {task.title}
                </h3>
              </div>
              <Badge variant={getStatusVariant(task.status)} className="capitalize shrink-0">
                {task.status.replace('-', ' ')}
              </Badge>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground mb-4 flex-grow">
              {task.description || 'No description provided for this task.'}
            </p>

            <div className="space-y-2 text-sm text-muted-foreground bg-muted/20 p-3 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-primary" />
                <span className="truncate">{task.locationAddress || 'No location specified'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 shrink-0 text-primary" />
                <span>{formatDate(task.deadline)}</span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between font-medium text-sm text-primary">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}