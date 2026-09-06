import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  fileId: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
}

const MAX_FILE_SIZE = 800 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  uploadFile: async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 800KB on the free Spark plan.`
      );
    }

    onProgress?.(10);
    const base64Data = await fileToBase64(file);
    onProgress?.(60);

    const fileId = uuidv4();
    const fileDocId = `${path.replace(/\//g, '_')}_${fileId}`;

    const fileRecord = {
      id: fileId,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      data: base64Data,
      uploadedAt: new Date().toISOString(),
    };

    onProgress?.(80);
    await setDoc(doc(db, 'fileStorage', fileDocId), fileRecord);
    onProgress?.(100);

    return {
      fileId: fileDocId,
      fileUrl: `firestore://${fileDocId}`,
      fileSize: file.size,
      contentType: file.type,
    };
  },

  downloadFile: async (fileUrl: string): Promise<string | null> => {
    const docId = fileUrl.replace('firestore://', '');
    if (!docId) return null;

    const fileDoc = await getDoc(doc(db, 'fileStorage', docId));
    if (!fileDoc.exists()) return null;

    return fileDoc.data().data as string;
  },

  deleteFile: async (fileUrl: string) => {
    const docId = fileUrl.replace('firestore://', '');
    if (!docId) return;
    await deleteDoc(doc(db, 'fileStorage', docId));
  },

  getDownloadURL: async (fileUrl: string) => {
    return fileUrl;
  },
};

export default storageService;
