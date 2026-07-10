import React, { useEffect, useRef } from 'react';
import { useMapEvents, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Target Marker Icon (Purple)
const targetIcon = L.divIcon({
  className: 'custom-labeled-marker',
  html: `<div style="
    background-color: #8b5cf6; 
    color: white; 
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%; 
    border: 2px solid white; 
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
    position: relative;
    top: -14px;
    left: -14px;
  "><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export default function NearestWorkerFinder({ 
  isNearestMode, 
  onMapClick, 
  clickedLocation, 
  nearestWorkers 
}) {
  const map = useMapEvents({
    click(e) {
      console.log("Map clicked", e.latlng);
      console.log("isNearestMode value:", isNearestMode);
      if (isNearestMode) {
        console.log("Calling onMapClick", e.latlng);
        onMapClick(e.latlng);
      }
    },
  });

  useEffect(() => {
    if (isNearestMode) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [isNearestMode, map]);

  useEffect(() => {
    if (isNearestMode && clickedLocation && nearestWorkers && nearestWorkers.length > 0) {
      const bounds = L.latLngBounds([
        [clickedLocation.lat, clickedLocation.lng],
        ...nearestWorkers.map(w => [w.latitude, w.longitude])
      ]);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15, animate: true, duration: 1.5 });
    }
  }, [isNearestMode, clickedLocation, nearestWorkers, map]);

  if (!clickedLocation) return null;

  return (
    <>
      <Marker position={clickedLocation} icon={targetIcon}>
        <Popup className="rounded-xl shadow-lg border-0 overflow-hidden" autoPan={false}>
          <div className="font-bold text-violet-600 mb-1">Target Location</div>
          <div className="text-xs text-slate-500">
            {clickedLocation.lat.toFixed(5)}, {clickedLocation.lng.toFixed(5)}
          </div>
        </Popup>
      </Marker>

      {nearestWorkers.map((worker, index) => {
        const workerPos = [worker.latitude, worker.longitude];
        
        // High-contrast unified colors per rank: 1=Orange, 2=Purple, 3=Blue
        const colors = ['#f97316', '#8b5cf6', '#2563eb'];
        const color = colors[index] || '#8b5cf6';

        return (
          <React.Fragment key={`nearest-${worker.workerId}`}>
            {/* White outline for visibility over roads/terrain */}
            <Polyline
              positions={[clickedLocation, workerPos]}
              pathOptions={{
                color: '#ffffff',
                weight: 8,
                opacity: 0.7
              }}
            />
            {/* Main dashed polyline */}
            <Polyline
              positions={[clickedLocation, workerPos]}
              pathOptions={{
                color: color,
                weight: 4,
                dashArray: '10, 8',
                opacity: 0.9
              }}
            >
              <Tooltip permanent direction="center" className="bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-xs font-bold text-slate-700">
                {worker.distance.toFixed(2)} km
              </Tooltip>
            </Polyline>
          </React.Fragment>
        );
      })}
    </>
  );
}
