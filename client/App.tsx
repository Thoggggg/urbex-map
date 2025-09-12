import React from 'react';
import 'leaflet/dist/leaflet.css';
import { PlaceList } from './components/PlaceList';
import { Map } from './components/Map';
import { UrbexIcon } from './components/icons';
import { EditCard } from './components/EditCard';
import { usePlaces } from './hooks/usePlaces'; // Import our new hook

/**

    The main header for the application.
    */
const AppHeader: React.FC<{ isAddingSpot: boolean; onToggleAddMode: () => void; }> = ({ isAddingSpot, onToggleAddMode }) => (

  <header className="border-b border-gray-700 sticky top-0 bg-gray-900 z-20">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2 text-amber-400">
        <UrbexIcon className="w-8 h-8" />
        <span className="text-xl font-bold text-gray-100">Urbex Logs</span>
      </div>
      <button
        onClick={onToggleAddMode}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${isAddingSpot
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-amber-400 hover:bg-amber-500 text-gray-900'
          }`}
      >
        {isAddingSpot ? 'Cancel' : 'Add Spot'}
      </button>
    </div>
  </header>
);

/**

    A simple loading screen component.
    */
const LoadingScreen = () => <div>Loading...</div>;

/**

    A component to display critical errors.
    */
const ErrorScreen = ({ message }: { message: string }) => (

  <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-red-400">
    <h2 className="text-2xl font-bold mb-4">An Error Occurred</h2>
    <p>{message}</p>
  </div>
);

/**

    The root component of the application.
    */
const App: React.FC = () => {
  const {
    filteredPlaces,
    selectedPlaceId,
    editingPlace,
    tempLocation,
    activeFilter,
    isAddingSpot,
    isLoading,
    error,
    actions,
  } = usePlaces();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <AppHeader isAddingSpot={isAddingSpot} onToggleAddMode={actions.toggleAddMode} />
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <section className="col-span-12 lg:col-span-5 xl:col-span-4 overflow-y-auto">
          {editingPlace ? (
            <EditCard
              key={editingPlace.id}
              initialData={editingPlace}
              onConfirm={actions.confirmEdit}
              onCancel={actions.cancelEdit}
              onDelete={actions.deletePlace}
            />
          ) : (
            <PlaceList
              places={filteredPlaces}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={actions.selectPlace}
              activeFilter={activeFilter}
              onFilterChange={actions.filterChange}
            />
          )}
        </section>
        <section className="hidden lg:block lg:col-span-7 xl:col-span-8">
          <Map
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            onSelectPlace={actions.selectPlace}
            isAddingSpot={isAddingSpot}
            onAddSpot={actions.addSpot}
            tempLocation={tempLocation}
            onMarkerDrag={actions.markerDrag}
          />
        </section>
      </main>
    </div>
  );
};

export default App;