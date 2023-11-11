'use client';

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
} from 'react';
import { ethers } from 'ethers';
import enchantmintProductMixNftAbi from '@/abi/enchantmintProductMixNft.json';
import { useMetamask } from '@/hooks/useMetamask';

export const SmartContractContext = createContext<{
  getContact: () => Promise<ethers.Contract | null>;
  getContractOwner: (contract: ethers.Contract) => Promise<string>;
} | null>(null);

export const SmartContractProvider: FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => {
  const { switchNetwork } = useMetamask();

  const getContact = useCallback(async () => {
    const polygonChainId = parseInt(process.env.NEXT_PUBLIC_CONTRACT_CHAIN_ID!);
    const signer = await switchNetwork(polygonChainId);

    if (signer === null) return null;

    return new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
      enchantmintProductMixNftAbi,
      signer as any,
    );
  }, [switchNetwork]);

  const getContractOwner = useCallback(async (contract: ethers.Contract) => {
    return await contract.owner();
  }, []);

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
