import { NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';
import { upload } from '@/lib/files';
import { listFilesInBucket } from '@/lib/filebase';

export async function GET() {
  return NextResponse.json({ data: 'Hello from minting api!' });
}

export async function POST(request: Request, response: Response) {
  const data = await request.formData();
  const video: File | null = data.get('video') as unknown as File;
  const filename: string | null = data.get('filename') as unknown as string;
  const name: string | null = data.get('name') as unknown as string;
  const description: string | null = data.get(
    'description',
  ) as unknown as string;

  if (!video || !filename || !name || !description) {
    return NextResponse.json({ error: 'Missing parameters!' }, { status: 400 });
  }

  //await upload('public/' + filename, video);
  const files = await listFilesInBucket('enchantmint-product-mix', 'video/');

  return NextResponse.json({ data: files });
}
