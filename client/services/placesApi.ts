import { Place } from '../types';
import type { LatLng } from 'leaflet';

const API_BASE_URL = 'http://localhost:3001';

/**
 * A helper function to handle API responses and errors.
 */
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  // For DELETE requests with 204 No Content, there is no body to parse.
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

/**
 * A helper to format the flat place data from the API into the nested structure the frontend uses.
 */
const formatPlace = (place: any): Place => ({
  ...place,
  location: { lat: place.lat, lng: place.lng },
});

export const getPlaces = async (): Promise<Place[]> => {
  const response = await fetch(`${API_BASE_URL}/api/places`);
  const places = await handleResponse(response);
  return places.map(formatPlace);
};

export const createPlace = async (location: LatLng, name: string): Promise<Place> => {
  const newPlaceData = {
    name,
    description: '',
    location: { lat: location.lat, lng: location.lng },
    status: 'suggestion',
  };
  const response = await fetch(`${API_BASE_URL}/api/places`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPlaceData),
  });
  const place = await handleResponse(response);
  return formatPlace(place);
};

export const updatePlace = async (id: number, updatedData: FormData): Promise<Place> => {
  const response = await fetch(`${API_BASE_URL}/api/places/${id}`, {
    method: 'PUT',
    body: updatedData,
  });
  const place = await handleResponse(response);
  return formatPlace(place);
};

export const deletePlace = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/places/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(response);
};