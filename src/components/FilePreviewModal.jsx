import React from 'react';
import { FiX, FiPrinter, FiDownload, FiShare2 } from 'react-icons/fi';

export default function FilePreviewModal({ file, onClose }) {
    if (!file || !file.url) return null;

    const handleDownload = async () => {
        try {
          
            const response = await fetch(file.url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
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
            alert('Could not download the file. Check the console for more details.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-200 rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
                <header className="bg-gray-800 text-white p-3 flex items-center justify-between rounded-t-lg">
                    <div className="flex items-center">
                        <span className="font-medium">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        
                        <FiDownload onClick={handleDownload} className="cursor-pointer hover:text-gray-300" size={20} />
                        <FiShare2 className="cursor-pointer hover:text-gray-300" size={20} />
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <FiX size={24} />
                        </button>
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