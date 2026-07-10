import React, { useEffect, useRef } from 'react';
import { useMapEvents, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Target Marker Icon (Purple)
const targetIcon = L.divIcon({
  className: 'custom-labeled-marker',
  html: `<div style="
    background-color: #8b5cf6; 
    color: white; 
    font-weight: bold; 
    font-size: 16px; 
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%; 
    border: 2px solid white; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    position: relative;
    top: -12px;
    left: -12px;
  ">🎯</div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export default function NearestWorkerFinder({ 
  isNearestMode, 
  onMapClick, 
  clickedLocation, 
  nearestWorkers 
}) {
  console.log("NearestWorkerFinder mounted");
  
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
        
        // Use a different color for the absolute nearest
        const isClosest = index === 0;
        const color = isClosest ? '#eab308' : '#8b5cf6'; // Yellow-500 vs Violet-500

        return (
          <React.Fragment key={`nearest-${worker.workerId}`}>
            <Polyline
              positions={[clickedLocation, workerPos]}
              pathOptions={{
                color: color,
                weight: 2,
                dashArray: '5, 5',
                opacity: 0.8
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
