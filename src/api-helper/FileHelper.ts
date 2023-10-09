import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const writeFileToPublicDirectory = async (
  filename: string,
  data: File,
): Promise<void> => {
  // Define the path to the public directory
  const publicDir = path.join(process.cwd(), 'public');

  // Ensure the directory exists
  if (!fs.existsSync(publicDir)) {
    throw new Error('Public directory does not exist.');
  }

  // Convert the File object to a Buffer
  const buffer = Buffer.from(await data.arrayBuffer());

  // Write the file
  fs.writeFileSync(path.join(publicDir, filename), buffer);
};

export const generateFileUID = async (file: File): Promise<string> => {
  // Read the file content
  const fileContent = await file.arrayBuffer();

  // Create a hash using the file's name, last modified timestamp, and content
  const hash = crypto.createHash('sha256');
  hash.update(file.name + file.lastModified + Buffer.from(fileContent));

  // Return the hex representation of the hash as the UID
  return hash.digest('hex');
};
