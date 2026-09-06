import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from './config';
import { v4 as uuidv4 } from 'uuid';

export interface R2UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export const r2Storage = {
  uploadFile: async (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<R2UploadResult> => {
    const client = getR2Client();
    const fileId = uuidv4();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${path}/${fileId}_${safeName}`;

    onProgress?.(10);

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    onProgress?.(60);

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: uint8Array,
      ContentType: file.type || 'application/octet-stream',
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    onProgress?.(80);
    await client.send(command);
    onProgress?.(100);

    const url = R2_PUBLIC_URL
      ? `${R2_PUBLIC_URL}/${key}`
      : `r2://${key}`;

    return {
      key,
      url,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
    };
  },

  getDownloadUrl: async (key: string): Promise<string> => {
    if (R2_PUBLIC_URL) {
      return `${R2_PUBLIC_URL}/${key}`;
    }

    const client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(client, command, { expiresIn: 3600 });
  },

  deleteFile: async (key: string): Promise<void> => {
    const client = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await client.send(command);
  },

  listFiles: async (prefix: string): Promise<Array<{ key: string; size: number; lastModified: Date }>> => {
    const client = getR2Client();
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await client.send(command);
    return (response.Contents || []).map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  },

  getFileInfo: async (key: string): Promise<{ exists: boolean; size: number; contentType: string } | null> => {
    try {
      const client = getR2Client();
      const command = new HeadObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });
      const response = await client.send(command);
      return {
        exists: true,
        size: response.ContentLength || 0,
        contentType: response.ContentType || 'application/octet-stream',
      };
    } catch {
      return null;
    }
  },
};

export default r2Storage;
