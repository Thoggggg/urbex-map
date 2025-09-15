import React from 'react';
import { Place, PlaceStatus } from '../types';
import { PlaceCard } from './PlaceCard';

// --- Component-Specific Constants ---
const FILTER_OPTIONS: (PlaceStatus | 'all')[] = ['all', 'visited', 'suggestion', 'inaccessible'];

const FILTER_STYLES: Record<PlaceStatus | 'all', string> = {
    all: 'border-indigo-400/50 text-indigo-400 hover:bg-indigo-400/20 data-[active=true]:bg-indigo-400/20 data-[active=true]:border-indigo-400',
    visited: 'border-green-500/50 text-green-400 hover:bg-green-500/20 data-[active=true]:bg-green-500/20 data-[active=true]:border-green-500',
    suggestion: 'border-amber-400/50 text-amber-400 hover:bg-amber-400/20 data-[active=true]:bg-amber-400/20 data-[active=true]:border-amber-400',
    inaccessible: 'border-red-500/50 text-red-400 hover:bg-red-500/20 data-[active=true]:bg-red-500/20 data-[active=true]:border-red-500',
};

// --- Component Props ---
interface PlaceListProps {
  places: Place[];
  selectedPlaceId: number | null;
  activeFilter: PlaceStatus | 'all';
  onSelectPlace: (id: number) => void;
  onFilterChange: (filter: PlaceStatus | 'all') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

// --- Sub-components for Clarity ---

const FilterBar = ({ activeFilter, onFilterChange }: { activeFilter: PlaceStatus | 'all', onFilterChange: (filter: PlaceStatus | 'all') => void }) => (
  <div className="p-4 border-b border-gray-700">
    <div className="flex items-center gap-3">
      {FILTER_OPTIONS.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          data-active={activeFilter === filter}
          className={`px-4 py-1.5 text-sm capitalize border rounded-full transition-colors duration-200 ${FILTER_STYLES[filter]}`}
        >
          {filter}
        </button>
      ))}
    </div>
  </div>
);

const SearchBar = ({searchTerm, onSearchChange}: {searchTerm: string, onSearchChange: (term: string) => void}) => (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <input
          type="search"
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#373c49] border border-gray-600 rounded-md p-2 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
        />
      </div>
    </div>
);

const NoPlacesMessage = () => (
  <div className="text-center text-gray-500 pt-10">
    <p>No places found.</p>
    <p className="text-sm mt-1">Try selecting a different filter.</p>
  </div>
);

// --- Main Component ---

/**
 * Renders the filterable list of discovered places.
 */
export const PlaceList: React.FC<PlaceListProps> = ({ 
  places, 
  selectedPlaceId, 
  activeFilter,
  onSelectPlace,
  onFilterChange,
  searchTerm,
  onSearchChange
}) => {
  return (
    <div>
      <FilterBar activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />

      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {places.length > 0 ? (
          places.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              isSelected={place.id === selectedPlaceId}
              onSelect={() => onSelectPlace(place.id)}
            />
          ))
        ) : (
          <NoPlacesMessage />
        )}
      </div>
    </div>
  );
};