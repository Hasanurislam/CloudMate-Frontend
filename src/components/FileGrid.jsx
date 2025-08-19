import React, { useState, useRef, useEffect } from 'react';
import { FiFolder, FiMoreVertical, FiEdit, FiTrash2, FiShare2 } from 'react-icons/fi';
import { FileIcon, formatBytes } from '../utils/helpers.jsx';

const ContextMenu = ({ item, onRename, onDelete, onShare, onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} className="absolute top-8 right-0 bg-white rounded-md shadow-lg w-40 z-10 border">
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(item); onClose(); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <FiShare2 className="mr-2" /> Share
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(item); onClose(); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <FiEdit className="mr-2" /> Rename
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item); onClose(); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                <FiTrash2 className="mr-2" /> Move to Trash
            </a>
        </div>
    );
};

export default function FileGrid({ items, onItemClick, onRenameSubmit, onDeleteClick, onShareClick }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  const handleRenameClick = (item) => {
    setEditingItem(item.id);
    setName(item.name);
    setActiveMenu(null);
  };

  const handleRename = (e) => {
    e.preventDefault();
    const item = items.find(i => i.id === editingItem);
    onRenameSubmit(item, name);
    setEditingItem(null);
  };
  
  useEffect(() => {
    if (editingItem && inputRef.current) {
        inputRef.current.focus();
    }
  }, [editingItem]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {items.map(item => (
        <div key={item.id} onClick={() => editingItem !== item.id && onItemClick(item)} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-transform cursor-pointer">
          <div className="flex items-center justify-between mb-4 relative">
            <div className="text-2xl">
              {item.type === 'folder' ? <FiFolder className="text-yellow-500" /> : <FileIcon type={item.file_type} />}
            </div>
            <button className="text-gray-400 hover:text-gray-700 p-1 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}>
              <FiMoreVertical />
            </button>
            {activeMenu === item.id && (
                <ContextMenu 
                    item={item} 
                    onRename={handleRenameClick} 
                    onDelete={onDeleteClick} 
                    onShare={onShareClick}
                    onClose={() => setActiveMenu(null)} 
                />
            )}
          </div>
          {editingItem === item.id ? (
            <form onSubmit={handleRename}>
                <input 
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleRename}
                    className="w-full text-sm p-1 border rounded"
                />
            </form>
          ) : (
            <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
          )}
          <p className="text-sm text-gray-500">{formatBytes(item.size)}</p>
        </div>
      ))}
    </div>
  );
}