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

type ExtensionForProvider = {
  on: (event: string, callback: (...params: any) => void) => void;
};

// Adds on stream support for listening events.
// see https://github.com/ethers-io/ethers.js/discussions/3230
type GenericProvider = ExternalProvider & ExtensionForProvider;

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export const MetamaskContext = createContext<{
  signer: JsonRpcSigner | null;
  accounts: string[];
  network: Network | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  getAccounts: () => Promise<string[]>;
} | null>(null);

export const MetamaskProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [network, setNetwork] = useState<Network | null>(null);

  const setupProvider = () => {
    if (!window.ethereum) throw Error('Could not find Metamask extension');
    if (provider) return provider;

    const newProvider = new Web3Provider(window.ethereum);
    listenToEvents(newProvider);
    setProvider(newProvider);

    return newProvider;
  };

  const listenToEvents = (provider: Web3Provider) => {
    (window.ethereum as GenericProvider).on(
      'accountsChanged',
      (acc: string[]) => {
        setAccounts(acc);
      },
    );

    (window.ethereum as GenericProvider).on(
      'chainChanged',
      async (net: number) => {
        // console.log('chainChanged ' + net);
        // const network = await provider.detectNetwork();
        // console.log(network);
        // setNetwork(network);
      },
    );

    (window.ethereum as GenericProvider).on(
      'disconnect',
      (error: ProviderRpcError) => {
        //throw Error(error.message);
      },
    );
  };

  const connect = async () => {
    const POLYGON_CHAIN_ID = parseInt(
      process.env.NEXT_PUBLIC_CONTRACT_CHAIN_ID!,
    );

    const POLYGON_CHAIN_ID_HEX = '0x' + POLYGON_CHAIN_ID.toString(16);

    let provider = setupProvider();
    let network: Network = await provider.getNetwork();
    let checksumAccounts: string[] = [];

    // If not on Polygon, prompt the user to switch
    if (network.chainId !== POLYGON_CHAIN_ID) {
      try {
        await provider.send('wallet_switchEthereumChain', [
          {
            chainId: POLYGON_CHAIN_ID_HEX,
          },
        ]);

        provider = setupProvider();
        network = await provider.getNetwork();
      } catch (error) {
        const switchError = error as {
          code: number;
          data?: any;
        };

        // This error code indicates that the requested chain is not added by the user in MetaMask.
        if (switchError.code === 4902) {
          throw new Error(
            'Please add the Polygon network to MetaMask and then connect.',
          );
        } else {
          throw switchError;
        }
      }
    }

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

    setNetwork(network);
    setAccounts(checksumAccounts);
    setSigner(provider.getSigner());
  };

  const disconnect = () => {
    if (provider) {
      provider.removeAllListeners();
    }

    // Reset state
    setProvider(null);
    setSigner(null);
    setAccounts([]);
    setNetwork(null);
  };

  const getAccounts = async () => {
    const provider = setupProvider();
    const accounts: string[] = await provider.send('eth_accounts', []);
    setAccounts(accounts);
    return accounts;
  };

  return (
    <MetamaskContext.Provider
      value={{
        signer,
        accounts,
        network,
        connect,
        disconnect,
        getAccounts,
      }}
    >
      {children}
    </MetamaskContext.Provider>
  );
};
