import { NextResponse } from 'next/server';
import { pinToCrustNetwork, uploadToCrustIpfs } from '@/helper/crustHelper';
import { pinToCrustCloudNetwork } from '@/helper/crustCloudHelper';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const data = await request.formData();
  const cid: string | null = data.get('cid') as unknown as string;
  const filename: string | null = data.get('filename') as unknown as string;

  if (!cid || !filename) {
    return NextResponse.json({ error: 'Missing parameters!' }, { status: 400 });
  }

  try {
    await pinToCrustCloudNetwork(cid, filename);
    return NextResponse.json({ success: true });
  } catch (_) {
    return NextResponse.json(
      { error: 'Something went wrong!' },
      { status: 400 },
    );
  }
}
