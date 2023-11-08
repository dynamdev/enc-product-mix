'use client';

import { createContext, FunctionComponent, ReactNode, useState } from 'react';
import { JsonRpcProvider } from 'ethers';
import TrezorConnect, {
  EthereumSignTypedDataMessage,
} from '@trezor/connect-web';
import { keccak256 } from 'js-sha3';
import { TypedDataUtils } from 'eth-sig-util';
import { bufferToHex } from 'ethereumjs-util';

export const TrezorContext = createContext<{
  account: string | null;
  contractProvider: JsonRpcProvider | null;
  storageProvider: JsonRpcProvider | null;
  connect: () => void;
  disconnect: () => void;
  getCrustCloudW3AuthToken: () => Promise<string | null>;
} | null>(null);

// Initialize Trezor Connect
TrezorConnect.manifest({
  email: 'developer@yourdomain.com',
  appUrl: 'http://your.application.com',
});

export const TrezorProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [contractProvider, setContractProvider] =
    useState<JsonRpcProvider | null>(null);
  const [storageProvider, setStorageProvider] =
    useState<JsonRpcProvider | null>(null);

  const getTrezorAccount = async (): Promise<string | null> => {
    try {
      // Get the Ethereum account address from Trezor
      const result = await TrezorConnect.ethereumGetAddress({
        path: "m/44'/60'/0'/0/0",
      });

      if (result.success) {
        return result.payload.address;
      } else {
        // If there was an error, handle it accordingly
        console.error('Error:', result.payload.error);
        return null;
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      return null;
    }
  };

  const connect = async () => {
    const account = await getTrezorAccount();

    if (account === null) return;

    setAccount(account);
    setStorageProvider(
      new JsonRpcProvider(process.env.NEXT_PUBLIC_STORAGE_RPC_URL),
    );
    setContractProvider(
      new JsonRpcProvider(process.env.NEXT_PUBLIC_CONTRACT_RPC_URL),
    );
  };

  const disconnect = () => {
    setAccount(null);
    setStorageProvider(null);
    setContractProvider(null);
    TrezorConnect.dispose().then();
  };

  const getCrustCloudW3AuthToken = async (): Promise<string | null> => {
    const currentTime = Date.now();
    const timeIn30Minutes = currentTime + 30 * 60 * 1000;

    const typedDataMessage: EthereumSignTypedDataMessage<any> = {
      domain: {
        chainId: 1,
        name: 'cloud3.cc',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        description: 'Sign for W3 Bucket Access Authentication',
        signingAddress: account,
        tokenAddress: process.env.NEXT_PUBLIC_CRUST_CLOUD_NFT_TOKEN_ADDRESS,
        tokenId: process.env.NEXT_PUBLIC_CRUST_CLOUD_NFT_TOKEN_ID,
        effectiveTimestamp: (currentTime / 1000) | 0,
        expirationTimestamp: (timeIn30Minutes / 1000) | 0,
      },
      primaryType: 'W3Bucket',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
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

    const result = await TrezorConnect.ethereumSignTypedData({
      metamask_v4_compat: false,
      path: "m/44'/60'/0'/0/0",
      data: typedDataMessage,
    });

    console.log(result);

    if (result.success) {
      // Generate Bearer Token
      const bearerTokenData = {
        data: typedDataMessage,
        signature: result.payload.signature,
      };

      return Buffer.from(JSON.stringify(bearerTokenData)).toString('base64');
    } else {
      return null;
    }
  };

  return (
    <TrezorContext.Provider
      value={{
        account,
        contractProvider,
        storageProvider,
        connect: () => {
          connect().then();
        },
        disconnect,
        getCrustCloudW3AuthToken,
      }}
    >
      {children}
    </TrezorContext.Provider>
  );
};
