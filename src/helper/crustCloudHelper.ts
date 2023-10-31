import axios from 'axios';
import { IIpfs } from '@/interfaces/IIpfs';
import { JsonRpcProvider, Wallet } from 'ethers';

const generateW3AuthToken = async (): Promise<string> => {
  const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;
  const INFURA_ENDPOINT = process.env.INFURA_ENDPOINT;

  if (!METAMASK_PRIVATE_KEY || !INFURA_ENDPOINT) {
    throw new Error(
      'Environment variables METAMASK_PRIVATE_KEY or INFURA_ENDPOINT are not set.',
    );
  }

  const provider = new JsonRpcProvider(INFURA_ENDPOINT);
  const wallet = new Wallet(METAMASK_PRIVATE_KEY, provider);
  const account = wallet.address;

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
      tokenAddress: process.env.CRUST_CLOUD_NFT_TOKEN_ADDRESS,
      tokenId: process.env.CRUST_CLOUD_NFT_TOKEN_ID,
      effectiveTimestamp: (Date.now() / 1000) | 0,
      expirationTimestamp: (Date.now() / 1000) | 0,
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

  // Sign
  const signature = await wallet.signTypedData(
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
};

export const uploadToCrustCloudIpfs = async (
  fileName: string,
  fileData: File | string,
): Promise<IIpfs> => {
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
          Authorization: `Bearer ${await generateW3AuthToken()}`,
        },
      },
    );

    return response.data as IIpfs;
  } catch (e) {
    throw new Error('All gateways timed out or failed.');
  }
};

export const pinToCrustCloudNetwork = async (cid: string, filename: string) => {
  try {
    const response = await axios.post(
      'https://gw-seattle.crustcloud.io/api/v0/add?pin=true',
      {
        cid: cid,
        name: filename,
        meta: {
          gatewayId: 1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${await generateW3AuthToken()}`,
        },
      },
    );

    return response.data as IIpfs;
  } catch (e) {
    throw new Error('All gateways timed out or failed.');
  }
};
