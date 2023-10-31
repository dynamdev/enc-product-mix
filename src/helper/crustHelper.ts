import axios, { AxiosError } from 'axios';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { Keyring } from '@polkadot/keyring';
import { IIpfs } from '@/interfaces/IIpfs';
import { getRecommendedFileUploadTimeout } from '@/helper/fileHelper';
import { CRUST_GATEWAYS } from '@/constants/CrustGatewayConstants';
import { CRUST_MAINNET_ENDPOINTS } from '@/constants/CrustMainnetEndpointConstants';
import { KeyringPair } from '@polkadot/keyring/types';

let crustApiInstance: { api?: ApiPromise; krp?: KeyringPair } | null = null;

const initializeCrustApi = async () => {
  for (const mainnetEndpoint of CRUST_MAINNET_ENDPOINTS) {
    console.info('Trying to connect to crust mainnet: ' + mainnetEndpoint);
    try {
      const api = new ApiPromise({
        provider: new WsProvider(mainnetEndpoint),
        typesBundle: typesBundleForPolkadot,
      });

      await api.isReadyOrError;

      const seeds = process.env.CRUST_SEED_ACCOUNT!;
      const kr = new Keyring({ type: 'sr25519' });
      const krp = kr.addFromUri(seeds);

      if (api.isConnected) {
        console.info('connected to crust mainnet: ' + mainnetEndpoint);
        return {
          api,
          krp,
        };
      }
    } catch (_) {}

    console.warn('Fail to connect to crust mainnet: ' + mainnetEndpoint);
  }
  return {};
};

export const pinToCrustNetwork = async (cid: string, fileSize: number) => {
  if (crustApiInstance === null) crustApiInstance = await initializeCrustApi();

  const { api, krp } = crustApiInstance;

  if (api === undefined || krp === undefined) return false;

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

  for (const gateway of CRUST_GATEWAYS) {
    console.info('Trying to upload to gateway: ' + gateway);
    try {
      const response = await axios.post(
        'https://' + gateway + '/api/v0/add?pin=true',
        formData,
        {
          headers: {
            Authorization: `Basic ${await getAuthHeader()}`,
          },
          timeout: getRecommendedFileUploadTimeout(newFile),
        },
      );

      if (response.data) {
        return response.data as IIpfs;
      }
    } catch (e) {
      console.warn('Failed to upload to crust gateway: ' + gateway);
    }
  }

  throw new Error('All gateways timed out or failed.');
};
