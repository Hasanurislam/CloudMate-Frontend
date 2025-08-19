import React, { useEffect, useRef } from 'react';

export default function NewFolderModal({ show, onClose, folderName, setFolderName, onSubmit }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select the default text
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-xl text-gray-800 mb-4">New folder</h2>
        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full p-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none transition-colors mb-6"
          />
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded text-blue-600 font-medium hover:bg-blue-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded text-blue-600 font-medium hover:bg-blue-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
