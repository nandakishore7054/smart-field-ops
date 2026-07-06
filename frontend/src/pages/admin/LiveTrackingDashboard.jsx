import React, { useEffect, useState } from 'react';
import api from '../../app/api';
import { socket } from '../../app/socket';
import LiveMap from '../../features/tracking/LiveMap';
import { Marker, Popup } from 'react-leaflet';

export default function LiveTrackingDashboard() {
  const [workers, setWorkers] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function fetchWorkers() {
      try {
        const response = await api.get('/tracking/active-workers');
        console.log('[LiveTrackingDashboard] API response:', response.data);
        const data = response.data?.data || [];
        
        if (isMounted) {
          const workersMap = {};
          data.forEach(worker => {
            console.log('[LiveTrackingDashboard] Mapping API worker:', worker);
            workersMap[worker.workerId] = worker;
          });
          setWorkers(workersMap);
        }
      } catch (err) {
        console.error('Failed to fetch active workers', err);
      }
    }
    fetchWorkers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleLocationUpdate(data) {
      console.log('[LiveTrackingDashboard] Socket location:updated received:', data);
      setWorkers(prev => {
        // If we receive an update for a worker we don't have, we might not have their name/status.
        // But we still track them.
        const existing = prev[data.workerId] || {};
        return {
          ...prev,
          [data.workerId]: {
            ...existing,
            workerId: data.workerId,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.timestamp
          }
        };
      });
    }

    socket.on('location:updated', handleLocationUpdate);
    return () => {
      socket.off('location:updated', handleLocationUpdate);
    };
  }, []);

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Live Tracking Dashboard</h1>
      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden border border-slate-200" style={{ minHeight: '500px' }}>
        <LiveMap>
          {Object.values(workers).map(worker => (
            worker.latitude != null && worker.longitude != null ? (
              <Marker key={worker.workerId} position={[worker.latitude, worker.longitude]}>
                <Popup>
                  <strong>{worker.workerName || 'Unknown Worker'}</strong><br />
                  Status: {worker.attendanceStatus || 'Active'}<br />
                  Last Seen: {worker.timestamp ? new Date(worker.timestamp).toLocaleTimeString() : 'Unknown'}
                </Popup>
              </Marker>
            ) : null
          ))}
        </LiveMap>
      </div>
    </div>
  );
}
