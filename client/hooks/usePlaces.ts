import { useState, useMemo, useCallback, useEffect } from 'react';
import type { LatLng } from 'leaflet';
import { Place, PlaceStatus } from '../types';
import * as placesApi from '../services/placesApi'; // Import our new service

/**
 * A custom hook to manage all state and logic related to places.
 */
export const usePlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [tempLocation, setTempLocation] = useState<LatLng | null>(null);
  const [activeFilter, setActiveFilter] = useState<PlaceStatus | 'all'>('all');
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const fetchedPlaces = await placesApi.getPlaces();
        setPlaces(fetchedPlaces);
      } catch (err: any) {
        setError('Failed to load place data. Please ensure the server is running.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  
  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const filteredPlaces = useMemo(() => {
    const byStatus = places.filter(p => activeFilter === 'all' || p.status === activeFilter);
    
    // If there's no search term, return the result
    if (!searchTerm.trim()) {
      return byStatus;
    }
    
    // Otherwise, also filter by the search term (case-insensitive)
    return byStatus.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [places, activeFilter, searchTerm]);

  // --- Handlers ---

  const handleSelectPlace = useCallback((id: number) => {
    setIsAddingSpot(false);
    const newSelectedId = selectedPlaceId === id ? null : id;
    setSelectedPlaceId(newSelectedId);
    setTempLocation(null);
    setEditingPlace(newSelectedId ? places.find(p => p.id === newSelectedId) || null : null);
  }, [selectedPlaceId, places]);

  const handleMarkerDrag = (newLocation: LatLng) => setTempLocation(newLocation);
  
  const handleFilterChange = useCallback((filter: PlaceStatus | 'all') => {
    if (editingPlace && filter !== 'all' && editingPlace.status !== filter) {
      setEditingPlace(null);
      setSelectedPlaceId(null);
    }
    setActiveFilter(filter);
  }, [editingPlace]);
  
  const handleToggleAddMode = () => {
    setIsAddingSpot(prev => !prev);
    setSelectedPlaceId(null);
    setEditingPlace(null);
  };

  const handleAddSpot = async (location: LatLng, name: string) => {
    try {
      const newPlace = await placesApi.createPlace(location, name);
      setPlaces(current => [newPlace, ...current]);
      setIsAddingSpot(false);
      if (activeFilter !== 'all' && activeFilter !== 'suggestion') {
        setActiveFilter('all');
      }
      setEditingPlace(newPlace);
      setSelectedPlaceId(newPlace.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmEdit = async (updatedData: Partial<Place>) => {
    if (!editingPlace) return;
    const formData = new FormData();
    Object.entries(updatedData).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (tempLocation) {
        formData.append('location[lat]', tempLocation.lat.toString());
        formData.append('location[lng]', tempLocation.lng.toString());
    }
    if (updatedData.status === 'visited' && !updatedData.visitedDate) {
        formData.append('visitedDate', getTodayDateString());
    }
    
    try {
      const updatedPlace = await placesApi.updatePlace(editingPlace.id, formData);
      setPlaces(current => current.map(p => p.id === updatedPlace.id ? updatedPlace : p));
      setEditingPlace(null);
      setSelectedPlaceId(null);
      setTempLocation(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingPlace(null);
    setSelectedPlaceId(null);
    setTempLocation(null);
  };

  const handleDelete = async () => {
    if (!editingPlace) return;
    if (window.confirm(`Are you sure you want to delete "${editingPlace.name}"?`)) {
      try {
        await placesApi.deletePlace(editingPlace.id);
        setPlaces(current => current.filter(p => p.id !== editingPlace.id));
        setEditingPlace(null);
        setSelectedPlaceId(null);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  // Return all the state and functions the UI will need
  return {
    places,
    filteredPlaces,
    selectedPlaceId,
    editingPlace,
    tempLocation,
    activeFilter,
    searchTerm,
    setSearchTerm,
    isAddingSpot,
    isLoading,
    error,
    actions: {
      selectPlace: handleSelectPlace,
      markerDrag: handleMarkerDrag,
      filterChange: handleFilterChange,
      toggleAddMode: handleToggleAddMode,
      addSpot: handleAddSpot,
      confirmEdit: handleConfirmEdit,
      cancelEdit: handleCancelEdit,
      deletePlace: handleDelete,
    },
  };
};