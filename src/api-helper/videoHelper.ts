import ffmpeg from 'fluent-ffmpeg';
import { GifskiCommand } from 'gifski-command';
import {
  generateFileUID,
  writeFileToPublicDirectory,
} from '@/api-helper/FileHelper';
import { Readable } from 'stream';

const bufferToStream = (buffer: Buffer): Readable => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // indicates end-of-file basically - the end of the stream
  return stream;
};

export const convertVideoToGif = async (video: File): Promise<File> => {
  return new Promise(async (resolve, reject) => {
    const chunks: Uint8Array[] = [];

    ffmpeg()
      .input(bufferToStream(Buffer.from(await video.arrayBuffer())))
      .toFormat('gif')
      .on('data', (chunk) => {
        chunks.push(chunk);
      })
      .on('end', () => {
        const blob = new Blob(chunks, { type: 'image/gif' });
        const gifFile = new File([blob], 'output.gif', { type: 'image/gif' });
        resolve(gifFile);
      })
      .on('error', (err) => reject(err))
      .pipe();
  });
};
