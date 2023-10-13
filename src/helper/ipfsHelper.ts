// @ts-ignore
import Hash from 'ipfs-only-hash';

export const generateCID = async (
  filename: string,
  data: File | string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const file: File =
      typeof data === 'string'
        ? new File([data], filename, {
            type: 'text/plain',
          })
        : new File([await data.arrayBuffer()], filename, {
            type: data.type,
          });

    const bytes = await file.arrayBuffer();
    const bufferData = Buffer.from(bytes);

    const cid = await Hash.of(bufferData);
    resolve(cid);
  });
};
