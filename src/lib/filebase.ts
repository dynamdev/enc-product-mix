import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
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
