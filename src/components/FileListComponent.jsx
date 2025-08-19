import React, { useState, useRef, useEffect } from 'react';
import { FiFolder, FiMoreVertical, FiEdit, FiTrash2, FiShare2 } from 'react-icons/fi';
import { FileIcon, formatBytes } from '../utils/helpers.jsx';

// Context Menu Component (same as in FileGrid)
const ContextMenu = ({ item, onRename, onDelete, onShare, onClose }) => {
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} className="absolute top-8 right-0 bg-white rounded-md shadow-lg w-40 z-10 border">
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(item); onClose(); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FiShare2 className="mr-2" /> Share</a>
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(item); onClose(); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><FiEdit className="mr-2" /> Rename</a>
            <a href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item); onClose(); }} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"><FiTrash2 className="mr-2" /> Move to Trash</a>
        </div>
    );
};

export default function FileListComponent({ items, onItemClick, onRenameSubmit, onDeleteClick, onShareClick }) {
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
        <div className="space-y-2">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-gray-500 border-b">
                <div className="col-span-7 md:col-span-6">Name</div>
                <div className="col-span-3 hidden md:block">Date Modified</div>
                <div className="col-span-2 hidden md:block">File Size</div>
                <div className="col-span-1"></div> {/* For actions button */}
            </div>
            {/* Item Rows */}
            {items.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => editingItem !== item.id && onItemClick(item)} 
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                    <div className="col-span-7 md:col-span-6 flex items-center">
                        <div className="text-xl mr-3 flex-shrink-0">
                            {item.type === 'folder' ? <FiFolder className="text-yellow-500" /> : <FileIcon type={item.file_type} />}
                        </div>
                        {editingItem === item.id ? (
                            <form onSubmit={handleRename} className="w-full">
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
                            <span className="truncate">{item.name}</span>
                        )}
                    </div>
                    <div className="col-span-3 text-gray-600 hidden md:block">
                        {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 text-gray-600 hidden md:block">
                        {formatBytes(item.size)}
                    </div>
                    <div className="col-span-1 text-right relative">
                        <button className="text-gray-400 hover:text-gray-700 p-1 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === item.id ? null : item.id); }}>
                            <FiMoreVertical />
                        </button>
                        {activeMenu === item.id && (
                            <ContextMenu item={item} onRename={handleRenameClick} onDelete={onDeleteClick} onShare={onShareClick} onClose={() => setActiveMenu(null)} />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
