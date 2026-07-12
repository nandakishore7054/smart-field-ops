import { useState, useEffect, useMemo } from 'react';
import api from '../../app/api';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Shield, ShieldAlert, Activity, Power, PowerOff, UserCircle, 
  ChevronLeft, ChevronRight, RefreshCcw, MoreVertical, X
} from 'lucide-react';
import { Card } from '../../common/components/ui/Card';
import { Input } from '../../common/components/ui/Input';
import { Button } from '../../common/components/ui/Button';
import { Badge } from '../../common/components/ui/Badge';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { EmptyState } from '../../common/components/ui/EmptyState';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
      });
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data?.data?.users || []);
      setTotalPages(response.data?.data?.totalPages || 1);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role', err);
      alert('Failed to update role');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  // Compute stats based on CURRENT page since it's paginated on backend
  const activeCount = users.filter(u => u.status === 'active').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const workerCount = users.filter(u => u.role === 'worker').length;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-80px)] max-w-[1600px] mx-auto pb-10">
      
      {/* Premium Header */}
      <Card className="p-6 bg-gradient-to-r from-surface to-surface-muted/30 border-none shadow-sm relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Users className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                User Management
              </h1>
            </div>
            <p className="text-muted-foreground ml-[52px]">Manage all users, roles, and access across the organization</p>
          </div>
          <Button onClick={() => fetchUsers()} variant="outline" className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </Card>

      {/* Statistics Cards (Current Page) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Page Total', value: users.length, icon: Users, colorClass: 'text-indigo-600 dark:text-indigo-400', bgClass: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Active (Page)', value: activeCount, icon: Activity, colorClass: 'text-emerald-600 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Admins (Page)', value: adminCount, icon: Shield, colorClass: 'text-purple-600 dark:text-purple-400', bgClass: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Workers (Page)', value: workerCount, icon: UserCircle, colorClass: 'text-sky-600 dark:text-sky-400', bgClass: 'bg-sky-50 dark:bg-sky-900/20' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow group overflow-hidden relative">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-transparent to-${stat.bgClass.split('-')[1]}/5 pointer-events-none`} />
              <div className={`p-3.5 rounded-xl ${stat.bgClass} ${stat.colorClass} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-sm">
        
        {/* Sticky Filter Toolbar */}
        <div className="p-4 border-b border-border/50 bg-surface-muted/30 sticky top-0 z-20 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-10 w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <select 
                value={roleFilter} 
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                className="w-full flex h-10 rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            
            <div className="relative flex-1 sm:w-40">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <select 
                value={statusFilter} 
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full flex h-10 rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {(search || roleFilter || statusFilter) && (
              <Button variant="ghost" size="icon" onClick={clearFilters} className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive" title="Clear Filters">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-x-auto relative">
          {loading && users.length === 0 ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 p-4 border border-border/50 rounded-xl bg-background">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-lg hidden sm:block" />
                  <Skeleton className="h-8 w-24 rounded-lg hidden md:block" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                {error}
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Users}
                title="No Users Found"
                description="Try adjusting your search or filter criteria."
              />
              <div className="flex justify-center mt-4">
                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-surface-muted/30 text-xs uppercase text-muted-foreground font-semibold sticky top-0 z-10 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((u, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={u._id} 
                    className="hover:bg-surface-muted/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-border shadow-sm group-hover:ring-2 ring-primary/20 transition-all" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shadow-sm group-hover:ring-2 ring-primary/20 transition-all">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group/select inline-block">
                        <select 
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="appearance-none rounded-lg border border-transparent hover:border-border hover:bg-background bg-transparent px-3 py-1.5 pr-8 text-sm font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer capitalize"
                        >
                          <option value="admin">Admin</option>
                          <option value="dispatcher">Dispatcher</option>
                          <option value="worker">Worker</option>
                        </select>
                        <ChevronRight className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-0 group-hover/select:opacity-100 transition-opacity rotate-90" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.status === 'active' ? 'success' : 'destructive'} className="uppercase text-[10px] tracking-wider px-2.5 py-1">
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant={u.status === 'active' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleStatusChange(u._id, u.status === 'active' ? 'inactive' : 'active')}
                        className={`gap-2 ${u.status === 'active' ? 'hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                      >
                        {u.status === 'active' ? (
                          <><PowerOff className="w-3.5 h-3.5" /> Deactivate</>
                        ) : (
                          <><Power className="w-3.5 h-3.5" /> Activate</>
                        )}
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border/50 bg-surface-muted/30 flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium hidden sm:block">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button 
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>
              <span className="text-sm text-foreground font-medium sm:hidden">
                {page} / {totalPages}
              </span>
              <Button 
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
