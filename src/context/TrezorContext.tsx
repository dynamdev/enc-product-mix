'use client';

import { createContext, FunctionComponent, ReactNode, useState } from 'react';
import { JsonRpcProvider } from 'ethers';
import TrezorConnect from '@trezor/connect-web';

export const TrezorContext = createContext<{
  account: string | null;
  contractProvider: JsonRpcProvider | null;
  storageProvider: JsonRpcProvider | null;
  connect: () => void;
  disconnect: () => void;
} | null>(null);

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
      // Initialize Trezor Connect
      TrezorConnect.manifest({
        email: 'developer@yourdomain.com',
        appUrl: 'http://your.application.com',
      });

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
    } finally {
      // Close the Trezor Connect session
      await TrezorConnect.dispose();
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
      }}
    >
      {children}
    </TrezorContext.Provider>
  );
};
