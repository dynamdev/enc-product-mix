import { NextResponse } from 'next/server';
import { pinToCrustNetwork, uploadToCrustIpfs } from '@/helper/crustHelper';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const data = await request.formData();
  const cid: string | null = data.get('cid') as unknown as string;
  const fileSize: number | null = data.get('fileSize') as unknown as number;

  if (!cid || !fileSize) {
    return NextResponse.json({ error: 'Missing parameters!' }, { status: 400 });
  }

  try {
    await pinToCrustNetwork(cid, fileSize);
    return NextResponse.json({ success: true });
  } catch (_) {
    return NextResponse.json(
      { error: 'Something went wrong!' },
      { status: 400 },
    );
  }
}
