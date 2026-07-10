import React, { useEffect, useRef } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-polylinedecorator';

// Custom Map Pin Icons using Leaflet divIcon
const createLabeledIcon = (label, bgColor) => L.divIcon({
  className: 'custom-labeled-marker',
  html: `<div style="
    background-color: ${bgColor}; 
    color: white; 
    font-weight: bold; 
    font-size: 10px; 
    padding: 2px 6px; 
    border-radius: 4px; 
    border: 2px solid white; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    white-space: nowrap;
    position: relative;
    top: -10px;
    left: -50%;
  ">${label}</div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  popupAnchor: [0, -15],
});

const startIcon = createLabeledIcon('START', '#10b981'); // Emerald 500
const endIcon = createLabeledIcon('END', '#f43f5e'); // Rose 500

export default function WorkerTrailMapLayer({ trailData, isVisible }) {
  const map = useMap();
  const layerGroupRef = useRef(null);

  useEffect(() => {
    // Clear previous raw leaflet layers if any
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }

    if (!isVisible || !trailData || trailData.coordinates.length === 0) {
      return;
    }

    // Map coordinates to Leaflet Polyline format [lat, lng]
    const polylinePositions = trailData.coordinates.map(coord => [coord.lat, coord.lng]);
    
    // Create a new LayerGroup
    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Create the Polyline
    const polyline = L.polyline(polylinePositions, {
      color: '#0ea5e9', // Sky 500
      weight: 4,
      opacity: 0.8,
    }).addTo(layerGroup);

    // Create Direction Arrows
    if (polylinePositions.length > 1) {
      L.polylineDecorator(polyline, {
        patterns: [
          {
            offset: '5%',
            repeat: '100px',
            symbol: L.Symbol.arrowHead({
              pixelSize: 12,
              polygon: false,
              pathOptions: { stroke: true, weight: 3, color: '#0ea5e9', opacity: 0.9 }
            })
          }
        ]
      }).addTo(layerGroup);
    }

    // Automatically fit bounds
    if (polylinePositions.length > 0) {
      map.fitBounds(polyline.getBounds(), { padding: [50, 50], maxZoom: 16, animate: true });
    }

    return () => {
      if (layerGroupRef.current) {
        layerGroupRef.current.clearLayers();
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
  }, [trailData, isVisible, map]);

  if (!isVisible || !trailData || trailData.coordinates.length === 0) {
    return null;
  }

  const polylinePositions = trailData.coordinates.map(coord => [coord.lat, coord.lng]);
  const startPoint = polylinePositions[0];
  const endPoint = polylinePositions[polylinePositions.length - 1];

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return {
      date: d.toLocaleDateString(),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  };

  const startInfo = formatDateTime(trailData.startTime);
  const endInfo = formatDateTime(trailData.endTime);

  return (
    <>
      {startPoint && (
        <Marker position={startPoint} icon={startIcon}>
          <Popup className="rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="font-medium text-slate-800">
              <div className="text-emerald-600 font-bold mb-1">START POINT</div>
              <div className="text-sm">Date: {startInfo.date}</div>
              <div className="text-sm">Time: {startInfo.time}</div>
            </div>
          </Popup>
        </Marker>
      )}
      
      {endPoint && polylinePositions.length > 1 && (
        <Marker position={endPoint} icon={endIcon}>
          <Popup className="rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="font-medium text-slate-800">
              <div className="text-rose-600 font-bold mb-1">END POINT</div>
              <div className="text-sm">Date: {endInfo.date}</div>
              <div className="text-sm">Time: {endInfo.time}</div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}
