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
} | null>(null);

export const NftProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { contract } = useSmartContract();

  const [nfts, setNfts] = useState<NftCardComponentProps[]>([]);
  const [localNftMetadataUris, setLocalNftMetadataUris] = useState<string[]>(
    [],
  );
  const [contractNftMetadataUris, setContractNftMetadataUris] = useState<
    string[]
  >([]);

  const getLocalMetadataUris = (): string[] => {
    const localMetadataUrisJson = localStorage.getItem('localMetadataUris');
    return localMetadataUrisJson === null
      ? []
      : JSON.parse(localMetadataUrisJson);
  };

  const getContractMetadataUris = useCallback(async (): Promise<string[]> => {
    if (contract === null) return [];

    const totalSupply = await contract.totalSupply();
    const totalSupplyNumber = parseInt(totalSupply.toString());

    const contractMetadataUris = [];

    for (let x = 1; x < totalSupplyNumber; x++) {
      contractMetadataUris.push(await contract.tokenURI(x));
    }

    return contractMetadataUris;
  }, [contract]);

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

  const initializeNfts = useCallback(async () => {
    //load local and contract metadata uri
    let localMetadataUris = getLocalMetadataUris();
    const contractMetadataUris = await getContractMetadataUris();

    //remove existing local metadata if found in contract uri
    localMetadataUris = localMetadataUris.filter(
      (uri) => !contractMetadataUris.includes(uri),
    );

    //merge local and contract metadata uri
    const metadataUris = [...localMetadataUris, ...contractMetadataUris];

    //load metadata and set nfts state
    for (const metadataUri of metadataUris) {
      loadMetadata(metadataUri).then((result) => {
        setNfts((prevState) => [...prevState, result]);
      });
    }
  }, [getContractMetadataUris]);

  useEffect(() => {
    initializeNfts().then();
  }, [initializeNfts]);

  return (
    <NftContext.Provider
      value={{
        nfts,
      }}
    >
      {children}
    </NftContext.Provider>
  );
};
