import React, { useState } from 'react';
import { FiX, FiLink, FiUsers, FiCopy } from 'react-icons/fi';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import newRequest from '../utils/newRequest'; // 1. Import newRequest

export default function ShareModal({ item, onClose }) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [publicLink, setPublicLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [linkLoading, setLinkLoading] = useState(false);

    if (!item) return null;

    const handleShareWithUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const itemType = item.type;

        try {
            const response = await newRequest.post(`/files/share`, 
                { itemId: item.id, itemType, email, role },
                { headers: { 'Authorization': `Bearer ${session.access_token}` } }
            );
            toast.success(response.data.message);
            setEmail('');
        } catch (err) {
            toast.error(`Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleGetPublicLink = async () => {
        setLinkLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const itemType = item.type;

        if (itemType === 'folder') {
            toast.error("Public links are not yet supported for folders.");
            setLinkLoading(false);
            return;
        }

        try {
            const response = await newRequest.get(`/files/${item.id}/public-link`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            setPublicLink(response.data.publicUrl);
        } catch (err) {
            toast.error(`Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setLinkLoading(false);
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicLink);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Share "{item.name}"</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24} /></button>
                </div>

                <div className="mb-6">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center"><FiUsers className="mr-2" /> Share with people</h3>
                    <form onSubmit={handleShareWithUser} className="flex items-center space-x-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-300 outline-none"
                            disabled={loading}
                        />
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="p-2 border border-gray-300 rounded-md" disabled={loading}>
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                        </select>
                        <button 
                            type="submit" 
                            className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-300"
                            disabled={loading}
                        >
                            {loading ? 'Sharing...' : 'Share'}
                        </button>
                    </form>
                </div>
                
                <div>
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center"><FiLink className="mr-2" /> Get a shareable link</h3>
                    {publicLink ? (
                        <div className="flex items-center space-x-2">
                            <input type="text" readOnly value={publicLink} className="w-full p-2 border rounded bg-gray-100" />
                            <button onClick={copyToClipboard} className="p-2 text-gray-500 hover:text-indigo-600"><FiCopy size={20} /></button>
                        </div>
                    ) : (
                        <button onClick={handleGetPublicLink} disabled={linkLoading} className="text-indigo-600 font-medium hover:underline disabled:text-gray-400">
                            {linkLoading ? 'Creating link...' : 'Create a public link'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}