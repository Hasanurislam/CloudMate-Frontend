import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { FileIcon, formatBytes } from '../utils/helpers.jsx';
import { FiFolder, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import newRequest from '../utils/newRequest'; // 1. Import newRequest

// Confirmation Modal Component
const ConfirmDeleteModal = ({ item, onClose, onDelete }) => {
    if (!item) return null;
    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl text-gray-800 mb-4">Delete forever?</h2>
                <p className="text-gray-600 mb-6">
                    "{item.name}" will be deleted forever. This can't be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 rounded text-blue-600 font-medium hover:bg-blue-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onDelete(item)} 
                        className="px-4 py-2 rounded bg-red-600 text-white font-medium hover:bg-red-700"
                    >
                        Delete forever
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Trash() {
    const [trashedItems, setTrashedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchTrashedItems = useCallback(async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

        try {
            const response = await newRequest.get('/files/trash', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            setTrashedItems(response.data);
        } catch (error) {
            console.error("Error fetching trash:", error);
            toast.error("Could not load trash items.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTrashedItems();
    }, [fetchTrashedItems]);

    const handleRestore = async (item) => {
        const { data: { session } } = await supabase.auth.getSession();
        const itemType = item.type;

        try {
            await newRequest.post(`/files/${itemType}/${item.id}/restore`, {}, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            toast.success(`"${item.name}" restored successfully.`);
            fetchTrashedItems();
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handlePermanentDelete = async (item) => {
        const { data: { session } } = await supabase.auth.getSession();
        const itemType = item.type;

        try {
            await newRequest.delete(`/files/${itemType}/${item.id}/permanent`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            setItemToDelete(null);
            toast.success(`"${item.name}" permanently deleted.`);
            fetchTrashedItems();
        } catch (error) {
            console.error("Permanent delete error:", error);
            toast.error(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar onLogout={() => supabase.auth.signOut()} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6">Trash</h1>
                    {loading ? (
                        <p className="text-center text-gray-500">Loading trash...</p>
                    ) : trashedItems.length > 0 ? (
                        <ul className="space-y-2">
                            {trashedItems.map(item => (
                                <li key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                    <div className="flex items-center overflow-hidden">
                                        <div className="text-2xl mr-4 flex-shrink-0">
                                            {item.type === 'folder' ? <FiFolder className="text-yellow-500" /> : <FileIcon type={item.file_type} />}
                                        </div>
                                        <div className="truncate">
                                            <p className="font-medium text-gray-800 truncate">{item.name}</p>
                                            <p className="text-sm text-gray-500">{formatBytes(item.size)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                                        <button onClick={() => handleRestore(item)} title="Restore" className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100"><FiRotateCcw size={18} /></button>
                                        <button onClick={() => setItemToDelete(item)} title="Delete permanently" className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><FiTrash2 size={18} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            <FiTrash2 className="mx-auto text-4xl text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold">Trash is empty</h2>
                            <p>Items moved to the trash will appear here.</p>
                        </div>
                    )}
                </div>
            </main>
            {itemToDelete && (
                <ConfirmDeleteModal 
                    item={itemToDelete} 
                    onClose={() => setItemToDelete(null)} 
                    onDelete={handlePermanentDelete} 
                />
            )}
        </div>
    );
}
