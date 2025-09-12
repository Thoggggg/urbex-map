
interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const LeftPanel: React.FC<SidePanelProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-gray-100 shadow-lg z-50">
      <div className="p-4">
        <button onClick={onClose} className="mb-4 text-gray-600">
          &times; Close
        </button>
        {children}
      </div>
    </div>
  );
};