import axios, { AxiosError } from 'axios';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundleForPolkadot } from '@crustio/type-definitions';
import { Keyring } from '@polkadot/keyring';

const pinToCrustNetwork = async (cid: string, fileSize: number) => {
  const crustChainEndpoint = 'wss://rpc.crust.network';
  const api = new ApiPromise({
    provider: new WsProvider(crustChainEndpoint),
    typesBundle: typesBundleForPolkadot,
  });

  await api.isReadyOrError;

  const seeds = process.env.CRUST_SEED_ACCOUNT!;
  const kr = new Keyring({ type: 'sr25519' });
  const krp = kr.addFromUri(seeds);

  const tx = api.tx.market.placeStorageOrder(cid, fileSize, 0, '');

  return new Promise((resolve, reject) => {
    console.log(`💸  Tx Pinning CID`);
    tx.signAndSend(krp, ({ events = [], status }) => {
      console.log(`💸  Tx status: ${status.type}, nonce: ${tx.nonce}`);

      if (status.isInBlock) {
        events.forEach(({ event: { method, section } }) => {
          if (method === 'ExtrinsicSuccess') {
            console.log(`✅  Place storage order success!`);
            resolve(true);
          }
        });
      }
    }).catch((e) => {
      reject(e);
    });
  });
};

const addPrepaidToCrustNetwork = async (cid: string, amount: number) => {
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

  console.log(`💸  Tx Adding Long Term Plan`);
  return new Promise((resolve, reject) => {
    tx.signAndSend(krp, ({ events = [], status }) => {
      console.log(`💸  Tx status: ${status.type}, nonce: ${tx.nonce}`);

      if (status.isInBlock) {
        events.forEach(({ event: { method, section } }) => {
          if (method === 'ExtrinsicSuccess') {
            console.log(`✅  Add prepaid success!`);
            resolve(true);
          }
        });
      } else {
        // Pass it
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
    const response = await axios.post(
      'https://gw.crustfiles.net/api/v0/add?pin=true',
      formData,
      {
        headers: {
          Authorization: `Basic ${await getAuthHeader()}`,
        },
      },
    );

    return response.data as {
      Name: string;
      Hash: string;
      Size: string;
    };
  } catch (e) {
    return null;
  }
};
