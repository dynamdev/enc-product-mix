import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

export const convertVideoToGif = async (video: File): Promise<File> => {
  const ffmpeg = new FFmpeg();

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
  ffmpeg.on('log', ({ message }) => {
    console.log(message);
  });

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  await ffmpeg.writeFile('video1.mp4', await fetchFile(video));
  await ffmpeg.exec([
    '-i',
    'video1.mp4',
    '-vf',
    'scale=500:-1',
    '-f',
    'gif',
    'out.gif',
  ]);
  const data = await ffmpeg.readFile('out.gif');
  const blob = new Blob([data], { type: 'image/gif' });
  return new File([blob], 'converted.gif', { type: 'image/gif' });
};
