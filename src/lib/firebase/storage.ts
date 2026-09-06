import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  fileId: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function extractKeyFromUrl(fileUrl: string): string | null {
  if (fileUrl.startsWith('r2://')) {
    return fileUrl.replace('r2://', '');
  }
  return null;
}

export const storageService = {
  uploadFile: async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 50MB.`
      );
    }

    onProgress?.(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    onProgress?.(30);

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
    });

    onProgress?.(80);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    onProgress?.(100);

    return {
      fileId: result.fileKey,
      fileUrl: result.fileUrl,
      fileSize: result.fileSize,
      contentType: result.contentType,
    };
  },

  downloadFile: async (fileUrl: string): Promise<string | null> => {
    const key = extractKeyFromUrl(fileUrl);
    if (!key) {
      if (fileUrl.startsWith('http')) return fileUrl;
      return null;
    }

    const response = await fetch(`/api/storage/download?key=${encodeURIComponent(key)}`);
    if (!response.ok) return null;

    const result = await response.json();
    return result.url || null;
  },

  deleteFile: async (fileUrl: string) => {
    const key = extractKeyFromUrl(fileUrl);
    if (!key) return;

    await fetch(`/api/storage/delete?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  },

  getDownloadURL: async (fileUrl: string) => {
    const key = extractKeyFromUrl(fileUrl);
    if (!key) return fileUrl;

    const response = await fetch(`/api/storage/download?key=${encodeURIComponent(key)}`);
    if (!response.ok) return fileUrl;

    const result = await response.json();
    return result.url || fileUrl;
  },
};

export default storageService;
