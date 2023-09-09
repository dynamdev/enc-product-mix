import { NextResponse } from 'next/server';
import { getPinnedObjects, uploadToBucket } from '@/lib/filebase';

export async function GET() {
  return NextResponse.json({ data: 'Hello from minting api!' });
}

export async function POST(request: Request) {
  const data = await request.formData();
  const video: File | null = data.get('video') as unknown as File;
  const filenameBase: string | null = data.get('filename') as unknown as string;
  const name: string | null = data.get('name') as unknown as string;
  const description: string | null = data.get(
    'description',
  ) as unknown as string;

  if (!video || !filenameBase || !name || !description) {
    return NextResponse.json({ error: 'Missing parameters!' }, { status: 400 });
  }

  const filenameVideo = 'video/' + filenameBase;
  const filenameJson = 'json/' + filenameBase.split('.')[0] + '.json';

  await uploadToBucket('enchantmint-product-mix', filenameVideo, video);

  let videoCid = '';

  while (videoCid === '') {
    const videoIpfsData = await getPinnedObjects({
      status: ['pinned'],
      limit: 1,
    });

    if (videoIpfsData.length === 0) continue;
    else if (videoIpfsData[0].pin.name === filenameVideo) {
      videoCid = videoIpfsData[0].pin.cid;
    }
  }

  await uploadToBucket(
    'enchantmint-product-mix',
    filenameJson,
    JSON.stringify({
      name: name,
      description: description,
      animation_url: 'https://ipfs.filebase.io/ipfs/' + videoCid,
    }),
  );

  let jsonCid = '';

  while (jsonCid === '') {
    const jsonIpfsData = await getPinnedObjects({
      status: ['pinned'],
      limit: 1,
    });

    if (jsonIpfsData.length === 0) continue;
    else if (jsonIpfsData[0].pin.name === filenameJson) {
      jsonCid = jsonIpfsData[0].pin.cid;
    }
  }

  return NextResponse.json({ jsonCid: jsonCid });
}
