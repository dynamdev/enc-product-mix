import { NextResponse } from 'next/server';
import { uploadToCrustIpfs } from '@/helper/crustHelper';
import { uploadToCrustCloudIpfs } from '@/helper/crustCloudHelper';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}

export async function PUT(request: Request) {
  const data = await request.formData();
  const filename: string | null = data.get('filename') as unknown as string;
  const fileData: File | string | null = data.get('fileData') as unknown as
    | File
    | string;

  if (!filename || !fileData) {
    return NextResponse.json({ error: 'Missing parameters!' }, { status: 400 });
  }

  try {
    return NextResponse.json(await uploadToCrustCloudIpfs(filename, fileData));
  } catch (_) {
    return NextResponse.json(
      { error: 'Something when wrong!' },
      { status: 400 },
    );
  }
}
