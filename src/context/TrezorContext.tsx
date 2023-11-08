'use client';

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { JsonRpcSigner, Network, Web3Provider } from '@ethersproject/providers';
import { getAddress } from 'ethers';
import TrezorConnect from '@trezor/connect-web';

export const TrezorContext = createContext<{
  signer: JsonRpcSigner | null;
  account: string;
  connect: () => void;
  disconnect: () => void;
} | null>(null);

export const TrezorProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string>('');

  const connect = async () => {
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
        setAccount(result.payload.address);
        return;
      } else {
        // If there was an error, handle it accordingly
        console.error('Error:', result.payload.error);
        return;
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      return;
    } finally {
      // Close the Trezor Connect session
      await TrezorConnect.dispose();
    }
  };

  return (
    <TrezorContext.Provider
      value={{
        signer,
        account,
        connect: () => {
          connect().then();
        },
        disconnect: () => {},
      }}
    >
      {children}
    </TrezorContext.Provider>
  );
};
