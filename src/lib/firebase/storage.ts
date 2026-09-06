import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  downloadURL: string;
  storagePath: string;
  fileSize: number;
  contentType: string;
}

export const storageService = {
  uploadFile: (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
      const storagePath = `${path}/${uuidv4()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadURL,
            storagePath,
            fileSize: file.size,
            contentType: file.type,
          });
        }
      );
    });
  },

  deleteFile: async (storagePath: string) => {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  },

  getDownloadURL: async (storagePath: string) => {
    const fileRef = ref(storage, storagePath);
    return getDownloadURL(fileRef);
  },
};

export default storageService;
