import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import axios from 'axios';

const customCredentials = () => async () => {
  return {
    accessKeyId: process.env.FILEBASE_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.FILEBASE_AWS_SECRET_ACCESS_KEY!,
  };
};

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: customCredentials(),
  endpoint: 'https://s3.filebase.com',
  forcePathStyle: true,
});

/**
 * Uploads a file to an S3 bucket.
 *
 * @param bucketName - Name of the S3 bucket.
 * @param fileKey - The key (filename) for the file in the S3 bucket.
 * @param file - File or string to upload.
 * @returns Promise indicating the upload completion.
 */
export async function uploadToBucket(
  bucketName: string,
  fileKey: string,
  file: File | string,
): Promise<void> {
  try {
    let bodyContent: string | Buffer;

    if (typeof file === 'string') {
      bodyContent = file;
    } else {
      const bytes = await file.arrayBuffer();
      bodyContent = Buffer.from(bytes);
    }

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: bodyContent,
    };

    await s3.send(new PutObjectCommand(uploadParams));
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
}

interface PinnedObjectFilters {
  cid?: string[];
  name?: string;
  match?: 'exact' | 'iexact' | 'partial' | 'ipartial';
  status?: ('queued' | 'pinning' | 'pinned' | 'failed')[];
  before?: string;
  after?: string;
  limit?: number;
  meta?: object;
}

export interface GetPinnedObjectsResponse {
  created: Date;
  delegates: string[];
  info: { size: number };
  pin: {
    cid: string;
    meta: {};
    name: string;
    origins: [];
  };
  requestid: string;
  status: string;
}

export async function getPinnedObjects(
  filters?: PinnedObjectFilters,
): Promise<GetPinnedObjectsResponse[]> {
  try {
    const headers = {
      Authorization: `Bearer ${process.env.FILEBASE_API_BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(process.env.FILEBASE_API_PIN_ENDPOINT!, {
      headers: headers,
      params: filters,
    });

    if (response.status === 200) {
      return response.data.results;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}
