import axios from 'axios';
import { IIpfs } from '@/interfaces/IIpfs';
import { JsonRpcSigner } from '@ethersproject/providers';
import { ethers } from 'ethers';

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
export const generateW3AuthToken = async (
  account: string,
  signer: JsonRpcSigner,
): Promise<string | null> => {
  const currentTime = (Date.now() / 1000) | 0;
  const timeIn30Minutes = ((Date.now() + 30 * 60 * 1000) / 1000) | 0;

  const typedData = {
    domain: {
      chainId: '1',
      name: 'cloud3.cc',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1',
    },
    message: {
      description: 'Sign for W3 Bucket Access Authentication',
      signingAddress: account,
      tokenAddress: process.env.NEXT_PUBLIC_CRUST_CLOUD_NFT_TOKEN_ADDRESS,
      tokenId: process.env.NEXT_PUBLIC_CRUST_CLOUD_NFT_TOKEN_ID,
      effectiveTimestamp: currentTime,
      expirationTimestamp: timeIn30Minutes,
    },
    primaryType: 'W3Bucket',
    types: {
      W3Bucket: [
        { name: 'description', type: 'string' },
        { name: 'signingAddress', type: 'address' },
        { name: 'tokenAddress', type: 'address' },
        { name: 'tokenId', type: 'string' },
        { name: 'effectiveTimestamp', type: 'uint256' },
        { name: 'expirationTimestamp', type: 'uint256' },
      ],
    },
  };

  try {
    // Sign
    const signature = await signer._signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message,
    );

    // Generate Bearer Token
    const bearerTokenData = {
      data: typedData,
      signature: signature,
    };

    return Buffer.from(JSON.stringify(bearerTokenData)).toString('base64');
  } catch (_) {
    return null;
  }
};
