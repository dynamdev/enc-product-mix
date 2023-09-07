import { writeFile } from 'fs/promises';

export const upload = async (path: string, file: File) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(path, buffer);
};
