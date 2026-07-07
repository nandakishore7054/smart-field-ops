import React, { useEffect, useRef } from 'react';
import { useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

export default function GeofenceEditor({ 
  geofences = [], 
  onGeofenceCreated,
  onGeofenceEdited,
  onGeofenceDeleted,
  selectedGeofenceId,
  onSelectGeofence
}) {
  const map = useMap();
  const featureGroupRef = useRef(null);
  const drawControlRef = useRef(null);
  const layerIdToGeofenceId = useRef({});
  const geofenceIdToLayerId = useRef({});

  useEffect(() => {
    if (!featureGroupRef.current || !map) return;
    
    // Initialize Draw Control if not exists
    if (!drawControlRef.current) {
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: featureGroupRef.current,
          remove: true
        },
        draw: {
          polygon: {
            allowIntersection: false,
            drawError: { color: '#e1e100', message: '<strong>Oh snap!<strong> you can\'t draw that!' },
            shapeOptions: { color: '#0ea5e9' }
          },
          // Disable all other drawing tools as per requirements
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        }
      });
      map.addControl(drawControl);
      drawControlRef.current = drawControl;
    }

    const onDrawCreated = (e) => {
      const layer = e.layer;
      featureGroupRef.current.addLayer(layer);
      
      const geojson = layer.toGeoJSON();
      // Ensure we extract polygon coordinates
      if (geojson.geometry.type === 'Polygon') {
        onGeofenceCreated({
          type: 'polygon',
          boundary: {
            type: 'Polygon',
            coordinates: geojson.geometry.coordinates
          }
        });
      }
      
      // Remove immediately until saved by parent
      featureGroupRef.current.removeLayer(layer);
    };

    const onDrawEdited = (e) => {
      const layers = e.layers;
      const updates = [];
      layers.eachLayer(layer => {
        const id = layer._leaflet_id;
        const geofenceId = layerIdToGeofenceId.current[id];
        if (geofenceId) {
          const geojson = layer.toGeoJSON();
          updates.push({
            id: geofenceId,
            boundary: {
              type: 'Polygon',
              coordinates: geojson.geometry.coordinates
            }
          });
        }
      });
      if (updates.length > 0 && onGeofenceEdited) {
        onGeofenceEdited(updates);
      }
    };

    const onDrawDeleted = (e) => {
      const layers = e.layers;
      const deletedIds = [];
      layers.eachLayer(layer => {
        const id = layer._leaflet_id;
        const geofenceId = layerIdToGeofenceId.current[id];
        if (geofenceId) deletedIds.push(geofenceId);
      });
      if (deletedIds.length > 0 && onGeofenceDeleted) {
        onGeofenceDeleted(deletedIds);
      }
    };

    map.on(L.Draw.Event.CREATED, onDrawCreated);
    map.on(L.Draw.Event.EDITED, onDrawEdited);
    map.on(L.Draw.Event.DELETED, onDrawDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, onDrawCreated);
      map.off(L.Draw.Event.EDITED, onDrawEdited);
      map.off(L.Draw.Event.DELETED, onDrawDeleted);
    };
  }, [map, onGeofenceCreated, onGeofenceEdited, onGeofenceDeleted]);

  // Sync geofences to map
  useEffect(() => {
    if (!featureGroupRef.current) return;
    const fg = featureGroupRef.current;
    
    // Clear existing
    fg.clearLayers();
    layerIdToGeofenceId.current = {};
    geofenceIdToLayerId.current = {};

    geofences.forEach(gf => {
      if (gf.type === 'polygon' && gf.boundary?.coordinates) {
        // Convert to Leaflet structure
        const geojson = {
          type: 'Feature',
          properties: { id: gf._id },
          geometry: {
            type: 'Polygon',
            coordinates: gf.boundary.coordinates
          }
        };

        const layer = L.geoJSON(geojson, {
          style: {
            color: selectedGeofenceId === gf._id ? '#ef4444' : '#0ea5e9',
            weight: selectedGeofenceId === gf._id ? 4 : 2,
            fillOpacity: selectedGeofenceId === gf._id ? 0.3 : 0.1
          },
          onEachFeature: (feature, l) => {
            l.on('click', () => {
              if (onSelectGeofence) onSelectGeofence(gf._id);
            });
            l.bindTooltip(gf.name || 'Geofence', { permanent: false, direction: 'center' });
          }
        });
        
        // Add each internal polygon layer to feature group
        layer.eachLayer(l => {
          fg.addLayer(l);
          layerIdToGeofenceId.current[l._leaflet_id] = gf._id;
          geofenceIdToLayerId.current[gf._id] = l._leaflet_id;
        });
      }
    });
  }, [geofences, selectedGeofenceId, onSelectGeofence]);

  return <FeatureGroup ref={featureGroupRef} />;
}
