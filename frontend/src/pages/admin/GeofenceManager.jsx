import React, { useEffect, useState, useMemo } from 'react';
import api from '../../app/api';
import LiveMap from '../../features/tracking/LiveMap';
import GeofenceEditor from '../../features/tracking/GeofenceEditor';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Card } from '../../common/components/ui/Card';
import { Input } from '../../common/components/ui/Input';
import { Button } from '../../common/components/ui/Button';
import { Badge } from '../../common/components/ui/Badge';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { Map, Layers, Building2, Briefcase, Trash2, Search, Filter, X, Info } from 'lucide-react';

const INDIA_CENTER = [22.5937, 78.9629];
const DEFAULT_ZOOM = 5;

export default function GeofenceManager() {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState(null);
  
  // Sidebar filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Creation State
  const [pendingGeofence, setPendingGeofence] = useState(null);

  const fetchGeofences = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/geofences');
      setGeofences(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load geofences');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeofences();
  }, []);

  const handleGeofenceCreated = (payload) => {
    setPendingGeofence({
      name: '',
      category: 'general',
      isActive: true,
      ...payload
    });
    setSelectedGeofenceId(null);
  };

  const handleGeofenceEdited = async (updates) => {
    let successCount = 0;
    for (const update of updates) {
      try {
        const gf = geofences.find(g => g._id === update.id);
        if (!gf) continue;
        
        await api.put(`/geofences/${update.id}`, { 
          name: gf.name,
          type: gf.type,
          category: gf.category,
          isActive: gf.isActive,
          boundary: update.boundary 
        });
        successCount++;
      } catch (err) {
        toast.error(`Failed to update geofence ${update.id}`);
      }
    }
    if (successCount > 0) {
      toast.success(`Updated ${successCount} geofence(s)`);
      fetchGeofences(true);
    }
  };

  const handleGeofenceDeleted = async (deletedIds) => {
    if (!window.confirm(`Are you sure you want to delete ${deletedIds.length} geofence(s)?`)) {
      fetchGeofences(true); // reload map to restore them
      return;
    }
    
    let successCount = 0;
    for (const id of deletedIds) {
      try {
        await api.delete(`/geofences/${id}`);
        successCount++;
      } catch (err) {
        toast.error(`Failed to delete geofence ${id}`);
      }
    }
    if (successCount > 0) {
      toast.success(`Deleted ${successCount} geofence(s)`);
      fetchGeofences(true);
      if (deletedIds.includes(selectedGeofenceId)) {
        setSelectedGeofenceId(null);
      }
    }
  };

  const handleSavePending = async (e) => {
    e.preventDefault();
    if (!pendingGeofence.name) {
      return toast.error('Name is required');
    }
    try {
      const payload = { ...pendingGeofence, category: pendingGeofence.category || 'general' };
      const res = await api.post('/geofences', payload);
      toast.success('Geofence created successfully');
      setPendingGeofence(null);
      fetchGeofences(true);
      setSelectedGeofenceId(res.data.data._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create geofence');
    }
  };

  const handleUpdateStatus = async (id, isActive) => {
    try {
      const gf = geofences.find(g => g._id === id);
      if (!gf) return;

      await api.put(`/geofences/${id}`, { 
        name: gf.name,
        type: gf.type,
        category: gf.category,
        boundary: gf.boundary,
        isActive 
      });
      toast.success(`Geofence ${isActive ? 'activated' : 'deactivated'}`);
      fetchGeofences(true);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredGeofences = useMemo(() => {
    return geofences.filter(gf => {
      const matchesSearch = (gf.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' ? true :
                            statusFilter === 'active' ? gf.isActive : !gf.isActive;
      return matchesSearch && matchesStatus;
    });
  }, [geofences, searchQuery, statusFilter]);

  const selectedGeofence = geofences.find(g => g._id === selectedGeofenceId);

  // Statistics
  const totalGeofences = geofences.length;
  const activeGeofences = geofences.filter(g => g.isActive).length;
  const customerGeofences = geofences.filter(g => g.category === 'customer').length;
  const officeGeofences = geofences.filter(g => g.category === 'office').length;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-80px)] max-w-[1600px] mx-auto pb-10">
      
      {/* Premium Header */}
      <Card className="p-6 bg-gradient-to-r from-surface to-surface-muted/30 border-none shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Map className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Geofence Management
              </h1>
            </div>
            <p className="text-muted-foreground ml-[52px]">Draw and manage operational boundaries, offices, and customer locations.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-background rounded-xl p-3 border border-border/50 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Total</p>
              <p className="text-xl font-bold text-foreground">{totalGeofences}</p>
            </div>
            <div className="bg-background rounded-xl p-3 border border-border/50 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Active</p>
              <p className="text-xl font-bold text-foreground">{activeGeofences}</p>
            </div>
            <div className="bg-background rounded-xl p-3 border border-border/50 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-sky-600 dark:text-sky-400 mb-1">Customer</p>
              <p className="text-xl font-bold text-foreground">{customerGeofences}</p>
            </div>
            <div className="bg-background rounded-xl p-3 border border-border/50 shadow-sm flex flex-col items-center justify-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Office</p>
              <p className="text-xl font-bold text-foreground">{officeGeofences}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[700px]">
        {/* Sidebar */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0 h-full">
          
          {/* Create/Edit Panel */}
          {pendingGeofence ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/50 shadow-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                <div className="p-4 bg-primary/5 border-b border-border/50 flex justify-between items-center">
                  <h3 className="font-bold text-primary flex items-center gap-2"><Map className="w-4 h-4" /> Save New Geofence</h3>
                  <button onClick={() => setPendingGeofence(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSavePending} className="p-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Geofence Name</label>
                    <Input 
                      type="text"
                      required
                      autoFocus
                      value={pendingGeofence.name}
                      onChange={e => setPendingGeofence({...pendingGeofence, name: e.target.value})}
                      placeholder="e.g. North Zone Depot"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Category</label>
                    <div className="relative">
                      <select 
                        value={pendingGeofence.category || 'general'}
                        onChange={e => setPendingGeofence({...pendingGeofence, category: e.target.value})}
                        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-input shadow-sm appearance-none transition-all"
                      >
                        <option value="general">General (Boundary)</option>
                        <option value="office">Office (Auto Check-In)</option>
                        <option value="customer">Customer (Visit Tracking)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-surface-muted/30 rounded-xl border border-border/50">
                    <input 
                      type="checkbox"
                      id="isActiveNew"
                      checked={pendingGeofence.isActive}
                      onChange={e => setPendingGeofence({...pendingGeofence, isActive: e.target.checked})}
                      className="w-4 h-4 rounded text-primary focus:ring-primary bg-background border-input"
                    />
                    <label htmlFor="isActiveNew" className="text-sm font-medium text-foreground cursor-pointer">Active immediately</label>
                  </div>
                  <Button type="submit" className="w-full">
                    Save Geofence
                  </Button>
                </form>
              </Card>
            </motion.div>
          ) : selectedGeofence ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 flex justify-between items-center bg-surface-muted/30">
                  <h3 className="font-bold text-foreground flex items-center gap-2"><Info className="w-4 h-4" /> Geofence Details</h3>
                  <button onClick={() => setSelectedGeofenceId(null)} className="text-muted-foreground hover:text-foreground transition-colors p-1"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">{selectedGeofence.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={selectedGeofence.isActive ? 'success' : 'secondary'} className="uppercase text-[10px] tracking-wider px-2 py-0.5">
                        {selectedGeofence.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="uppercase text-[10px] tracking-wider px-2 py-0.5 flex items-center gap-1 bg-surface-muted/30">
                        {selectedGeofence.category === 'office' ? <Building2 className="w-3 h-3" /> : selectedGeofence.category === 'customer' ? <Briefcase className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                        {selectedGeofence.category || 'General'}
                      </Badge>
                      <Badge variant="outline" className="uppercase text-[10px] tracking-wider px-2 py-0.5 bg-surface-muted/30">
                        {selectedGeofence.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-surface-muted/30 p-4 rounded-xl border border-border/50">
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Vertices</label>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedGeofence.boundary?.coordinates?.[0]?.length || 0} points
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Radius/Address</label>
                      <p className="text-sm font-semibold text-muted-foreground">N/A (Polygon)</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-border/50">
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Created Date</label>
                      <p className="text-sm font-semibold text-foreground">{new Date(selectedGeofence.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Button 
                      variant={selectedGeofence.isActive ? 'outline' : 'secondary'}
                      className="flex-1"
                      onClick={() => handleUpdateStatus(selectedGeofence._id, !selectedGeofence.isActive)}
                    >
                      {selectedGeofence.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleGeofenceDeleted([selectedGeofence._id])}
                      className="px-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : null}

          {/* List Panel */}
          <Card className="flex-1 flex flex-col border-border/50 shadow-sm overflow-hidden h-full max-h-[800px]">
            <div className="p-4 border-b border-border/50 space-y-4 bg-surface-muted/30">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-foreground">Saved Geofences</h2>
                <Badge variant="secondary" className="px-2 py-0.5">{geofences.length}</Badge>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input 
                  type="text" 
                  placeholder="Search geofences..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 rounded-xl border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring focus:border-input shadow-sm appearance-none transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              ) : filteredGeofences.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <EmptyState 
                    icon={Map}
                    title="No Geofences Found"
                    description="Use the polygon tool on the map to draw a new operational boundary."
                  />
                </div>
              ) : (
                filteredGeofences.map((gf, idx) => (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={gf._id}
                    onClick={() => setSelectedGeofenceId(gf._id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border relative group focus:outline-none ${
                      selectedGeofenceId === gf._id 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'bg-background border-border/50 hover:border-primary/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-foreground truncate pr-4 leading-tight">{gf.name}</h4>
                      <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${gf.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} title={gf.isActive ? 'Active' : 'Inactive'} />
                    </div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-surface-muted/50 border-border/50 text-muted-foreground flex items-center gap-1">
                        {gf.category === 'office' ? <Building2 className="w-2.5 h-2.5" /> : gf.category === 'customer' ? <Briefcase className="w-2.5 h-2.5" /> : <Layers className="w-2.5 h-2.5" />}
                        {gf.category || 'General'}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-surface-muted/50 border-border/50 text-muted-foreground">
                        {gf.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/30 pt-2">
                      <span className="font-mono">{gf.boundary?.coordinates?.[0]?.length || 0} pts</span>
                      <span>{new Date(gf.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Map Area */}
        <Card className="flex-1 rounded-2xl shadow-sm border-border/50 overflow-hidden relative z-0 h-[600px] lg:h-auto min-h-[500px]">
          <LiveMap center={INDIA_CENTER} zoom={DEFAULT_ZOOM}>
            <GeofenceEditor 
              geofences={geofences}
              selectedGeofenceId={selectedGeofenceId}
              onSelectGeofence={setSelectedGeofenceId}
              onGeofenceCreated={handleGeofenceCreated}
              onGeofenceEdited={handleGeofenceEdited}
              onGeofenceDeleted={handleGeofenceDeleted}
            />
          </LiveMap>
          
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg text-sm font-bold text-foreground border border-border/50 pointer-events-none z-[400] flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Use the polygon tool to draw boundaries
          </div>
        </Card>
      </div>
    </div>
  );
}
