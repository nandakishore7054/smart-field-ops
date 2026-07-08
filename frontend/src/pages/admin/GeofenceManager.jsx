import React, { useEffect, useState, useMemo } from 'react';
import api from '../../app/api';
import LiveMap from '../../features/tracking/LiveMap';
import GeofenceEditor from '../../features/tracking/GeofenceEditor';
import toast from 'react-hot-toast';

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
    // payload has { type: 'polygon', boundary: { type: 'Polygon', coordinates: [...] } }
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

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Geofence Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 ml-12">Draw and manage operational boundaries</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0">
          
          {/* Create/Edit Panel */}
          {pendingGeofence ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-sky-200 dark:border-sky-800 overflow-hidden">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 border-b border-sky-100 dark:border-sky-800/50 flex justify-between items-center">
                <h3 className="font-bold text-sky-800 dark:text-sky-300">Save New Geofence</h3>
                <button onClick={() => setPendingGeofence(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={handleSavePending} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Geofence Name</label>
                  <input 
                    type="text"
                    required
                    autoFocus
                    value={pendingGeofence.name}
                    onChange={e => setPendingGeofence({...pendingGeofence, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g. North Zone Depot"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select 
                    value={pendingGeofence.category || 'general'}
                    onChange={e => setPendingGeofence({...pendingGeofence, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="general">General</option>
                    <option value="office">Office (Auto Check-In)</option>
                    <option value="customer">Customer (Visit Tracking)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="isActiveNew"
                    checked={pendingGeofence.isActive}
                    onChange={e => setPendingGeofence({...pendingGeofence, isActive: e.target.checked})}
                    className="rounded text-sky-500 focus:ring-sky-500"
                  />
                  <label htmlFor="isActiveNew" className="text-sm text-slate-700 dark:text-slate-300">Active immediately</label>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl font-medium transition-colors">
                    Save Geofence
                  </button>
                </div>
              </form>
            </div>
          ) : selectedGeofence ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-white">Geofence Details</h3>
                <button onClick={() => setSelectedGeofenceId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Name</label>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedGeofence.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Type</label>
                    <p className="capitalize text-slate-700 dark:text-slate-300">{selectedGeofence.type}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Category</label>
                    <p className="capitalize text-slate-700 dark:text-slate-300">
                      {selectedGeofence.category === 'office' ? '🏢 Office' : selectedGeofence.category === 'customer' ? '🤝 Customer' : '🌐 General'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Vertices</label>
                    <p className="text-slate-700 dark:text-slate-300">
                      {selectedGeofence.boundary?.coordinates?.[0]?.length || 0} points
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Created</label>
                    <p className="text-slate-700 dark:text-slate-300">{new Date(selectedGeofence.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
                  <button 
                    onClick={() => handleUpdateStatus(selectedGeofence._id, !selectedGeofence.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                      selectedGeofence.isActive 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {selectedGeofence.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={() => handleGeofenceDeleted([selectedGeofence._id])}
                    className="w-full text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 py-2 rounded-xl font-medium transition-colors text-sm"
                  >
                    Delete Geofence
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* List Panel */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg text-slate-800 dark:text-white">Saved Geofences</h2>
                <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-full">
                  {geofences.length}
                </span>
              </div>
              
              <input 
                type="text" 
                placeholder="Search geofences..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 relative min-h-[300px]">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse flex gap-3 p-3 border border-slate-100 rounded-xl">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredGeofences.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-3xl shadow-inner border border-slate-100 dark:border-slate-700">
                    🛑
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No Geofences Found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Use the polygon tool on the map to draw a new operational boundary.</p>
                </div>
              ) : (
                filteredGeofences.map(gf => (
                  <button
                    key={gf._id}
                    onClick={() => setSelectedGeofenceId(gf._id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 border relative overflow-hidden group ${
                      selectedGeofenceId === gf._id 
                        ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">{gf.name}</h4>
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${gf.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} title={gf.isActive ? 'Active' : 'Inactive'} />
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span className="capitalize">{gf.category || 'General'}</span>
                      <span>{new Date(gf.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative z-0 min-h-[400px]">
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
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md text-sm font-medium text-slate-700 border border-slate-200 pointer-events-none z-[400]">
            Use the polygon tool ⬟ to draw boundaries
          </div>
        </div>
      </div>
    </div>
  );
}
