import axios from 'axios';
import { IIpfs } from '@/interfaces/IIpfs';

export const uploadToCrustCloudGateway = async (
  bearerToken: string,
  fileName: string,
  fileData: File | string,
): Promise<IIpfs | null> => {
  let newFile;

  if (fileData instanceof File) {
    newFile = new File([fileData], fileName, {
      type: fileData.type,
      lastModified: fileData.lastModified,
    });
  } else {
    newFile = new File([fileData], fileName, { type: 'application/json' });
  }

  const formData = new FormData();
  formData.append('file', newFile);

  try {
    const response = await axios.post(
      'https://gw-seattle.crustcloud.io/api/v0/add?pin=true',
      formData,
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    );

    return response.data as IIpfs;
  } catch (e) {
    return null;
  }
};

export const pinToCrustCloud = async (
  bearerToken: string,
  fileName: string,
  cid: string,
): Promise<boolean> => {
  try {
    await axios.post(
      'https://pin.crustcloud.io/psa/pins',
      {
        cid: cid,
        name: fileName,
        meta: {
          gatewayId: 1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    );

    return true;
  } catch (e) {
    return false;
  }
};
