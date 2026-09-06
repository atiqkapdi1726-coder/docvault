'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/stores/appStore';
import { formatFileSize } from '@/lib/utils';

interface UploadZoneProps {
  onUpload: (file: File, folderId?: string | null) => Promise<string | null>;
  folderId?: string | null;
}

export function UploadZone({ onUpload, folderId }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { uploadProgress } = useAppStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(droppedFiles);
      droppedFiles.forEach((file) => onUpload(file, folderId));
    },
    [onUpload, folderId]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      selectedFiles.forEach((file) => onUpload(file, folderId));
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/5'
            : 'border-[rgb(var(--border))] hover:border-[rgb(var(--primary))]/50 hover:bg-[rgb(var(--muted))]/50'
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload
            size={40}
            className={cn(
              'mx-auto mb-3 transition-colors',
              isDragging ? 'text-[rgb(var(--primary))]' : 'text-[rgb(var(--muted-foreground))]'
            )}
          />
          <p className="font-medium">
            {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
            Supports all file types up to 50MB
          </p>
        </label>
      </div>

      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress) => (
            <motion.div
              key={progress.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card p-3"
            >
              <div className="flex items-center gap-3">
                {progress.status === 'complete' ? (
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <Check size={16} className="text-green-600" />
                  </div>
                ) : progress.status === 'error' ? (
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertCircle size={16} className="text-red-600" />
                  </div>
                ) : (
                  <FileText size={18} className="text-[rgb(var(--primary))]" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{progress.fileName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.progress}%` }}
                        className={cn(
                          'h-full rounded-full',
                          progress.status === 'complete'
                            ? 'bg-green-500'
                            : progress.status === 'error'
                            ? 'bg-red-500'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        )}
                      />
                    </div>
                    <span className="text-xs text-[rgb(var(--muted-foreground))]">
                      {progress.status === 'complete'
                        ? 'Done'
                        : progress.status === 'error'
                        ? 'Error'
                        : `${Math.round(progress.progress)}%`}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
