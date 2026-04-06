// Simple file upload component for BOM Manager

import React, { useState, useRef } from 'react';
import { useStorage } from '@/hooks/useStorage';
import type { FileCategory } from '@/types/storage';

interface FileUploadProps {
  partType?: string;
  partId?: number;
  category?: FileCategory;
  onUploadComplete?: (filePath: string, publicUrl: string) => void;
  onUpload?: (filePath: string, publicUrl: string) => void;
  existingUrl?: string | null;
  bucket?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  partType,
  partId,
  category,
  onUploadComplete,
  onUpload,
  bucket,
  label = 'Upload File',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storage = useStorage({
    onUploadComplete: (result) => {
      if (result.success && result.filePath && result.publicUrl) {
        onUploadComplete?.(result.filePath, result.publicUrl);
        onUpload?.(result.filePath, result.publicUrl);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error || 'Upload failed');
      }
    },
    onUploadError: (errorMsg) => {
      setError(errorMsg);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    await storage.upload(
      selectedFile, 
      partType || 'unknown', 
      partId || 0, 
      category || 'documentation' as FileCategory,
      bucket
    );
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    storage.clearError();
  };

  return (
    <div className="file-upload">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-4">
        {/* File input */}
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {/* File info */}
        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </div>
        )}

        {/* Action buttons */}
        {selectedFile && (
          <div className="flex space-x-2">
            <button
              onClick={handleUpload}
              disabled={storage.isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {storage.isLoading ? 'Uploading...' : 'Upload'}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={storage.isLoading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Progress bar */}
        {storage.isLoading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${storage.progress}%` }}
            ></div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
