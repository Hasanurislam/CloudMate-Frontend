import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiTrash2, FiLogOut, FiUsers } from 'react-icons/fi';

export default function Sidebar({ onLogout, isOpen, setIsOpen }) {
  const location = useLocation();

  const sidebarClasses = `
    bg-white shadow-md flex flex-col transition-transform duration-300 ease-in-out
    md:w-64 md:translate-x-0 md:relative md:z-0
    fixed top-0 left-0 h-full z-40 w-64 
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
        {/* Overlay for mobile */}
        {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"></div>}

        <aside className={sidebarClasses}>
          <div className="p-6 text-3xl font-bold text-indigo-600 border-b">CloudMate</div>
          <nav className="flex-1 p-4 space-y-2">
            <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center p-2 rounded-lg ${location.pathname === '/' ? 'bg-indigo-100 text-gray-700 text-2xl' : 'text-gray-600 hover:bg-gray-200 text-xl'}`}>
              <FiGrid className="mr-3" /> My Files
            </Link>
            <Link to="/shared" onClick={() => setIsOpen(false)} className={`flex items-center p-2 rounded-lg ${location.pathname === '/shared' ? 'bg-indigo-100 text-gray-700 text-2xl' : 'text-gray-600 hover:bg-gray-200 text-xl'}`}>
              <FiUsers className="mr-3" /> Shared with me
            </Link>
            <Link to="/trash" onClick={() => setIsOpen(false)} className={`flex items-center p-2 rounded-lg ${location.pathname === '/trash' ? 'bg-indigo-100 text-gray-700 text-2xl' : 'text-gray-600 hover:bg-gray-200 text-xl'}`}>
              <FiTrash2 className="mr-3" /> Trash
            </Link>
          </nav>
          <div className="p-4 border-t">
            <button onClick={onLogout} className="w-full flex items-center p-2 text-gray-600 hover:bg-red-100 hover:text-red-700 rounded-lg text-xl cursor-pointer">
              <FiLogOut className="mr-3 text-2xl " /> Logout
            </button>
          </div>
        </aside>
    </>
  );
}