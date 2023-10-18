'use client';

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { ethers } from 'ethers';
import enchantmintProductMixNftAbi from '@/abi/enchantmintProductMixNft.json';
import { useMetamask } from '@/hooks/useMetamask';

export const NftContractContext = createContext<{
  contract: ethers.Contract | null;
  contractOwner: string | null;
} | null>(null);

export const NftContractProvider: FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => {
  const { signer } = useMetamask();

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [contractOwner, setContractOwner] = useState<string | null>(null);

  useEffect(() => {
    if (signer === null) {
      setContract(null);
      return;
    }

    setContract(
      new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        enchantmintProductMixNftAbi,
        signer as any,
      ),
    );
  }, [signer]);

  useEffect(() => {
    if (contract === null) {
      setContractOwner(null);
      return;
    }

    contract
      .owner()
      .then((result) => {
        setContractOwner(result);
      })
      .catch(() => {
        setContractOwner(null);
      })
      .finally(() => {});
  }, [contract]);

  return (
    <NftContractContext.Provider
      value={{
        contract,
        contractOwner,
      }}
    >
      {children}
    </NftContractContext.Provider>
  );
};
