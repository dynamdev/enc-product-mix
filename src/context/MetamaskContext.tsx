'use client';

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  ExternalProvider,
  JsonRpcSigner,
  Network,
  Web3Provider,
} from '@ethersproject/providers';
import { getAddress, parseUnits } from 'ethers';

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

export const MetamaskContext = createContext<{
  signer: JsonRpcSigner | null;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<JsonRpcSigner | null>;
} | null>(null);

export const MetamaskProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const setupProvider = () => {
    if (!window.ethereum) throw Error('Could not find Metamask extension');

    const newProvider = new Web3Provider(window.ethereum);

    newProvider.on('accountsChanged', (acc: string[]) => {
      setAccount(acc[0]);
    });

    newProvider.on('chainChanged', async (net: number) => {
      await switchNetwork(net);
    });

    newProvider.on('disconnect', (_) => {
      disconnect();
    });

    return newProvider;
  };

  const connect = async () => {
    let provider = setupProvider();
    let checksumAccounts: string[] = [];

    try {
      const requestedAccounts: string[] = await provider.send(
        'eth_requestAccounts',
        [],
      );
      checksumAccounts = requestedAccounts.map((account) =>
        getAddress(account),
      );
    } catch (_) {}

    if (checksumAccounts.length === 0) return;

    setAccount(checksumAccounts[0]);
    setSigner(provider.getSigner());
  };

  const switchNetwork = async (
    chainId: number,
  ): Promise<JsonRpcSigner | null> => {
    if (signer === null) return null;

    const chainIdHex = '0x' + chainId.toString(16);

    const network = await signer.provider.detectNetwork();

    // If not on Polygon, prompt the user to switch
    if (network.chainId !== chainId) {
      try {
        await signer.provider.send('wallet_switchEthereumChain', [
          {
            chainId: chainIdHex,
          },
        ]);

        const provider = setupProvider();
        const newSigner = provider.getSigner();

        setSigner(newSigner);

        return newSigner;
      } catch (error) {
        const switchError = error as {
          code: number;
          data?: any;
        };

        // This error code indicates that the requested chain is not added by the user in MetaMask.
        if (switchError.code === 4902) {
          throw new Error('Please add the Polygon network to MetaMask!.');
        } else {
          throw switchError;
        }
      }
    }

    return signer;
  };

  const disconnect = () => {
    signer?.provider.removeAllListeners();
    setSigner(null);
    setAccount(null);
  };

  return (
    <MetamaskContext.Provider
      value={{
        signer,
        account,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </MetamaskContext.Provider>
  );
};
