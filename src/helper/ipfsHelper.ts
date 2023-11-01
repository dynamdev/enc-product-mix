export const getIpfsCidFromUrl = (url: string): string | null => {
  try {
    if (url.startsWith('ipfs://')) {
      // Extract CID directly after 'ipfs://'
      return url.slice(7);
    } else {
      // Assuming the URL contains the IPFS CID in its path, extract it
      const ipfsPrefix = '/ipfs/';
      const startIndex = url.indexOf(ipfsPrefix);

      if (startIndex === -1) {
        return null;
      }

      const cid = url.slice(startIndex + ipfsPrefix.length);
      return cid.split('/')[0]; // Return the CID part only
    }
  } catch (error) {
    console.error('Error extracting IPFS CID from URL:', error);
    return null;
  }
};
