import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../app/auth-context';
import { socket } from '../../app/socket';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { user } = useAuth();
  const [lastPosition, setLastPosition] = useState(null);
  const positionRef = useRef(null);

  useEffect(() => {
    if (!user?._id || user.role !== 'worker') return;

    let watchId;
    if ('geolocation' in navigator) {
      console.log('[LOCATION] Started watchPosition');
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          positionRef.current = position;
          setLastPosition(position);

          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          socket.emit('worker:location-update', {
            workerId: user._id,
            latitude,
            longitude,
            accuracy: accuracy || undefined,
            speed: speed || undefined,
            heading: heading || undefined,
            batteryLevel: 100,
            isMoving: speed !== null ? speed > 0 : undefined,
            timestamp: new Date()
          });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            console.warn('[LOCATION] Permission denied');
          } else {
            console.warn('[LOCATION] Watch warning:', error.message);
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000, 
          timeout: 30000 
        }
      );
    } else {
      console.warn('[LOCATION] Geolocation is not supported');
    }

    return () => {
      if (watchId !== undefined && 'geolocation' in navigator) {
        console.log('[LOCATION] Cleared watchPosition');
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user]);

  const getFreshLocation = () => {
    return new Promise((resolve, reject) => {
      const cached = positionRef.current;
      const MAX_CACHE_AGE_MS = 60000; // 1 minute

      if (cached && (Date.now() - cached.timestamp < MAX_CACHE_AGE_MS)) {
        console.log('[LOCATION] Using cached position');
        return resolve(cached);
      }

      console.log('[LOCATION] Cache stale or missing, requesting fresh GPS fix...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[LOCATION] Using fresh GPS fix');
          positionRef.current = position;
          setLastPosition(position);
          resolve(position);
        },
        (error) => {
          if (error.code === error.TIMEOUT && cached) {
            console.log('[LOCATION] Timeout - using previous live location');
            return resolve(cached);
          }
          if (error.code === error.PERMISSION_DENIED) {
            console.warn('[LOCATION] Permission denied');
            return reject(error);
          }
          reject(error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    });
  };

  return (
    <LocationContext.Provider value={{ lastPosition, getFreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
