import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import newRequest from '../utils/newRequest'; // 1. Import your Axios instance

// Import components
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import FileGrid from '../components/FileGrid';
import FileListComponent from '../components/FileListComponent';
import EmptyStateDropzone from '../components/EmptyStateDropzone';
import NewFolderModal from '../components/NewFolderModal';
import FilePreviewModal from '../components/FilePreviewModal';
import ShareModal from '../components/ShareModal';

// This modal is for confirming deletion
const ConfirmDeleteModal = ({ item, onClose, onDelete }) => {
    if (!item) return null;
    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-2">Move to Trash</h2>
                <p className="text-gray-600 mb-4">Are you sure you want to move "{item.name}" to the trash?</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                    <button onClick={() => onDelete(item)} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Move to Trash</button>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Modal States
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToShare, setItemToShare] = useState(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  
  // UI State
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('name-asc');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Folder State
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Drive' }]);
  
  const location = useLocation();

  const fetchContents = useCallback(async (folderId, query) => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    
    try {
        let response;
        const config = { headers: { 'Authorization': `Bearer ${session.access_token}` } };

        if (query) {
            response = await newRequest.get(`/files/search?q=${query}`, config);
        } else {
            const [sortBy, sortOrder] = sortOption.split('-');
            response = await newRequest.get(`/files/contents?sortBy=${sortBy}&sortOrder=${sortOrder}${folderId ? `&folderId=${folderId}` : ''}`, config);
        }
        
        // This is the fix: Ensure the data is always an array
        setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) { 
        console.error("Error fetching data:", error); 
        toast.error("Could not load files.");
        setItems([]);
    } 
    finally { setLoading(false); }
  }, [sortOption]);

  // This useEffect handles navigation from the Shared page
  useEffect(() => {
    const initialFolder = location.state?.initialFolder;
    if (initialFolder) {
        setCurrentFolderId(initialFolder.id);
        setBreadcrumbs([ { id: null, name: 'My Drive' }, { id: initialFolder.id, name: initialFolder.name } ]);
        window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUserData();
  }, []);
  
  useEffect(() => {
      if (searchTerm) {
          fetchContents(null, searchTerm);
      } else {
          fetchContents(currentFolderId);
      }
  }, [currentFolderId, searchTerm, fetchContents]);

  const handleRename = async (item, newName) => {
    if (!newName.trim() || newName === item.name) return;
    const { data: { session } } = await supabase.auth.getSession();
    const itemType = item.type;
    try {
        await newRequest.patch(`/files/${itemType}/${item.id}`, { name: newName }, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        toast.success(`Renamed to "${newName}"`);
        fetchContents(currentFolderId, searchTerm);
    } catch (error) {
        toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleSoftDelete = async (item) => {
    const { data: { session } } = await supabase.auth.getSession();
    const itemType = item.type;
    try {
        await newRequest.post(`/files/${itemType}/${item.id}/trash`, {}, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        setItemToDelete(null);
        toast.success(`"${item.name}" moved to trash.`);
        fetchContents(currentFolderId, searchTerm);
    } catch (error) {
        toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleFileDownload = async (file) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("You need to be logged in."); return; }
    try {
        const response = await newRequest.post('/files/signed-url', { path: file.storage_path }, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        setPreviewFile({ url: response.data.signedUrl, type: file.file_type, name: file.name });
    } catch (error) {
        toast.error(`Could not open file: ${error.response?.data?.error || error.message}`);
    }
  };
  
  const handleCreateFolder = async (e) => { 
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("You must be logged in."); return; }
    try {
        await newRequest.post('/files/folders', { name: newFolderName, parentFolderId: currentFolderId }, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        setShowNewFolderModal(false);
        setNewFolderName('');
        toast.success(`Folder "${newFolderName}" created.`);
        fetchContents(currentFolderId, searchTerm);
    } catch (error) {
        toast.error(`Error: ${error.response?.data?.error || error.message}`);
    }
  };
  
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    const toastId = toast.loading(`Uploading ${acceptedFiles.length} file(s)...`);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
        toast.error('You must be logged in to upload.', { id: toastId });
        setUploading(false); 
        return; 
    }

    const uploadPromises = acceptedFiles.map(file => {
      const formData = new FormData();
      formData.append('file', file);
      if (currentFolderId) formData.append('folderId', currentFolderId);
      return newRequest.post('/files/upload', formData, {
        headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'multipart/form-data',
        },
      });
    });
    
    try {
        await Promise.all(uploadPromises);
        toast.success('Upload complete!', { id: toastId });
        fetchContents(currentFolderId, searchTerm);
    } catch (error) {
        toast.error('Upload failed.', { id: toastId });
    } finally {
        setUploading(false);
    }
  }, [currentFolderId, fetchContents, searchTerm]);

  const handleNewFolderClick = () => {
    setNewFolderName("Untitled folder");
    setShowNewFolderModal(true);
  };
  const handleItemClick = (item) => { 
    if (searchTerm) setSearchTerm('');
    if (item.type === 'folder') { 
        setCurrentFolderId(item.id); 
        setBreadcrumbs(prev => [...prev, { id: item.id, name: item.name }]); 
    } else { 
        handleFileDownload(item); 
    } 
  };
  const handleBreadcrumbClick = (index) => { 
    if (searchTerm) setSearchTerm('');
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1); 
    setBreadcrumbs(newBreadcrumbs); 
    setCurrentFolderId(newBreadcrumbs[newBreadcrumbs.length - 1].id); 
  };
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true, noKeyboard: true });
  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
            user={user} 
            onNewFolderClick={handleNewFolderClick} 
            onUploadClick={open}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortOption={sortOption}
            setSortOption={setSortOption}
        />
        <Breadcrumbs crumbs={breadcrumbs} onCrumbClick={handleBreadcrumbClick} />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {loading ? ( <p className="text-center text-gray-500">Loading...</p> ) : 
          items.length > 0 ? (
            <div {...getRootProps()} className="h-full">
              <input {...getInputProps()} />
              {viewMode === 'grid' ? (
                  <FileGrid 
                      items={items} 
                      onItemClick={handleItemClick}
                      onRenameSubmit={handleRename}
                      onDeleteClick={setItemToDelete}
                      onShareClick={setItemToShare}
                  />
              ) : (
                  <FileListComponent 
                      items={items} 
                      onItemClick={handleItemClick}
                      onRenameSubmit={handleRename}
                      onDeleteClick={setItemToDelete}
                      onShareClick={setItemToShare}
                  />
              )}
            </div>
          ) : (
            <EmptyStateDropzone 
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                uploading={uploading}
                onUploadClick={open} 
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <NewFolderModal 
        show={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        onSubmit={handleCreateFolder}
      />
      {itemToDelete && <ConfirmDeleteModal item={itemToDelete} onClose={() => setItemToDelete(null)} onDelete={handleSoftDelete} />}
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      {itemToShare && <ShareModal item={itemToShare} onClose={() => setItemToShare(null)} />}
    </div>
  );
}