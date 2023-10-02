import { writeFile } from 'fs/promises';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const upload = async (path: string, file: File) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(path, buffer);
};

export async function convertMp4ToGif(file: File): Promise<File> {
  const ffmpeg = new FFmpeg();

  // Load the ffmpeg core
  await ffmpeg.load();

  // Write the file to memory
  await ffmpeg.writeFile('input.mp4', await fetchFile(file));

  // Run the ffmpeg command to convert mp4 to gif
  await ffmpeg.exec(['-i', 'input.mp4', '-f', 'gif', 'output.gif']);

  // Read the result
  const data = await ffmpeg.readFile('output.gif');

  // Create a Blob from the data
  const blob = new Blob([data], { type: 'image/gif' });

  return new File([blob], 'example.txt', {
    type: 'text/plain',
    lastModified: new Date().getTime(),
  });
}
