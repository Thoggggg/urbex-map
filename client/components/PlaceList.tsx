import React from 'react';
import { Place, PlaceStatus } from '../types';
import { PlaceCard } from './PlaceCard'; // Assuming PlaceCard is in the same folder

interface PlaceListProps {
  places: Place[];
  selectedPlaceId: number | null;
  activeFilter: PlaceStatus | 'all';
  
  // [THE FIX] These are the functions passed from App.tsx
  onSelectPlace: (id: number) => void;
  onFilterChange: (filter: PlaceStatus | 'all') => void;
}

const FILTERS: (PlaceStatus | 'all')[] = ['all', 'visited', 'suggestion', 'inaccessible'];

const filterStyles = {
    all: 'border-indigo-400/50 text-indigo-400 hover:bg-indigo-400/20 data-[active=true]:bg-indigo-400/20 data-[active=true]:border-indigo-400',
    visited: 'border-green-500/50 text-green-400 hover:bg-green-500/20 data-[active=true]:bg-green-500/20 data-[active=true]:border-green-500',
    suggestion: 'border-amber-400/50 text-amber-400 hover:bg-amber-400/20 data-[active=true]:bg-amber-400/20 data-[active=true]:border-amber-400',
    inaccessible: 'border-red-500/50 text-red-400 hover:bg-red-500/20 data-[active=true]:bg-red-500/20 data-[active=true]:border-red-500',
};

export const PlaceList: React.FC<PlaceListProps> = ({ 
  places, 
  selectedPlaceId, 
  activeFilter,
  onSelectPlace,
  onFilterChange 
}) => {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header with Filters */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              data-active={activeFilter === filter}
              className={`px-4 py-1.5 text-sm capitalize border rounded-full transition-colors duration-200 ${filterStyles[filter]}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* List of Places */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {places.length > 0 ? (
          places.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              isSelected={place.id === selectedPlaceId}
              // [THE FIX] This connects the card's click to the App's handler.
              // Note the adapter: PlaceCard expects the full `place` object, but App.tsx works with `id`.
              // We will adjust PlaceCard to simplify this.
              onSelect={() => onSelectPlace(place.id)}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 pt-10">
            No places found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};