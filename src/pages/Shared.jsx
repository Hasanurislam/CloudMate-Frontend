import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header'; // We'll use a simplified version of the header
import { FileIcon, formatBytes } from '../utils/helpers.jsx';
import { FiFolder, FiUsers, FiX, FiPrinter, FiDownload, FiShare2 } from 'react-icons/fi';

// --- File Preview Modal (Copied from Dashboard) ---
const FilePreviewModal = ({ file, onClose }) => {
    if (!file || !file.url) return null;

    const handleDownload = async () => {
        try {
            const response = await fetch(file.url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Could not download the file.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-200 rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
                <header className="bg-gray-800 text-white p-3 flex items-center justify-between rounded-t-lg">
                    <span className="font-medium truncate">{file.name}</span>
                    <div className="flex items-center space-x-4 flex-shrink-0">
                        <FiPrinter className="cursor-pointer hover:text-gray-300" size={20} />
                        <FiDownload onClick={handleDownload} className="cursor-pointer hover:text-gray-300" size={20} />
                        <FiShare2 className="cursor-pointer hover:text-gray-300" size={20} />
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4">
                    {file.type.startsWith('image/') ? (
                        <img src={file.url} alt="File preview" className="w-full h-full object-contain" />
                    ) : (
                        <iframe src={file.url} title="File preview" className="w-full h-full border-0"></iframe>
                    )}
                </div>
            </div>
        </div>
    );
};


export default function Shared() {
    const [sharedItems, setSharedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewFile, setPreviewFile] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const fetchSharedItems = useCallback(async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoading(false); return; }

        try {
            const response = await fetch('http://localhost:8080/files/shared-with-me', {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch shared files.');
            const data = await response.json();
            setSharedItems(data);
        } catch (error) {
            console.error("Error fetching shared files:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSharedItems();
    }, [fetchSharedItems]);

    const handleItemClick = async (item) => {
        if (item.type === 'folder') {
            navigate('/', { state: { initialFolder: item } });
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { alert("You need to be logged in."); return; }

        try {
            const response = await fetch('http://localhost:8080/files/signed-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ path: item.storage_path }),
            });
            if (!response.ok) throw new Error('Could not get signed URL.');
            const { signedUrl } = await response.json();
            setPreviewFile({ url: signedUrl, type: item.file_type, name: item.name });
        } catch (error) {
            console.error("Error getting signed URL:", error);
            alert("Could not open file.");
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar onLogout={() => supabase.auth.signOut()} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6">Shared with me</h1>
                    {loading ? (
                        <p className="text-center text-gray-500">Loading shared files...</p>
                    ) : sharedItems.length > 0 ? (
                        <ul className="space-y-2">
                            {sharedItems.map(item => (
                                <li 
                                    key={item.id} 
                                    onClick={() => handleItemClick(item)} 
                                    className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="flex items-center overflow-hidden">
                                        <div className="text-2xl mr-4 flex-shrink-0">
                                            {item.type === 'folder' ? <FiFolder className="text-yellow-500" /> : <FileIcon type={item.file_type} />}
                                        </div>
                                        <div className="truncate">
                                            <p className="font-medium text-gray-800 truncate">{item.name}</p>
                                            <p className="text-sm text-gray-500">{formatBytes(item.size)}</p>
                                        </div>
                                    </div>
                                    {/* You can add actions for shared files here later */}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">
                            <FiUsers className="mx-auto text-4xl text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold">No files shared with you</h2>
                            <p>Files and folders shared with you will appear here.</p>
                        </div>
                    )}
                </div>
            </main>
            {previewFile && (
                <FilePreviewModal 
                    file={previewFile}
                    onClose={() => setPreviewFile(null)} 
                />
            )}
        </div>
    );
}