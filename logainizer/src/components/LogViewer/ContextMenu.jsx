import React from 'react';
import { Copy } from 'lucide-react';

const ContextMenu = ({ x, y, onClose, onCopySelected, onCopySingle, isSingleLog }) => {
  return (
    <div 
      className="absolute bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50"
      style={{ top: `${y}px`, left: `${x}px` }}
      onMouseLeave={onClose}
    >
      {!isSingleLog && (
        <button
          className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center text-gray-200"
          onClick={onCopySelected}
        >
          <Copy size={16} className="mr-2" />
          Copy Selected Logs
        </button>
      )}
      <button
        className="w-full text-left px-4 py-2 hover:bg-gray-700 flex items-center text-gray-200"
        onClick={onCopySingle}
      >
        <Copy size={16} className="mr-2" />
        Copy This Log
      </button>
    </div>
  );
};

export default React.memo(ContextMenu);