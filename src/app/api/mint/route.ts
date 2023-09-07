import { NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';
import { upload } from '@/lib/files';
import { listFilesInBucket, uploadToBucket } from '@/lib/filebase';

export async function GET() {
  return NextResponse.json({ data: 'Hello from minting api!' });
}

export async function POST(request: Request, response: Response) {
  const data = await request.formData();
  const video: File | null = data.get('video') as unknown as File;
  const filenameVideo: string | null = data.get(
    'filename',
  ) as unknown as string;
  const name: string | null = data.get('name') as unknown as string;
  const description: string | null = data.get(
    'description',
  ) as unknown as string;

  if (!video || !filenameVideo || !name || !description) {
    return NextResponse.json({ error: 'Missing parameters!' }, { status: 400 });
  }

  const filenameJson = filenameVideo.split('.')[0] + '.json';

  await uploadToBucket(
    'enchantmint-product-mix',
    'video/' + filenameVideo,
    video,
  );
  await uploadToBucket(
    'enchantmint-product-mix',
    'json/' + filenameJson,
    'Boom panis',
  );

  return NextResponse.json({ data: 'Done' });
}
