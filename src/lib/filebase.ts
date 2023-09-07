import {
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

const s3 = new S3Client({
  region: 'us-east-1',
  credentials: defaultProvider({}),
  endpoint: 'https://s3.filebase.com',
  forcePathStyle: true,
});

interface IListFilesInBucket {
  ETag: string;
  Key: string;
  LastModified: string;
  Size: number;
  StorageClass: string;
}

export async function listFilesInBucket(
  bucketName: string,
  path: string,
): Promise<IListFilesInBucket[]> {
  try {
    const prefix = path.charAt(path.length - 1) === '/' ? path : path + '/';

    const params = {
      Bucket: bucketName,
      Prefix: prefix,
    };

    const response = await s3.send(new ListObjectsV2Command(params));

    if (!response.Contents) {
      return [];
    }

    return response.Contents.map((data) => {
      const output = data as unknown as IListFilesInBucket;
      return {
        ...output,
        Key: output.Key.replace(prefix, ''),
      };
    }).filter((data) => data.Key !== '');
  } catch (error) {
    console.error('Error fetching files from S3:', error);
    throw error;
  }
}

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
