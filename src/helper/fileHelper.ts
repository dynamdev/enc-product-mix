export const removeExtension = (filename: string): string => {
  // Find the last occurrence of '.' in the filename
  const lastDotIndex = filename.lastIndexOf('.');

  // If there's no '.', return the filename as is
  if (lastDotIndex === -1) return filename;

  // Otherwise, return the substring from the start of the filename to the last '.'
  return filename.substring(0, lastDotIndex);
};

export const getRecommendedFileUploadTimeout = (file: File) => {
  const fileSizeInBytes = file.size;

  // Assuming an upload speed of 62.5 bytes/ms (0.5 Mbps)
  const bytesPerMillisecond = 125;

  // Calculate the recommended timeout based on the file size
  const timeoutInMilliseconds = fileSizeInBytes / bytesPerMillisecond;

  // Add a buffer of 20% to the calculated timeout for potential network fluctuations
  const buffer = 0.2;
  return timeoutInMilliseconds * (1 + buffer);
};
