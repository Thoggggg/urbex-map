import React from 'react';
import { Place } from '../types';


interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onSelect: () => void;
}


const statusStyles = {
  visited: {
    ring: 'ring-green-500',
    text: 'text-green-400',
    hover: 'group-hover:text-green-400',
  },
  suggestion: {
    ring: 'ring-amber-400',
    text: 'text-amber-400',
    hover: 'group-hover:text-amber-400',
  },
  inaccessible: {
    ring: 'ring-red-500',
    text: 'text-red-400',
    hover: 'group-hover:text-red-400',
  },
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, isSelected, onSelect }) => {
  const styles = statusStyles[place.status];

  const cardClasses = `relative flex flex-col gap-4 group cursor-pointer p-4 rounded-lg transition-all duration-300 ease-in-out ${
    isSelected ? `bg-gray-800 ring-2 ${styles.ring}` : 'hover:bg-gray-800/50'
  }`;

  return (
    <div
      id={`place-card-${place.id}`}
      className={cardClasses}
      onClick={() => onSelect(place)}
    >

      {place.status === 'visited' && (
        <div className="flex-shrink-0 w-full h-48">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      )}

      <div className="flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start">
            <p className={`text-sm font-bold uppercase tracking-wider ${styles.text}`}>{place.status}</p>
            {place.status === 'visited' && (
              <p className="text-sm text-gray-400">Visited: {place.visitedDate}</p>
            )}
          </div>
          <h3 className={`text-lg font-semibold text-gray-100 mt-1 transition-colors ${styles.hover}`}>
            {place.name}
          </h3>
          <p className="text-sm text-gray-400 mt-2 line-clamp-3">{place.description}</p>
        </div>
      </div>
    </div>
  );
};