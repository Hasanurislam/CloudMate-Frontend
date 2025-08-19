import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useDropzone } from 'react-dropzone';

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
import toast from 'react-hot-toast';

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
  
  // Folder State - Moved to the top
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Drive' }]);
  
  const location = useLocation();

  const handleNewFolderClick = () => {
    setNewFolderName("Untitled folder");
    setShowNewFolderModal(true);
  };

  const fetchContents = useCallback(async (folderId, query) => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    
    try {
        let url;
        if (query) {
            url = new URL('http://localhost:8080/files/search');
            url.searchParams.append('q', query);
        } else {
            url = new URL('http://localhost:8080/files/contents');
            if (folderId) url.searchParams.append('folderId', folderId);
            const [sortBy, sortOrder] = sortOption.split('-');
            url.searchParams.append('sortBy', sortBy);
            url.searchParams.append('sortOrder', sortOrder);
        }
        
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
        if (!response.ok) throw new Error('Failed to fetch data.');
        const data = await response.json();
        setItems(data);
    } catch (error) { 
        console.error("Error fetching data:", error); 
        toast.error("Could not load files.");
        setItems([]);
    } 
    finally { setLoading(false); }
  }, [sortOption]);

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
    const itemType = item.type; // Use the reliable 'type' property
    try {
        const response = await fetch(`http://localhost:8080/files/${itemType}/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ name: newName }),
        });
        if (!response.ok) throw new Error('Rename failed');
        toast.success(`Renamed to "${newName}"`);
        fetchContents(currentFolderId, searchTerm);
    } catch (error) {
         toast.error(`Error: ${error.message}`);
    }
  };

    const handleSoftDelete = async (item) => {
    const { data: { session } } = await supabase.auth.getSession();
    const itemType = item.type;
    try {
        const response = await fetch(`http://localhost:8080/files/${itemType}/${item.id}/trash`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session.access_token}` },
        });
        if (!response.ok) throw new Error('Move to trash failed');
        setItemToDelete(null);
        toast.success(`"${item.name}" moved to trash.`);
        fetchContents(currentFolderId, searchTerm);
    } catch (error) {
        toast.error(`Error: ${error.message}`);
    }
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

    const handleFileDownload = async (file) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("You need to be logged in."); return; }
    try {
        const response = await fetch('http://localhost:8080/files/signed-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ path: file.storage_path }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Could not get signed URL.');
        }
        const { signedUrl } = await response.json();
        setPreviewFile({ url: signedUrl, type: file.file_type, name: file.name });
    } catch (error) {
        toast.error(`Could not open file: ${error.message}`);
    }
  };
  
  const handleCreateFolder = async (e) => { 
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert("You must be logged in."); return; }
    try {
        const response = await fetch('http://localhost:8080/files/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({ name: newFolderName, parentFolderId: currentFolderId }),
        });
        if (!response.ok) throw new Error('Failed to create folder.');
        setShowNewFolderModal(false);
        setNewFolderName('');
        toast.success(`Folder "${newFolderName}" created.`);
        fetchContents(currentFolderId, searchTerm);
    } catch (error) {
        toast.error(`Error: ${error.message}`);
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
      return fetch('http://localhost:8080/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop, 
    noClick: true, 
    noKeyboard: true 
  });


  const handleLogout = async () => { await supabase.auth.signOut(); };

  return (
    <div className="flex h-screen bg-gray-200 font-sans">
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