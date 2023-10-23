'use client';

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { NftCardComponentProps } from '@/components/NftCardComponent';
import axios from 'axios';
import { GetPinnedObjectsResponse } from '@/helper/filebaseHelper';
import { useSmartContract } from '@/hooks/useSmartContract';
import { Contract } from 'ethers';

export const NftContext = createContext<{
  nfts: NftCardComponentProps[];
  reloadNfts: () => void;
  addNft: (jsonCid: string) => void;
} | null>(null);

export const NftProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { contract } = useSmartContract();

  const [nfts, setNfts] = useState<NftCardComponentProps[]>([]);

  const loadMetadata = async (
    tokenUri: string,
  ): Promise<NftCardComponentProps> => {
    const response = await axios.get(tokenUri);
    const data: {
      name: string;
      description: string;
      animation_url: string;
      image: string;
    } = response.data;

    return {
      description: data.description,
      title: data.name,
      videoCid: data.animation_url.split('/').pop()!,
      thumbnailCid: data.image.split('/').pop()!,
      jsonCid: tokenUri.split('/').pop()!,
    };
  };

  const reloadNfts = useCallback(async () => {
    if (contract === null) return;

    setNfts([]);

    const totalSupply = await contract.totalSupply();
    const totalSupplyNumber = parseInt(totalSupply.toString());

    for (let x = 1; x < totalSupplyNumber; x++) {
      const tokenUri = await contract.tokenURI(x);
      const data = await loadMetadata(tokenUri);

      setNfts((prev) => [...prev, data]);
    }
  }, [contract]);

  const addNft = useCallback((jsonCid: string) => {
    // loadMetadata(jsonCid).then((results) => {
    //   setNfts((prev) => [...prev, results]);
    // });
  }, []);

  useEffect(() => {
    reloadNfts();
  }, [reloadNfts]);

  return (
    <NftContext.Provider
      value={{
        nfts,
        reloadNfts,
        addNft,
      }}
    >
      {children}
    </NftContext.Provider>
  );
};
