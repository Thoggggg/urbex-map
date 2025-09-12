import React, { useState, useMemo, useCallback, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from 'leaflet';
import { PlaceList } from './components/PlaceList';
// import { LeftPanel } from './components/LeftPanel'; // This and EditCard appear to be unused, can be removed
import { Map } from './components/Map';
import { UrbexIcon } from './components/icons';
import { Place, PlaceStatus } from './types';
import { EditCard } from './components/EditCard';

// CHANGED: The port must be 3001 to point to your backend API, not the database.
const API_BASE_URL = 'http://localhost:3001';

interface AppHeaderProps {
  isAddingSpot: boolean;
  onToggleAddMode: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ isAddingSpot, onToggleAddMode }) => (
  <header className="border-b border-gray-700 sticky top-0 bg-gray-900 z-20">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2 text-amber-400">
        <UrbexIcon className="w-8 h-8"/>
        <span className="text-xl font-bold text-gray-100">Urbex Logs</span>
      </div>
      <div className="flex items-center space-x-6">
        <button 
          onClick={onToggleAddMode}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isAddingSpot 
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-amber-400 hover:bg-amber-500 text-gray-900'
          }`}
        >
          {isAddingSpot ? 'Cancel' : 'Add Spot'}
        </button>
      </div>
    </div>
  </header>
);
// In client/src/App.tsx

const App: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  
  // [MOVE FEATURE] Add state to hold the marker's temporary, unconfirmed position
  const [tempLocation, setTempLocation] = useState<LatLng | null>(null);

  const [activeFilter, setActiveFilter] = useState<PlaceStatus | 'all'>('all');
  const [isAddingSpot, setIsAddingSpot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching (No changes here) ---
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/places`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const placesFromApi = await response.json();
        const formattedPlaces: Place[] = placesFromApi.map((p: any) => ({
            ...p,
            location: { lat: p.lat, lng: p.lng }
        }));
        setPlaces(formattedPlaces);
      } catch (err: any) {
        setError('Failed to load place data from the server. Is the backend running?');
        console.error(err);
      } finally { setIsInitialLoad(false); }
    };
    loadPlaces();
  }, []);

  // --- State Handlers (No changes here) ---
  const handleSelectPlace = useCallback((id: number) => {
    if (isAddingSpot) setIsAddingSpot(false);
    const newSelectedId = selectedPlaceId === id ? null : id;
    setSelectedPlaceId(newSelectedId);
    
    // [MOVE FEATURE] Reset temp location when selecting a new place or deselecting
    setTempLocation(null);

    if (newSelectedId) {
        const placeToEdit = places.find(p => p.id === newSelectedId);
        setEditingPlace(placeToEdit || null);
    } else {
        setEditingPlace(null);
    }
  }, [isAddingSpot, selectedPlaceId, places]);

    // [MOVE FEATURE] Create a handler to update the temporary location state
    const handleMarkerDrag = (newLocation: LatLng) => {
      setTempLocation(newLocation);
    };
  
  const filteredPlaces = useMemo(() => {
    if (activeFilter === 'all') return places;
    return places.filter(p => p.status === activeFilter);
  }, [places, activeFilter]);

  const handleFilterChange = useCallback((filter: PlaceStatus | 'all') => {
    if (selectedPlaceId) {
        const selectedPlace = places.find(p => p.id === selectedPlaceId);
        if (selectedPlace && filter !== 'all' && selectedPlace.status !== filter) {
            setSelectedPlaceId(null);
            setEditingPlace(null);
        }
    }
    setActiveFilter(filter);
  }, [selectedPlaceId, places]);

  const handleToggleAddMode = useCallback(() => {
    setIsAddingSpot(prev => !prev);
    setSelectedPlaceId(null);
    setEditingPlace(null);
  }, []);

  // --- API Call Handlers ---
  const handleAddSpot = useCallback(async (location: LatLng, name: string) => { /* ... */ }, [activeFilter]);

  const handleConfirmEdit = async (updatedData: Partial<Place>) => {
    if (!editingPlace) return;

    const formData = new FormData();
    formData.append('name', updatedData.name || '');
    formData.append('description', updatedData.description || '');
    formData.append('status', updatedData.status || 'suggestion');
    if (updatedData.status === 'visited') {
      formData.append('visitedDate', updatedData.visitedDate || getTodayDateString());
    }
    if (updatedData.picture) {
      formData.append('picture', updatedData.picture);
    }
    
    // [MOVE FEATURE] If there is a temporary location, add it to the form data
    if (tempLocation) {
      formData.append('location[lat]', tempLocation.lat.toString());
      formData.append('location[lng]', tempLocation.lng.toString());
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/places/${editingPlace.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update place.');
      const updatedPlaceFromApi = await response.json();
      const formattedPlace: Place = { ...updatedPlaceFromApi, location: { lat: updatedPlaceFromApi.lat, lng: updatedPlaceFromApi.lng }};
      setPlaces(currentPlaces => currentPlaces.map(p => p.id === editingPlace.id ? formattedPlace : p));
      
      // [MOVE FEATURE] Reset temp location on success
      setTempLocation(null);
      setEditingPlace(null);
      setSelectedPlaceId(null);
    } catch (error) { console.error("Failed to update place:", error); setError("Could not update place."); }
  };

  const handleCancelEdit = () => {
    // [MOVE FEATURE] Reset temp location on cancel
    setTempLocation(null);
    setEditingPlace(null);
    setSelectedPlaceId(null);
  };

  // [FULLY IMPLEMENTED] This function handles the "Delete" button.
  const handleDelete = async () => {
    if (!editingPlace) return;

    // Show a confirmation dialog before proceeding
    if (window.confirm(`Are you sure you want to delete "${editingPlace.name}"?`)) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/places/${editingPlace.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete place on the server.');
            
            // Remove the place from our local state
            setPlaces(currentPlaces => currentPlaces.filter(p => p.id !== editingPlace.id));

            // Exit editing mode
            setEditingPlace(null);
            setSelectedPlaceId(null);

        } catch (error) {
            console.error("Failed to delete place:", error);
            setError("Could not delete the place. Please try again.");
        }
    }
  };

  // --- Render Logic (No changes here) ---
  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-red-400">
        <h2 className="text-2xl font-bold mb-4">An Error Occurred</h2>
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-500">Please make sure your backend server is running.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <AppHeader isAddingSpot={isAddingSpot} onToggleAddMode={handleToggleAddMode} />
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <section className="col-span-12 lg:col-span-5 xl:col-span-4 overflow-y-auto">
          {editingPlace ? (
            <EditCard
              key={editingPlace.id}
              initialData={editingPlace}
              onConfirm={handleConfirmEdit}
              onCancel={handleCancelEdit}
              onDelete={handleDelete}
            />
          ) : (
            <PlaceList
              places={filteredPlaces}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={handleSelectPlace}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          )}
        </section>
        <section className="hidden lg:block lg:col-span-7 xl:col-span-8">
          <Map
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={handleSelectPlace}
            isAddingSpot={isAddingSpot}
            onAddSpot={handleAddSpot}
            tempLocation={tempLocation}
            onMarkerDrag={handleMarkerDrag}
          />
        </section>
      </main>
    </div>
  );
};

export default App;

