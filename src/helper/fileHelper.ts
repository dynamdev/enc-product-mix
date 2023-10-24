export const removeExtension = (filename: string): string => {
  // Find the last occurrence of '.' in the filename
  const lastDotIndex = filename.lastIndexOf('.');

  // If there's no '.', return the filename as is
  if (lastDotIndex === -1) return filename;

  // Otherwise, return the substring from the start of the filename to the last '.'
  return filename.substring(0, lastDotIndex);
};
