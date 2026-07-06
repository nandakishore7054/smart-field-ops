import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not resolving correctly with Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * LiveMap component serving as the base infrastructure for Milestone 4.
 * Fills the parent container (100% width/height).
 * Includes OpenStreetMap tiles, zoom, and pan support.
 */
export default function LiveMap({
  center = [37.7749, -122.4194], // Default to SF
  zoom = 13,
  children,
  className = '',
  style = {}
}) {
  return (
    <div className={`w-full h-full relative ${className}`} style={{ minHeight: '400px', ...style }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Child components like markers, polygons, heatmaps will be injected here in later milestones */}
        {children}
      </MapContainer>
    </div>
  );
}
