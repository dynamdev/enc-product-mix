import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FFmpeg } from '@ffmpeg/ffmpeg';

export const convertVideoToGif = async (video: File): Promise<File> => {
  const ffmpeg = new FFmpeg();

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  const fps = 30;
  const scale = 500;

  await ffmpeg.writeFile('video.mp4', await fetchFile(video));

  // Generate a palette for better color accuracy
  await ffmpeg.exec([
    '-i',
    'video.mp4',
    '-vf',
    'fps=' + fps + ',scale=' + scale + ':-1:flags=lanczos,palettegen',
    'palette.png',
  ]);

  // Use the generated palette for the conversion
  await ffmpeg.exec([
    '-i',
    'video.mp4',
    '-i',
    'palette.png',
    '-filter_complex',
    'fps=' +
      fps +
      ',scale=' +
      scale +
      ':-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer',
    'video.gif',
  ]);

  const data = await ffmpeg.readFile('video.gif');
  const blob = new Blob([data], { type: 'image/gif' });
  return new File([blob], 'video.gif', { type: 'image/gif' });
};
