import React, { useState } from 'react';

// --- Type Definitions ---
type PlaceStatus = 'visited' | 'suggestion' | 'inaccessible';
interface Place {
  name: string;
  description: string;
  status: PlaceStatus;
  picture?: File | null;
  visitedDate?: string;
}

// --- Component Props Interface ---
interface EditCardProps {
  onConfirm: (data: Partial<Place>) => void;
  onCancel: () => void;
  onDelete: () => void;
  initialData?: Partial<Place>;
}

// --- Constants & Helpers ---
const FILTERS: PlaceStatus[] = ['visited', 'suggestion', 'inaccessible'];
const filterStyles: Record<PlaceStatus, string> = {
    visited: 'border-green-500/50 text-green-400 hover:bg-green-500/20 data-[active=true]:bg-green-500/20 data-[active=true]:border-green-500',
    suggestion: 'border-amber-400/50 text-amber-400 hover:bg-amber-400/20 data-[active=true]:bg-amber-400/20 data-[active=true]:border-amber-400',
    inaccessible: 'border-red-500/50 text-red-400 hover:bg-red-500/20 data-[active=true]:bg-red-500/20 data-[active=true]:border-red-500',
};
const getTodayDateString = () => new Date().toISOString().split('T')[0];

// --- The React Component ---
export const EditCard: React.FC<EditCardProps> = ({ 
  onConfirm, onCancel, onDelete, initialData = {} 
}) => {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [activeTag, setActiveTag] = useState<PlaceStatus>(initialData.status || 'suggestion');
  const [visitedDate, setVisitedDate] = useState(initialData.visitedDate || getTodayDateString());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleTagClick = (tag: PlaceStatus) => {
    setActiveTag(tag);
    if (tag === 'visited' && !visitedDate) {
        setVisitedDate(getTodayDateString());
    }
  };

  const handleConfirm = () => {
    const formData: Partial<Place> = {
      name,
      description,
      status: activeTag,
      picture: selectedFile, // The selected file is included here
    };
    if (activeTag === 'visited') {
      formData.visitedDate = visitedDate;
    }
    onConfirm(formData);
  };
  
  return (
    <div className="bg-[#2c303a] p-6 rounded-lg w-full h-full text-gray-200 font-sans flex flex-col">
      <div className="flex-grow flex flex-col gap-4 overflow-y-auto">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-300">Name</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#373c49] border border-gray-600 rounded-md p-2" />
        </div>
        {/* Description Textarea */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-300">Description</label>
          <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#373c49] border border-gray-600 rounded-md p-2 resize-none" />
        </div>
        {/* Tags */}
        <div>
           <label className="block text-sm font-medium mb-2 text-gray-300">Tag</label>
           <div className="flex items-center gap-3">
            {FILTERS.map((tag) => (
              <button key={tag} onClick={() => handleTagClick(tag)} data-active={activeTag === tag} className={`px-4 py-1 text-sm capitalize border rounded-full transition-colors duration-200 ${filterStyles[tag]}`}>
                {tag}
              </button>
            ))}
           </div>
        </div>
        {/* Visited Date - Conditional */}
        {activeTag === 'visited' && (
          <div>
            <label htmlFor="visitedDate" className="block text-sm font-medium mb-1 text-gray-300">Visited Date</label>
            <input type="date" id="visitedDate" value={visitedDate} onChange={(e) => setVisitedDate(e.target.value)} className="w-full bg-[#373c49] border border-gray-600 rounded-md p-2" />

        {/* The JSX for the picture input */}
          <label className="block text-sm font-medium mb-1 text-gray-300">Picture</label>
          <div className="flex items-center gap-4">
            <label htmlFor="picture-upload" className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors">
              Browse...
            </label>
            <input id="picture-upload" type="file" className="hidden" onChange={handleFileChange} />
            <span className="text-gray-400 text-sm truncate">{selectedFile ? selectedFile.name : 'No file selected.'}</span>
          </div>
        </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-700/50 p-3 rounded-lg mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>You can drag the marker on the map to move this location.</span>
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex justify-between items-center mt-6 pt-4 border-t border-gray-700/50">
        <button onClick={onDelete} className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 font-semibold">
          Delete
        </button>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="bg-gray-500/80 text-white px-5 py-2 rounded-md hover:bg-gray-600 font-semibold">
            Cancel
          </button>
          <button onClick={handleConfirm} className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 font-semibold">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};