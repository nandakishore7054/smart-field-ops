import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Edit2, Eye, Trash2, Calendar, MapPin, ListTodo 
} from 'lucide-react';
import api from '../../app/api';
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

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="border-b border-border/50">
          <td className="px-4 py-4"><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></td>
          <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
          <td className="px-4 py-4"><Skeleton className="h-5 w-32" /></td>
          <td className="px-4 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
          <td className="px-4 py-4"><Skeleton className="h-5 w-28" /></td>
          <td className="px-4 py-4"><Skeleton className="h-8 w-24" /></td>
        </tr>
      ))}
    </>
  );
}

export default function TaskList({ refreshToken, onEditTask, onDeleted, onReviewTask }) {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [serverMessage, setServerMessage] = useState('');

  async function loadTasks(nextPage = pagination.page, nextStatus = statusFilter, nextPriority = priorityFilter, nextSearch = search) {
    setLoading(true);
    setServerMessage('');

    try {
      const response = await api.get('/tasks', {
        params: {
          page: nextPage,
          limit: pagination.limit,
          status: nextStatus || undefined,
          priority: nextPriority || undefined,
          search: nextSearch || undefined,
        },
      });

      const payload = response.data?.data || {};
      setTasks(payload.tasks || []);
      setPagination({
        ...payload.pagination,
        limit: payload.pagination?.limit || pagination.limit,
      });
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks(1, statusFilter, priorityFilter, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken, statusFilter, priorityFilter, search]);

  async function handleDelete(taskId) {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);
      onDeleted?.();
      await loadTasks(pagination.page, statusFilter);
    } catch (error) {
      setServerMessage(error.response?.data?.message || 'Unable to delete the task.');
    }
  }

  return (
    <Card className="flex flex-col h-full bg-surface/50 border-border/50 shadow-sm overflow-hidden">
      {/* Header & Filters */}
      <div className="p-5 sm:p-6 border-b border-border/50 bg-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-foreground">Task Directory</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage and track all organizational tasks.</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-full border border-border">
             <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
             <span className="text-xs font-semibold text-muted-foreground">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
          </div>
          
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none"
            >
              <option value="">All Statuses</option>
              {['unassigned', 'assigned', 'in-progress', 'completed', 'verified'].map((status) => (
                <option key={status} value={status} className="capitalize">{status.replace('-', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter className="w-4 h-4 text-muted-foreground" />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none"
            >
              <option value="">All Priorities</option>
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {serverMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-3 bg-destructive/10 border-b border-destructive/20 text-sm font-medium text-destructive"
          >
            {serverMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto flex-1">
        <table className="min-w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-muted/30 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            <tr>
              <th className="px-6 py-4">Title & Location</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Assignee</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Deadline</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <LoadingRows />
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <tr key={task._id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground truncate max-w-[200px]">{task.title}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground truncate max-w-[200px]">
                      <MapPin className="w-3 h-3" />
                      <span>{task.locationAddress || 'No location'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getPriorityVariant(task.priority)} className="capitalize px-2.5 py-0.5">
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                         {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : '?'}
                       </div>
                       <span className="text-foreground">{task.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusVariant(task.status)} className="capitalize px-2.5 py-0.5">
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(task.deadline)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTask?.(task)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onReviewTask?.(task)}
                        className="p-2 text-muted-foreground hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                        title="Review Proof of Work"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8">
                  <EmptyState 
                    icon={ListTodo} 
                    title="No tasks found" 
                    description="No tasks match your current filters. Try adjusting your search criteria." 
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid View */}
      <div className="grid gap-4 p-4 lg:hidden bg-muted/10">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 bg-surface rounded-2xl border border-border p-4">
               <Skeleton className="h-5 w-2/3 mb-2" />
               <Skeleton className="h-4 w-1/3 mb-4" />
               <div className="flex gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-16" /></div>
            </div>
          ))
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <motion.div 
              key={task._id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{task.locationAddress || 'No location'}</span>
                  </div>
                </div>
                <Badge variant={getStatusVariant(task.status)} className="capitalize text-[10px] py-0">{task.status}</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="bg-muted/30 p-2 rounded-lg">
                  <span className="block text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">Priority</span>
                  <Badge variant={getPriorityVariant(task.priority)} className="capitalize bg-transparent p-0 shadow-none border-none text-xs">{task.priority}</Badge>
                </div>
                <div className="bg-muted/30 p-2 rounded-lg truncate">
                  <span className="block text-muted-foreground mb-1 uppercase tracking-wider text-[10px]">Assignee</span>
                  <span className="font-medium text-foreground">{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
                <div className="col-span-2 bg-muted/30 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Deadline</span>
                  <span className="font-medium text-foreground">{formatDate(task.deadline)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 border-t border-border/50 pt-3">
                <button
                  onClick={() => onEditTask?.(task)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-2 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => onReviewTask?.(task)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-success/30 bg-success/10 py-2 text-xs font-medium text-success hover:bg-success/20 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Review
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="w-10 flex items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-8">
            <EmptyState 
              icon={ListTodo} 
              title="No tasks found" 
              description="Adjust filters or clear search to see more tasks." 
            />
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border/50 bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Showing page <span className="font-medium text-foreground">{pagination.page}</span> of <span className="font-medium text-foreground">{pagination.totalPages}</span> · <span className="font-medium text-foreground">{pagination.total}</span> total
        </p>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => loadTasks(Math.max(1, pagination.page - 1), statusFilter)}
            disabled={!pagination.hasPrevPage}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => loadTasks(pagination.page + 1, statusFilter)}
            disabled={!pagination.hasNextPage}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
}