import { NextResponse } from 'next/server';
import {
  generateCID,
  getPinnedObjects,
  uploadToBucket,
} from '@/helper/filebaseHelper';

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
  const gif: File | null = data.get('gif') as unknown as File;
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

  await uploadToBucket('enchantmint-product-mix', filenameThumbnail, gif);
  await uploadToBucket('enchantmint-product-mix', filenameVideo, video);

  const thumbnailCid = await generateCID(filenameThumbnail, gif);
  const videoCid = await generateCID(filenameVideo, video);

  const jsonContent = JSON.stringify({
    name: name,
    description: description,
    image: 'https://ipfs.io/ipfs/' + thumbnailCid,
    animation_url: 'https://ipfs.io/ipfs/' + videoCid,
  });

  const jsonCid = await generateCID(filenameJson, jsonContent);

  await uploadToBucket('enchantmint-product-mix', filenameJson, jsonContent);

  return NextResponse.json({ jsonCid: jsonCid });
}
