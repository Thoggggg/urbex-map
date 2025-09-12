import React from 'react';
import { Place } from '../types';

// --- Component-Specific Constants ---
const STATUS_STYLES = {
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

// --- Component Props ---
interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onSelect: () => void;
}

// --- Sub-components for Clarity ---

const CardImage = ({ imageUrl, name }: { imageUrl?: string | null; name: string }) => {
  if (!imageUrl) return null;
  
  return (
    <div className="flex-shrink-0 w-full h-48">
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover rounded-xl"
        loading="lazy" // Improves performance for long lists
      />
    </div>
  );
};

const CardHeader = ({ status, visitedDate, styleClasses }: { status: Place['status']; visitedDate?: string; styleClasses: { text: string } }) => (
  <div className="flex justify-between items-start">
    <p className={`text-sm font-bold uppercase tracking-wider ${styleClasses.text}`}>{status}</p>
    {status === 'visited' && visitedDate && (
      <p className="text-sm text-gray-400">Visited: {visitedDate}</p>
    )}
  </div>
);

const CardBody = ({ name, description, styleClasses }: { name: string; description: string; styleClasses: { hover: string } }) => (
  <>
    <h3 className={`text-lg font-semibold text-gray-100 mt-1 transition-colors ${styleClasses.hover}`}>
      {name}
    </h3>
    <p className="text-sm text-gray-400 mt-2 line-clamp-3">{description}</p>
  </>
);

// --- Main Component ---

/**
 * A card that displays a summary of a single place.
 * It changes appearance based on its status and selection state.
 */
export const PlaceCard: React.FC<PlaceCardProps> = ({ place, isSelected, onSelect }) => {
  const { name, description, status, imageUrl, visitedDate } = place;
  const styleClasses = STATUS_STYLES[status];

  // Build the dynamic classes for the main container.
  const cardClasses = `relative flex flex-col gap-4 group cursor-pointer p-4 rounded-lg transition-all duration-300 ease-in-out ${
    isSelected ? `bg-gray-800 ring-2 ${styleClasses.ring}` : 'hover:bg-gray-800/50'
  }`;

  return (
    <div
      id={`place-card-${place.id}`}
      className={cardClasses}
      onClick={onSelect} // [Refactor] No need for an anonymous function here.
    >
      <CardImage imageUrl={imageUrl} name={name} />
      
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <CardHeader status={status} visitedDate={visitedDate} styleClasses={styleClasses} />
          <CardBody name={name} description={description} styleClasses={styleClasses} />
        </div>
      </div>
    </div>
  );
};