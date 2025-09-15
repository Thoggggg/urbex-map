import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import type { LatLng, Marker as LeafletMarker } from 'leaflet';
import L from 'leaflet';
import { Place, PlaceStatus } from '../types';

interface MapProps {
  places: Place[];
  selectedPlaceId: number | null;
  onSelectPlace: (id: number) => void;
  isAddingSpot: boolean;
  onAddSpot: (location: LatLng, name: string) => void;
  tempLocation: LatLng | null;
  onMarkerDrag: (location: LatLng) => void;
}

// [THE FIX - STEP 1] Modify the icon generator to include an SVG animation tag
const getIconByStatus = (status: PlaceStatus, isSelected: boolean) => {
  const statusColors: Record<PlaceStatus, string> = {
    visited: '#22c55e',
    suggestion: '#f59e0b',
    inaccessible: '#ef4444',
  };
  const color = statusColors[status] || '#808080';

  // The animation tag is only added if `isSelected` is true.
  const animationTag = isSelected ? `
    <animateTransform
      attributeName="transform"
      type="translate"
      values="0 0; 0 -4; 0 0"
      begin="0s"
      dur="1.5s"
      repeatCount="indefinite"
      keyTimes="0; 0.5; 1"
      additive="sum"
    />` : '';

  const markerSvg = `
    <svg viewBox="-4 -4 32 32" width="32" height="32" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5));">
      <g>
        ${animationTag}
        <path fill="${color}" d="M12 0C7.589 0 4 3.589 4 8c0 4.411 8 16 8 16s8-11.589 8-16c0-4.411-3.589-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        <circle fill="#ffffff" cx="12" cy="8" r="2"/>
      </g>
    </svg>
  `;

  return L.divIcon({
    html: markerSvg,
    className: '', // No external CSS needed, so we can clear this
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};


/**
 * A helper component that recenters the map when the selected place changes.
 */
const RecenterAutomatically = ({lat, lng}: {lat: number, lng: number}) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

/**
 * A component to handle map click events for adding new spots.
 */
const MapClickHandler = ({ isAddingSpot, onAddSpot }: { isAddingSpot: boolean, onAddSpot: MapProps['onAddSpot'] }) => {
  useMapEvents({
    click(e) {
      if (isAddingSpot) {
        const name = window.prompt("Enter a name for the new spot:");
        if (name) {
          onAddSpot(e.latlng, name);
        }
      }
    },
  });
  return null;
}

// This new component will solve the sizing issue.
const ResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    // This function tells the map to re-evaluate its size.
    // We run it after a short delay to ensure the parent container has resized.
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100); // 100ms delay is usually enough

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [map]); // Rerun if the map instance changes

  return null;
};

const DraggableMarker = ({ place, isSelected, position, onSelect, onDragEnd }: {
  place: Place,
  isSelected: boolean,
  position: [number, number], // Use the correctly typed position prop
  onSelect: () => void,
  onDragEnd: (location: LatLng) => void
}) => {
  const markerRef = useRef<LeafletMarker>(null);
  
  // This effect ensures the icon is re-created when the selection state changes, thus restarting the animation.
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(getIconByStatus(place.status, isSelected));
    }
  }, [isSelected, place.status]);

  return (
    <Marker
      ref={markerRef}
      key={place.id}
      position={position}
      icon={getIconByStatus(place.status, isSelected)}
      draggable={isSelected}
      eventHandlers={{
        click: onSelect,
        dragend: (e) => onDragEnd(e.target.getLatLng()),
      }}
    >
      <Popup>{place.name}</Popup>
    </Marker>
  );
};


// --- Main Map Component ---
export const Map: React.FC<MapProps> = ({ 
  places, 
  selectedPlaceId, 
  onSelectPlace, 
  isAddingSpot, 
  onAddSpot,
  tempLocation,
  onMarkerDrag
}) => {
  const selectedPlace = places.find(p => p.id === selectedPlaceId);
  
  // Default center for the map container
  const mapCenter: [number, number] = selectedPlace 
    ? [selectedPlace.location.lat, selectedPlace.location.lng] 
    : [51.505, -0.09];

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={selectedPlace ? 13 : 5} 
      scrollWheelZoom={true} 
      className={`h-full w-full z-10 ${isAddingSpot ? 'cursor-crosshair' : ''}`}
    >
      <ResizeHandler />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {places.map(place => {
        const isSelected = place.id === selectedPlaceId;

        // [THE FIX] Ensure the marker's position is always a valid LatLngTuple [number, number]
        const markerPosition: [number, number] = (isSelected && tempLocation)
          ? [tempLocation.lat, tempLocation.lng]
          : [place.location.lat, place.location.lng];
        
        return (
          <DraggableMarker
            key={place.id}
            place={place}
            isSelected={isSelected}
            // Pass the correctly typed position to the sub-component
            position={markerPosition}
            onSelect={() => onSelectPlace(place.id)}
            onDragEnd={onMarkerDrag}
          />
        )
      })}

      {selectedPlace && <RecenterAutomatically lat={selectedPlace.location.lat} lng={selectedPlace.location.lng} />}
      <MapClickHandler isAddingSpot={isAddingSpot} onAddSpot={onAddSpot} />
    </MapContainer>
  );
};