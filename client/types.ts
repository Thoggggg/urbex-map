
export type PlaceStatus = 'visited' | 'suggestion' | 'inaccessible';

// Base properties common to all places
interface BasePlace {
  id: number;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
}

// Specific types for each status
export interface VisitedPlace extends BasePlace {
  status: 'visited';
  imageUrl: string;
  visitedDate: string;
}

export interface SuggestionPlace extends BasePlace {
  status: 'suggestion';
}

export interface InaccessiblePlace extends BasePlace {
  status: 'inaccessible';
}

// A union of all possible place types
export type Place = VisitedPlace | SuggestionPlace | InaccessiblePlace;
