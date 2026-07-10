import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../app/api';
import { socket } from '../../app/socket';
import LiveMap from '../../features/tracking/LiveMap';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import WorkerTrailMapLayer from './components/WorkerTrailMapLayer';
import NearestWorkerFinder from './components/NearestWorkerFinder';

const INDIA_CENTER = [22.5937, 78.9629];
const DEFAULT_ZOOM = 5;

// Floating Map Controls Component
function MapController({ workers, selectedWorkerId, onResetCenter, isNearestMode, onToggleNearestMode, clickedLocation, nearestWorkers }) {
  console.log("MapController mounted");
  const map = useMap();

  useEffect(() => {
    if (selectedWorkerId && workers[selectedWorkerId]) {
      const w = workers[selectedWorkerId];
      if (w.latitude != null && w.longitude != null) {
        map.flyTo([w.latitude, w.longitude], 16, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedWorkerId, workers, map]);

  useEffect(() => {
    if (isNearestMode && clickedLocation && nearestWorkers && nearestWorkers.length > 0) {
      const bounds = L.latLngBounds([
        [clickedLocation.lat, clickedLocation.lng],
        ...nearestWorkers.map(w => [w.latitude, w.longitude])
      ]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15, animate: true, duration: 1.5 });
    }
  }, [isNearestMode, clickedLocation, nearestWorkers, map]);

  useEffect(() => {
    if (!selectedWorkerId && !isNearestMode) {
      const validWorkers = Object.values(workers).filter(w => w.latitude != null && w.longitude != null);
      if (validWorkers.length > 0) {
        const bounds = L.latLngBounds(validWorkers.map(w => [w.latitude, w.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true, duration: 1.5 });
      } else {
        map.flyTo(INDIA_CENTER, DEFAULT_ZOOM, { animate: true, duration: 1.5 });
      }
    }
  }, [workers, selectedWorkerId, isNearestMode, map]);

  return (
    <div className="leaflet-bottom leaflet-right mb-6 mr-2 flex flex-col gap-2 pointer-events-auto" style={{ zIndex: 1000 }}>
      <button 
        onClick={() => {
          console.log("Nearest Mode:", isNearestMode);
          onToggleNearestMode();
        }} 
        className={`${isNearestMode ? 'bg-violet-600 text-white hover:bg-violet-700 ring-4 ring-violet-200 dark:ring-violet-900' : 'bg-white text-violet-600 hover:bg-violet-50'} shadow-lg p-3 rounded-full transition-all group relative`} 
        title="Find Nearest Workers"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </button>
      <button onClick={() => onResetCenter(true)} className="bg-white hover:bg-sky-50 text-slate-700 shadow-md p-2.5 rounded-full transition-colors group relative" title="Center on Workers">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      </button>
      <button onClick={() => map.flyTo(INDIA_CENTER, DEFAULT_ZOOM, { animate: true })} className="bg-white hover:bg-slate-50 text-slate-700 shadow-md p-2.5 rounded-full transition-colors" title="Center on India">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      </button>
      <button onClick={() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { animate: true, duration: 1.5 });
          });
        }
      }} className="bg-white hover:bg-emerald-50 text-slate-700 shadow-md p-2.5 rounded-full transition-colors" title="Locate Me">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          <circle cx="10" cy="11" r="2" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}

