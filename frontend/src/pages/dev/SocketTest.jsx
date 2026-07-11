import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import LiveMap from '../../features/tracking/LiveMap';
import { getAccessToken } from '../../app/api';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SocketTest() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('Disconnected');
  const [socketId, setSocketId] = useState('');
  
  const [workerId, setWorkerId] = useState('');
  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [accuracy, setAccuracy] = useState(10);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [battery, setBattery] = useState(100);
  const [isMoving, setIsMoving] = useState(false);

  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  const addLog = (type, message, data = null) => {
    setLogs(prev => [...prev, {
      time: new Date().toISOString(),
      type,
      message,
      data: data ? JSON.stringify(data, null, 2) : ''
    }]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  const connect = () => {
    if (socket) socket.disconnect();
    
    const token = getAccessToken();
    if (!token) {
      addLog('ERROR', 'No JWT found in localStorage. Please login first.');
      return;
    }
    addLog('INFO', `Connecting to ${SOCKET_URL} with JWT auth...`);
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { token },
    });

    newSocket.on('connect', () => {
      setStatus('Connected');
      setSocketId(newSocket.id);
      addLog('SUCCESS', `Connected with ID: ${newSocket.id}`);
    });

    newSocket.on('disconnect', (reason) => {
      setStatus('Disconnected');
      setSocketId('');
      addLog('WARNING', `Disconnected: ${reason}`);
    });

    newSocket.on('connect_error', (error) => {
      addLog('ERROR', `Connect Error: ${error.message}`);
    });

    // Listen for the location update
    newSocket.on('location:updated', (data) => {
      addLog('EVENT RECEIVED', 'location:updated', data);
    });

    // Listen for geofence events
    newSocket.on('geofence:entered', (data) => {
      addLog('EVENT RECEIVED', 'geofence:entered', data);
    });

    newSocket.on('geofence:exited', (data) => {
      addLog('EVENT RECEIVED', 'geofence:exited', data);
    });

    setSocket(newSocket);
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      addLog('INFO', 'Manually disconnected.');
    }
  };

  const joinAsAdmin = () => {
    addLog('INFO', 'Room assignment is now automatic. If your JWT belongs to an admin/dispatcher, you are already in the admin room.');
  };

  const joinAsWorker = () => {
    addLog('INFO', 'Room assignment is now automatic. Your JWT identity determines your room membership.');
  };

  const sendLocation = (customLat = lat, customLng = lng) => {
    if (!socket) return alert('Connect first');
    if (!workerId) return alert('Worker ID is required to send location');

    const payload = {
      workerId,
      latitude: parseFloat(customLat),
      longitude: parseFloat(customLng),
      accuracy: parseFloat(accuracy),
      speed: parseFloat(speed),
      heading: parseFloat(heading),
      batteryLevel: parseFloat(battery),
      isMoving,
      timestamp: new Date()
    };

    socket.emit('worker:location-update', payload);
    addLog('ACTION SENT', 'worker:location-update', payload);
  };

  const sendRapidUpdates = () => {
    if (!socket) return alert('Connect first');
    if (!workerId) return alert('Worker ID is required to send location');

    addLog('INFO', 'Sending 10 rapid updates to test throttling...');
    for (let i = 0; i < 10; i++) {
      sendLocation(lat + (i * 0.0001), lng + (i * 0.0001));
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>[DEV] Socket.IO Tracking Test</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Connection & Auth Panel */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px' }}>
          <h3>1. Connection</h3>
          <p>Status: <strong style={{ color: status === 'Connected' ? 'green' : 'red' }}>{status}</strong></p>
          <p>Socket ID: {socketId || 'N/A'}</p>
          <button onClick={connect}>Connect</button>
          <button onClick={disconnect}>Disconnect</button>
          
          <hr />
          <h3>2. Authentication (JWT-based, auto-joined)</h3>
          <button onClick={joinAsAdmin}>Join as Admin</button>
          
          <div style={{ marginTop: '10px' }}>
            <input 
              type="text" 
              placeholder="Worker ID (MongoDB ObjectId)" 
              value={workerId} 
              onChange={e => setWorkerId(e.target.value)} 
              style={{ width: '100%', marginBottom: '5px' }}
            />
            <button onClick={joinAsWorker}>Join as Worker</button>
          </div>
        </div>

        {/* Payload Panel */}
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px' }}>
          <h3>3. Emit Location (worker:location-update)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label>Lat: <input type="number" value={lat} onChange={e => setLat(e.target.value)} /></label>
            <label>Lng: <input type="number" value={lng} onChange={e => setLng(e.target.value)} /></label>
            <label>Accuracy: <input type="number" value={accuracy} onChange={e => setAccuracy(e.target.value)} /></label>
            <label>Speed: <input type="number" value={speed} onChange={e => setSpeed(e.target.value)} /></label>
            <label>Heading: <input type="number" value={heading} onChange={e => setHeading(e.target.value)} /></label>
            <label>Battery: <input type="number" value={battery} onChange={e => setBattery(e.target.value)} /></label>
            <label>
              <input type="checkbox" checked={isMoving} onChange={e => setIsMoving(e.target.checked)} /> Moving
            </label>
          </div>
          <br />
          <button onClick={() => sendLocation()} style={{ background: '#4CAF50', color: 'white', padding: '10px', width: '100%' }}>
            Send Location
          </button>
          <hr />
          <h3>4. Throttle Test</h3>
          <button onClick={sendRapidUpdates} style={{ background: '#f44336', color: 'white', padding: '10px', width: '100%' }}>
            Send 10 Rapid Updates (Test Throttle)
          </button>
        </div>
      </div>

      {/* Console Panel */}
      <div style={{ border: '1px solid #ccc', padding: '15px', background: '#1e1e1e', color: '#00ff00', height: '400px', overflowY: 'auto', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, color: '#fff' }}>Live Console</h3>
          <button onClick={clearLogs}>Clear Logs</button>
        </div>
        <hr style={{ borderColor: '#333' }} />
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
            <span style={{ color: '#888' }}>[{log.time}]</span>{' '}
            <strong style={{ 
              color: log.type === 'ERROR' ? '#ff4444' : 
                     log.type === 'WARNING' ? '#ffaa00' : 
                     log.type === 'EVENT RECEIVED' ? '#00ccff' :
                     log.type === 'ACTION SENT' ? '#ff00ff' : '#00ff00' 
            }}>[{log.type}]</strong>{' '}
            <span>{log.message}</span>
            {log.data && (
              <pre style={{ margin: '5px 0 0 20px', color: '#aaa', fontSize: '0.9em' }}>
                {log.data}
              </pre>
            )}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Live Map Preview */}
      <div style={{ border: '1px solid #ccc', padding: '15px' }}>
        <h3 style={{ marginTop: 0 }}>Map Infrastructure Verification (Milestone 4)</h3>
        <div style={{ height: '500px', width: '100%', border: '1px solid #333' }}>
          <LiveMap />
        </div>
      </div>
    </div>
  );
}
