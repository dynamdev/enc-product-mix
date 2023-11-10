'use client';

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { ContractRunner, ethers } from 'ethers';
import enchantmintProductMixNftAbi from '@/abi/enchantmintProductMixNft.json';
import { useMetamask } from '@/hooks/useMetamask';
import { useTrezor } from '@/hooks/useTrezor';

export const SmartContractContext = createContext<{
  getContact: () => ethers.Contract | null;
  getContractOwner: () => Promise<string | null>;
} | null>(null);

export const SmartContractProvider: FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => {
  const { switchNetwork } = useMetamask();

  const getContact = useCallback(() => {
    const polygonChainId = parseInt(process.env.NEXT_PUBLIC_CONTRACT_CHAIN_ID!);
    const signer = switchNetwork(polygonChainId);

    if (signer === null) return null;

    return new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      enchantmintProductMixNftAbi,
      signer as any,
    );
  }, [switchNetwork]);

  const getContractOwner = useCallback(async () => {
    const contract = getContact();
    if (contract === null) return null;

    return await contract.owner();
  }, [getContact]);

  return (
    <SmartContractContext.Provider
      value={{
        getContact,
        getContractOwner,
      }}
    >
      {children}
    </SmartContractContext.Provider>
  );
};
