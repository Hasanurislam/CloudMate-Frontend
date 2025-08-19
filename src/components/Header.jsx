import React from 'react';
import { FiSearch, FiPlus, FiUploadCloud, FiMenu, FiGrid, FiList } from 'react-icons/fi';

export default function Header({ user, onNewFolderClick, onUploadClick, onToggleSidebar, viewMode, setViewMode, sortOption, setSortOption, searchTerm, onSearchChange }) {
  return (
    <header className="bg-white  p-4 flex items-center justify-between">
      <div className="flex items-center">
        {/* Hamburger Menu for Mobile */}
        <button onClick={onToggleSidebar} className="md:hidden mr-4 text-gray-600">
            <FiMenu size={24} />
        </button>
       <div className="relative w-full max-w-xl mx-auto">
          <FiSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search in Drive" 
            className="w-full pl-12 pr-12 py-3 rounded-full border-2 border-transparent bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-gray-800">
            
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Sort Dropdown - Hidden on small screens */}
        <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)} 
            className="p-2 border rounded-md bg-gray-50 text-sm hidden sm:block"
        >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="date-desc">Date Modified (Newest)</option>
            <option value="date-asc">Date Modified (Oldest)</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center border rounded-md">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}><FiGrid /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}><FiList /></button>
        </div>

        {/* New Folder Button */}
        <button 
          onClick={onNewFolderClick}
          className="flex items-center bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FiPlus className="mr-0 md:mr-2" />
          <span className="hidden md:block">New Folder</span>
        </button>

        {/* Upload Button */}
        <button 
          onClick={onUploadClick}
          className="flex items-center bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiUploadCloud className="mr-0 md:mr-2" />
          <span className="hidden md:block">Upload</span>
        </button>
      </div>
    </header>
  );
}