export default function LiveTrackingDashboard() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  
  // Trail State
  const [showTrail, setShowTrail] = useState(false);
  const [trailDate, setTrailDate] = useState(new Date().toISOString().split('T')[0]);
  const [trailData, setTrailData] = useState(null);
  const [trailLoading, setTrailLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnline, setFilterOnline] = useState('all');
  const [filterAttendance, setFilterAttendance] = useState('all');

  // Nearest Worker State
  const [isNearestMode, setIsNearestMode] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [nearestWorkers, setNearestWorkers] = useState([]);
  const [nearestLoading, setNearestLoading] = useState(false);

  const markerRefs = useRef({});

  // Auto-open popup when selectedWorkerId changes
  useEffect(() => {
    if (selectedWorkerId && markerRefs.current[selectedWorkerId]) {
      markerRefs.current[selectedWorkerId].openPopup();
    }
  }, [selectedWorkerId]);

  const fetchWorkers = async (isMounted = true) => {
    try {
      const response = await api.get('/tracking/active-workers');
      if (isMounted) {
        const workersMap = {};
        response.data.data.forEach(w => workersMap[w.workerId] = w);
        setWorkers(workersMap);
      }
    } catch (err) {
      console.error('Failed to fetch workers', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleMapClick = async (latlng) => {
    console.log("handleMapClick entered");
    console.log("Clicked lat/lng:", latlng);

    if (!isNearestMode) {
      console.log("Exiting early: isNearestMode is false");
      return;
    }
    
    setClickedLocation(latlng);
    console.log("clickedLocation state updated");
    setNearestLoading(true);
    
    try {
      console.log("Sending GET /tracking/nearest");
      const response = await api.get(`/tracking/nearest?lat=${latlng.lat}&lng=${latlng.lng}`);
      console.log("Response data:", response.data);
      setNearestWorkers(response.data.data || []);
      console.log("nearestWorkers state updated");
    } catch (err) {
      console.error('Failed to fetch nearest workers', err);
      setNearestWorkers([]);
    } finally {
      setNearestLoading(false);
    }
  };

  const clearNearestSearch = () => {
    setClickedLocation(null);
    setNearestWorkers([]);
  };

  useEffect(() => {
    let isMounted = true;
    fetchWorkers(isMounted);
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    async function fetchTrail(isAutoRefresh = false) {
      if (!showTrail || !selectedWorkerId) {
        if (!isAutoRefresh) setTrailData(null);
        return;
      }
      if (!isAutoRefresh) setTrailLoading(true);
      try {
        const response = await api.get(`/tracking/trail/${selectedWorkerId}?date=${trailDate}`);
        setTrailData(response.data.data);
      } catch (err) {
        console.error('Failed to fetch worker trail', err);
        if (!isAutoRefresh) setTrailData(null);
      } finally {
        if (!isAutoRefresh) setTrailLoading(false);
      }
    }
    
    // Initial fetch on change
    fetchTrail();

    // Auto-refresh interval (5 seconds)
    let intervalId;
    const todayStr = new Date().toISOString().split('T')[0];
    if (showTrail && selectedWorkerId && trailDate === todayStr) {
      intervalId = setInterval(() => {
        fetchTrail(true); // silent background refresh
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [showTrail, selectedWorkerId, trailDate]);

  useEffect(() => {
    function handleLocationUpdate(data) {
      setWorkers(prev => {
        const existing = prev[data.workerId] || {};
        return {
          ...prev,
          [data.workerId]: {
            ...existing,
            ...data,
            // Keep original workerName, attendanceStatus, and geofence state if not provided
            workerName: data.workerName || existing.workerName || 'Unknown Worker',
            attendanceStatus: existing.attendanceStatus || 'Active',
            currentGeofence: existing.currentGeofence || null,
            geofenceArrivalTime: existing.geofenceArrivalTime || null
          }
        };
      });

      // If trail is showing for this worker for TODAY, append the point
      if (showTrail && selectedWorkerId === data.workerId) {
        const todayStr = new Date().toISOString().split('T')[0];
        if (trailDate === todayStr) {
          setTrailData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              coordinates: [...prev.coordinates, { lat: data.latitude, lng: data.longitude, timestamp: data.timestamp }],
              endTime: data.timestamp,
              totalPoints: prev.totalPoints + 1
            };
          });
        }
      }
    }

    function handleGeofenceEntered(data) {
      if (data.category !== 'customer') return;
      setWorkers(prev => {
        const existing = prev[data.workerId];
        if (!existing) return prev;
        return {
          ...prev,
          [data.workerId]: {
            ...existing,
            currentGeofence: data.geofenceName,
            geofenceArrivalTime: data.timestamp
          }
        };
      });
    }

    function handleGeofenceExited(data) {
      if (data.category !== 'customer') return;
      setWorkers(prev => {
        const existing = prev[data.workerId];
        if (!existing) return prev;
        return {
          ...prev,
          [data.workerId]: {
            ...existing,
            currentGeofence: null,
            geofenceArrivalTime: null
          }
        };
      });
    }

    function handleAttendanceCheckedIn(data) {
      setWorkers(prev => {
        const existing = prev[data.workerId] || {};
        return {
          ...prev,
          [data.workerId]: {
            ...existing,
            workerId: data.workerId,
            workerName: data.workerName,
            attendanceStatus: data.status,
          }
        };
      });
    }

    function handleAttendanceCheckedOut(data) {
      setWorkers(prev => {
        const existing = prev[data.workerId];
        if (!existing) return prev;
        return {
          ...prev,
          [data.workerId]: {
            ...existing,
            attendanceStatus: 'checked-out'
          }
        };
      });
    }

    socket.on('location:updated', handleLocationUpdate);
    socket.on('geofence:entered', handleGeofenceEntered);
    socket.on('geofence:exited', handleGeofenceExited);
    socket.on('attendance:checked-in', handleAttendanceCheckedIn);
    socket.on('attendance:checked-out', handleAttendanceCheckedOut);
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.off('location:updated', handleLocationUpdate);
      socket.off('geofence:entered', handleGeofenceEntered);
      socket.off('geofence:exited', handleGeofenceExited);
      socket.off('attendance:checked-in', handleAttendanceCheckedIn);
      socket.off('attendance:checked-out', handleAttendanceCheckedOut);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [showTrail, selectedWorkerId, trailDate]);

  const activeWorkersList = useMemo(() => {
    return Object.values(workers).filter(w => w.latitude != null && w.longitude != null);
  }, [workers]);
  
  const filteredWorkers = useMemo(() => {
    return activeWorkersList.filter(w => {
      const matchesSearch = (w.workerName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (w.workerId || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const isOnline = w.timestamp && (new Date() - new Date(w.timestamp) < 5 * 60 * 1000);
      const matchesOnline = filterOnline === 'all' || 
                           (filterOnline === 'online' && isOnline) || 
                           (filterOnline === 'offline' && !isOnline);
      
      const matchesAttendance = filterAttendance === 'all' || 
                               (w.attendanceStatus || '').toLowerCase() === filterAttendance.toLowerCase();
                               
      return matchesSearch && matchesOnline && matchesAttendance;
    });
  }, [activeWorkersList, searchQuery, filterOnline, filterAttendance]);

  const onlineCount = activeWorkersList.filter(w => w.timestamp && (new Date() - new Date(w.timestamp) < 5 * 60 * 1000)).length;
  const lastUpdate = activeWorkersList.length > 0 
    ? new Date(Math.max(...activeWorkersList.map(w => new Date(w.timestamp || 0).getTime()))) 
    : null;

  return (
    <div className="flex flex-col gap-6 min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-sky-100 dark:bg-sky-500/20 rounded-xl text-sky-600 dark:text-sky-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </span>
            Live Tracking Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 ml-12">Monitor field workers in real-time across the region</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="relative flex h-3 w-3">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {isConnected ? 'Socket Connected' : 'Disconnected'}
            </span>
          </div>
          {lastUpdate && (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Last signal: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Workers', value: activeWorkersList.length, icon: 'users', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/20' },
          { label: 'Online Now', value: onlineCount, icon: 'wifi', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
          { label: 'Offline', value: activeWorkersList.length - onlineCount, icon: 'wifi-off', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-500/20' },
          { label: 'Map Status', value: isConnected ? 'Live' : 'Stale', icon: 'activity', color: isConnected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400', bg: isConnected ? 'bg-sky-100 dark:bg-sky-500/20' : 'bg-slate-100 dark:bg-slate-800' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">Directory</h2>
              <button onClick={() => fetchWorkers()} className="text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                Refresh
              </button>
            </div>
            
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
            
            <div className="flex gap-2">
              <select 
                value={filterOnline} 
                onChange={e => setFilterOnline(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
              <select 
                value={filterAttendance} 
                onChange={e => setFilterAttendance(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none"
              >
                <option value="all">All Attendance</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
              </select>
            </div>
          </div>

          {isNearestMode && (
            <div className="bg-violet-50 dark:bg-violet-900/20 border-b border-violet-100 dark:border-violet-800 p-4 transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-violet-800 dark:text-violet-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
                    Nearest Workers
                  </h3>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                    {!clickedLocation ? 'Click map to find nearest active workers.' : 'Top 3 closest workers shown.'}
                  </p>
                </div>
                <button 
                  onClick={clearNearestSearch}
                  className="text-xs font-medium text-violet-600 hover:text-white hover:bg-violet-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg shadow-sm border border-violet-200 dark:border-slate-700 transition-colors"
                >
                  Clear
                </button>
              </div>

              {nearestLoading ? (
                <div className="flex items-center gap-3 text-sm text-violet-600 bg-white dark:bg-slate-800 p-3 rounded-xl border border-violet-100 dark:border-slate-700 shadow-sm">
                  <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                  Calculating distances...
                </div>
              ) : nearestWorkers.length > 0 ? (
                <div className="space-y-2">
                  {nearestWorkers.map((worker, idx) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const medal = medals[idx] || '';
                    const isSelected = selectedWorkerId === worker.workerId;
                    
                    return (
                      <div 
                        key={worker.workerId}
                        onClick={() => setSelectedWorkerId(worker.workerId)}
                        className={`cursor-pointer bg-white dark:bg-slate-800 p-3 rounded-xl border flex justify-between items-center shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 ${isSelected ? 'ring-2 ring-violet-500 border-violet-300' : idx === 0 ? 'border-yellow-400 dark:border-yellow-600 ring-1 ring-yellow-400/50' : 'border-violet-100 dark:border-slate-700'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl mt-0.5" title={`Rank #${idx+1}`}>{medal}</div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
                              {worker.workerName}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                              {worker.currentGeofence ? (
                                <div className="text-indigo-600 dark:text-indigo-400 font-medium truncate w-32">📍 {worker.currentGeofence}</div>
                              ) : (
                                <div>No active assignment</div>
                              )}
                              <div className="text-slate-400">Last seen: {new Date(worker.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          <div className={`font-black text-sm px-2 py-0.5 rounded-full ${idx === 0 ? 'text-yellow-700 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-900/30' : 'text-violet-700 bg-violet-50 dark:text-violet-300 dark:bg-violet-900/30'}`}>
                            {worker.distance.toFixed(2)} km
                          </div>
                          <div className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${worker.attendanceStatus === 'present' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-amber-700 bg-amber-50 border border-amber-100'}`}>
                            {worker.attendanceStatus}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : clickedLocation ? (
                <div className="text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-200 text-center shadow-sm">No active workers found within range.</div>
              ) : null}
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex gap-3 p-3 border border-slate-100 rounded-xl">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-4xl shadow-inner border border-slate-100 dark:border-slate-700">
                  🗺️
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">No Active Workers</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">No workers are currently checked in or sharing live location matching your filters.</p>
                <div className="flex flex-col w-full gap-3">
                  <button onClick={() => fetchWorkers()} className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-sky-500/20">
                    Refresh Directory
                  </button>
                  <button onClick={() => navigate('/admin/attendance')} className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2.5 rounded-xl font-medium transition-colors">
                    Go to Attendance
                  </button>
                </div>
              </div>
            ) : (
              filteredWorkers.map(worker => {
                const isOnline = worker.timestamp && (new Date() - new Date(worker.timestamp) < 5 * 60 * 1000);
                return (
                  <button
                    key={worker.workerId}
                    onClick={() => setSelectedWorkerId(worker.workerId)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 border relative overflow-hidden group ${
                      selectedWorkerId === worker.workerId 
                        ? 'bg-sky-50 border-sky-300 dark:bg-sky-900/30 dark:border-sky-700 shadow-md transform scale-[1.02]' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-800 hover:shadow-md'
                    }`}
                  >
                    {selectedWorkerId === worker.workerId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />}
                    <div className="flex gap-4 items-center">
                      <div className="relative">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {(worker.workerName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">{worker.workerName || 'Unknown Worker'}</h4>
                          {worker.attendanceStatus && (
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                              worker.attendanceStatus === 'present' ? 'bg-emerald-100 text-emerald-700' : 
                              worker.attendanceStatus === 'manual_override' ? 'bg-purple-100 text-purple-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {worker.attendanceStatus === 'manual_override' ? 'Override' : worker.attendanceStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1.5">ID: {worker.workerId.slice(-6)}</p>
                        
                        {worker.currentGeofence && (
                          <div className="mb-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded p-1.5 flex justify-between items-center text-xs">
                            <span className="text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1 truncate"><span className="text-indigo-500">📍</span> {worker.currentGeofence}</span>
                            {worker.geofenceArrivalTime && (
                              <span className="text-indigo-500 dark:text-indigo-400 font-mono pl-2 shrink-0">{new Date(worker.geofenceArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span className="flex items-center gap-1"><span className="text-sky-500">🧭</span> {worker.latitude.toFixed(3)}, {worker.longitude.toFixed(3)}</span>
                          <span>{worker.timestamp ? new Date(worker.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          
          {selectedWorkerId && (
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="text-sky-500">🗺️</span> Worker Trail
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={showTrail} onChange={(e) => setShowTrail(e.target.checked)} />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-sky-500"></div>
                </label>
              </div>
              
              {showTrail && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200 fade-in">
                  <input 
                    type="date" 
                    value={trailDate} 
                    onChange={(e) => setTrailDate(e.target.value)} 
                    className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow" 
                  />
                  
                  {trailLoading ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <div className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading trail data...
                    </div>
                  ) : trailData && trailData.coordinates.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Distance</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{(trailData.totalDistance / 1000).toFixed(2)} km</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Points</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{trailData.totalPoints} ping(s)</span>
                      </div>
                      <div className="col-span-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Last Updated</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{new Date(trailData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-2 rounded border border-rose-100 dark:border-rose-800">
                      No trail data found for this date.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Map Area */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative z-0">
          {loading && activeWorkersList.length === 0 && (
            <div className="absolute inset-0 z-[1000] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin mb-4 shadow-lg"></div>
            </div>
          )}
          <LiveMap center={INDIA_CENTER} zoom={DEFAULT_ZOOM}>
            <MapController 
              workers={workers} 
              selectedWorkerId={selectedWorkerId} 
              onResetCenter={() => setSelectedWorkerId(null)} 
              isNearestMode={isNearestMode}
              onToggleNearestMode={() => {
                setIsNearestMode(!isNearestMode);
                if (isNearestMode) clearNearestSearch();
              }}
            />
            <WorkerTrailMapLayer trailData={trailData} isVisible={showTrail} />
            <NearestWorkerFinder 
              isNearestMode={isNearestMode}
              onMapClick={handleMapClick}
              clickedLocation={clickedLocation}
              nearestWorkers={nearestWorkers}
            />
            
            {activeWorkersList.map(worker => (
              <Marker 
                key={worker.workerId} 
                position={[worker.latitude, worker.longitude]}
                ref={(ref) => {
                  if (ref) markerRefs.current[worker.workerId] = ref;
                }}
                eventHandlers={{
                  click: () => setSelectedWorkerId(worker.workerId),
                }}
              >
                <Popup className="rounded-xl shadow-2xl border-0 overflow-hidden p-0 custom-popup" minWidth={250}>
                  <div className="bg-slate-800 text-white p-3 flex justify-between items-center rounded-t-lg">
                    <h3 className="font-bold text-base truncate">{worker.workerName || 'Unknown Worker'}</h3>
                    <span className={`w-2.5 h-2.5 rounded-full ${worker.timestamp && (new Date() - new Date(worker.timestamp) < 5 * 60 * 1000) ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  </div>
                  <div className="p-4 space-y-3 bg-white text-slate-700">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="text-slate-500">Worker ID</div>
                      <div className="font-mono text-xs text-right bg-slate-100 py-0.5 px-1.5 rounded">{worker.workerId}</div>
                      
                      <div className="text-slate-500">Location</div>
                      <div className="text-right text-xs font-mono">{worker.latitude.toFixed(5)}, {worker.longitude.toFixed(5)}</div>
                      
                      <div className="text-slate-500">Status</div>
                      <div className="text-right capitalize font-medium">{worker.attendanceStatus === 'manual_override' ? 'Override' : (worker.attendanceStatus || 'Active')}</div>
                      
                      {worker.accuracy && (
                        <>
                          <div className="text-slate-500">Accuracy</div>
                          <div className="text-right">±{Math.round(worker.accuracy)}m</div>
                        </>
                      )}
                      
                      {worker.speed !== undefined && (
                        <>
                          <div className="text-slate-500">Movement</div>
                          <div className="text-right font-medium">
                            {worker.isMoving ? <span className="text-sky-600">Moving ({Math.round(worker.speed * 3.6)} km/h)</span> : <span className="text-slate-400">Stationary</span>}
                          </div>
                        </>
                      )}
                      
                      {worker.batteryLevel !== undefined && (
                        <>
                          <div className="text-slate-500">Battery</div>
                          <div className="text-right text-emerald-600">{worker.batteryLevel}%</div>
                        </>
                      )}
                    </div>

                    {worker.currentGeofence && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Current Customer Visit</div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium truncate pr-2 text-slate-800">{worker.currentGeofence}</span>
                          {worker.geofenceArrivalTime && (
                            <span className="text-xs font-mono text-slate-500">{new Date(worker.geofenceArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          )}
                        </div>
                        {worker.geofenceArrivalTime && (
                          <div className="text-xs text-slate-400 mt-1">
                            Duration: {Math.floor((new Date().getTime() - new Date(worker.geofenceArrivalTime).getTime()) / 60000)} mins
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-3 mt-1 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                      <span>Last Ping</span>
                      <span className="font-medium text-slate-600">
                        {worker.timestamp ? new Date(worker.timestamp).toLocaleTimeString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </LiveMap>
        </div>
      </div>
    </div>
  );
}
