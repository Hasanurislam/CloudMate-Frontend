import React from 'react';
import { FiFile } from 'react-icons/fi';
import { FaFilePdf, FaFileImage, FaFileWord, FaFileExcel } from 'react-icons/fa';

export const FileIcon = ({ type }) => {
    if (type.startsWith('image/')) return <FaFileImage className="text-blue-500" />;
    if (type === 'application/pdf') return <FaFilePdf className="text-red-500" />;
    if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return <FaFileWord className="text-blue-700" />;
    if (type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return <FaFileExcel className="text-green-700" />;
    return <FiFile className="text-gray-500" />;
};

export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '—';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
