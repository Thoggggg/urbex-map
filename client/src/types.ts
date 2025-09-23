import type { LatLngExpression } from 'leaflet';

export type PlaceStatus = 'visited' | 'suggestion' | 'inaccessible';

/**
 * A unified interface for a single Urbex location.
 * Contains all possible fields for any status.
 */
export interface Place {
  id: number;
  name: string;
  description: string;
  location: LatLngExpression;
  status: PlaceStatus;
  
  // Optional fields, primarily for 'visited' status
  imageUrl?: string | null;
  visitedDate?: string;
  
  // Optional field used only in the frontend form for file uploads
  picture?: File | null;
}