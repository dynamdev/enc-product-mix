import { NextResponse } from 'next/server';
import { getPinnedObjects, uploadToBucket } from '@/lib/filebase';
import { convertMp4ToGif } from '@/lib/files';

export async function GET() {
  const metadataIpfsData = await getPinnedObjects({
    status: ['pinned'],
    name: 'json/',
    match: 'partial',
  });

  return NextResponse.json({ metadata: metadataIpfsData });
}

export async function PUT(request: Request) {
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

  const filenameBase = filename.split('.')[0];
  const filenameVideo = 'video/' + filename;
  const filenameThumbnail = 'thumbnail/' + filenameBase + '.gif';
  const filenameJson = 'json/' + filenameBase + '.json';

  await uploadToBucket('enchantmint-product-mix', filenameVideo, video);
  await uploadToBucket(
    'enchantmint-product-mix',
    filenameThumbnail,
    await convertMp4ToGif(video),
  );

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
