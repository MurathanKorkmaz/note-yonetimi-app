'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  currentFile?: string;
  accept?: Record<string, string[]>;
}

export function FileUpload({
  onFileSelect,
  currentFile,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      '.docx',
    ],
  },
}: FileUploadProps) {
  const [error, setError] = useState<string>();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError('File size must be less than 5MB');
          return;
        }
        setError(undefined);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 hover:border-primary-500 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {currentFile ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">
              Current file: {currentFile}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null as any);
              }}
            >
              Remove
            </Button>
          </div>
        ) : isDragActive ? (
          <p className="text-sm text-gray-600">Drop the file here</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Drag & drop a file here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, DOC, DOCX (max 5MB)
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
} 