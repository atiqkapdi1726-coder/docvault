import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  fileId: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const storageService = {
  uploadFile: async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    if (!storage) throw new Error('Firebase Storage not initialized');

    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 50MB.`
      );
    }

    const fileId = uuidv4();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${path}/${fileId}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress?.(progress);
        },
        (error) => {
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              fileId: storagePath,
              fileUrl: downloadUrl,
              fileSize: file.size,
              contentType: file.type || 'application/octet-stream',
            });
          } catch (error) {
            reject(new Error(`Failed to get download URL: ${error}`));
          }
        }
      );
    });
  },

  downloadFile: async (fileUrl: string): Promise<string | null> => {
    return fileUrl;
  },

  deleteFile: async (fileUrl: string) => {
    if (!storage) return;
    try {
      const storageRef = ref(storage, fileUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  },

  getDownloadURL: async (fileUrl: string) => {
    return fileUrl;
  },
};

export default storageService;
