import { NextResponse } from 'next/server';
import { getPinnedObjects, uploadToBucket } from '@/helper/filebaseHelper';

export async function GET() {
  const metadataIpfsData = await getPinnedObjects({
    status: ['pinned'],
    name: 'json/',
    match: 'partial',
    limit: 100,
  });

  return NextResponse.json({ metadata: metadataIpfsData });
}
