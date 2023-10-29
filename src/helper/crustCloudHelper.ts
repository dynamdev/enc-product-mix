import axios, { AxiosError } from 'axios';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { Keyring } from '@polkadot/keyring';
import { IIpfs } from '@/interfaces/IIpfs';

export const pinToCrustNetwork = async (cid: string, fileSize: number) => {
  const crustChainEndpoint = 'wss://rpc.crust.network';
  const api = new ApiPromise({
    provider: new WsProvider(crustChainEndpoint),
    typesBundle: typesBundleForPolkadot,
  });

  await api.isReadyOrError;

  const seeds = process.env.CRUST_SEED_ACCOUNT!;
  const kr = new Keyring({ type: 'sr25519' });
  const krp = kr.addFromUri(seeds);

  const tx = api.tx.market.placeStorageOrder(cid, fileSize, 10, '');

  return new Promise((resolve, reject) => {
    tx.signAndSend(krp, ({ events = [], status }) => {
      if (status.isInBlock) {
        events.forEach(({ event: { method, section } }) => {
          if (method === 'ExtrinsicSuccess') {
            resolve(true);
          }
        });
      }
    }).catch((e) => {
      reject(e);
    });
  });
};

export const addPrepaidToCrustNetwork = async (cid: string, amount: number) => {
  const crustChainEndpoint = 'wss://rpc.crust.network';
  const api = new ApiPromise({
    provider: new WsProvider(crustChainEndpoint),
    typesBundle: typesBundleForPolkadot,
  });

  await api.isReadyOrError;

  const seeds = process.env.CRUST_SEED_ACCOUNT!;
  const kr = new Keyring({ type: 'sr25519' });
  const krp = kr.addFromUri(seeds);

  const tx = api.tx.market.addPrepaid(cid, amount);

  return new Promise((resolve, reject) => {
    tx.signAndSend(krp, ({ events = [], status }) => {
      if (status.isInBlock) {
        events.forEach(({ event: { method, section } }) => {
          if (method === 'ExtrinsicSuccess') {
            resolve(true);
          }
        });
      }
    }).catch((e) => {
      reject(e);
    });
  });
};

const getAuthHeader = async (): Promise<string> => {
  const seeds = process.env.CRUST_SEED_ACCOUNT!;
  const keyring = new Keyring();
  const pair = keyring.addFromUri(seeds);
  const sig = pair.sign(pair.address);
  const sigHex = '0x' + Buffer.from(sig).toString('hex');

  return Buffer.from(`sub-${pair.address}:${sigHex}`).toString('base64');
};

export const uploadToCrustIpfs = async (
  gatewayUrl: string,
  fileName: string,
  fileData: File | string,
) => {
  let newFile;

  if (fileData instanceof File) {
    newFile = new File([fileData], fileName, {
      type: fileData.type,
      lastModified: fileData.lastModified,
    });
  } else {
    newFile = new File([fileData], fileName, { type: 'text/plain' });
  }

  const formData = new FormData();
  formData.append('file', newFile);

  try {
    const response = await axios.post(gatewayUrl, formData, {
      headers: {
        Authorization: `Basic ${await getAuthHeader()}`,
      },
    });

    return response.data as IIpfs;
  } catch (e) {
    throw e;
  }
};
