'use client';

import { createContext, FunctionComponent, ReactNode, useState } from 'react';
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
  getAccounts: () => Promise<string[]>;
  sendTransaction: (
    from: string,
    to: string,
    valueInEther: string,
  ) => Promise<any>;
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
        console.log('chainChanged', net);
        // Refresh the page to handle the network change
        window.location.reload();
      },
    );

    (window.ethereum as GenericProvider).on(
      'disconnect',
      (error: ProviderRpcError) => {
        throw Error(error.message);
      },
    );
  };

  const connect = async () => {
    const provider = setupProvider();
    const accounts: string[] = await provider.send('eth_requestAccounts', []);
    const checksumAccounts: string[] = accounts.map((account) =>
      getAddress(account),
    );
    const network: Network = await provider.getNetwork();
    const signer: JsonRpcSigner = provider.getSigner();
    setNetwork(network);
    setAccounts(checksumAccounts);
    setSigner(signer);
  };

  const getAccounts = async () => {
    const provider = setupProvider();
    const accounts: string[] = await provider.send('eth_accounts', []);
    setAccounts(accounts);
    return accounts;
  };

  const sendTransaction = async (
    from: string,
    to: string,
    valueInEther: string,
  ) => {
    const provider = setupProvider();
    const params = [
      {
        from,
        to,
        value: parseUnits(valueInEther, 'ether').toString(16),
      },
    ];
    return await provider.send('eth_sendTransaction', params);
  };

  return (
    <MetamaskContext.Provider
      value={{
        signer,
        accounts,
        network,
        connect,
        getAccounts,
        sendTransaction,
      }}
    >
      {children}
    </MetamaskContext.Provider>
  );
};
