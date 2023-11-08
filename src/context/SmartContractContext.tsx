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
import { useTrezor } from '@/hooks/useTrezor';

export const SmartContractContext = createContext<{
  contract: ethers.Contract | null;
  contractOwner: string | null;
} | null>(null);

export const SmartContractProvider: FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => {
  const { contractProvider } = useTrezor();

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [contractOwner, setContractOwner] = useState<string | null>(null);

  useEffect(() => {
    if (contractProvider === null) {
      setContract(null);
      return;
    }

    setContract(
      new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        enchantmintProductMixNftAbi,
        contractProvider,
      ),
    );
  }, [contractProvider]);

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
    <SmartContractContext.Provider
      value={{
        contract,
        contractOwner,
      }}
    >
      {children}
    </SmartContractContext.Provider>
  );
};
