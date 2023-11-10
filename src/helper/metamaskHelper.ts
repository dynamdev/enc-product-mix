export const formatDisplayAddress = (str: string) => {
  // Get the first four characters
  const start = str.substring(0, 4);

  // Get the last four characters
  const end = str.substring(str.length - 4);

  // Combine the parts
  return start + '...' + end;
};
