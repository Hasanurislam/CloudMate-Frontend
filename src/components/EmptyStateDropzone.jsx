import React from 'react';
import { FiUploadCloud } from 'react-icons/fi';

export default function EmptyStateDropzone({ getRootProps, getInputProps, isDragActive, uploading, onUploadClick }) {
  return (
    <div {...getRootProps()} className={`flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}>
      <input {...getInputProps()} />
      <FiUploadCloud className="text-5xl text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700">{uploading ? 'Uploading...' : 'Empty Folder'}</h3>
      <p className="text-gray-500">
        {uploading ? 'Please wait...' : 
          isDragActive ? "Drop files here" : 
          <span>Drag 'n' drop some files here, or <button type="button" onClick={onUploadClick} className="text-indigo-600 font-semibold hover:underline">click to select files</button></span>
        }
      </p>
    </div>
  );
}
