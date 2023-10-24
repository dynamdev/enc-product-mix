'use client';

import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import axios from 'axios';
import { useSmartContract } from '@/hooks/useSmartContract';
import { INft } from '@/interfaces/INft';

export const NftContext = createContext<{
  nfts: INft[];
  addNft: (metadataUri: string) => void;
  isLoading: boolean;
} | null>(null);

export const NftProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { contract } = useSmartContract();

  const [nfts, setNfts] = useState<INft[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getLocalMetadataUris = (): string[] => {
    const localMetadataUrisJson = localStorage.getItem('localMetadataUris');
    return localMetadataUrisJson === null
      ? []
      : JSON.parse(localMetadataUrisJson);
  };

  const getContractMetadataUris = useCallback(async (): Promise<
    { tokenId: number; uri: string }[]
  > => {
    if (contract === null) return [];

    const totalSupply = await contract.totalSupply();
    const totalSupplyNumber = parseInt(totalSupply.toString());

    const contractMetadataUris: { tokenId: number; uri: string }[] = [];

    for (let x = 1; x < totalSupplyNumber; x++) {
      contractMetadataUris.push({
        tokenId: x,
        uri: await contract.tokenURI(x),
      });
    }

    return contractMetadataUris;
  }, [contract]);

  const loadMetadata = async (
    tokenId: number,
    tokenUri: string,
  ): Promise<INft> => {
    const response = await axios.get(tokenUri);
    const data: {
      name: string;
      description: string;
      animation_url: string;
      image: string;
    } = response.data;

    return {
      tokenId,
      description: data.description,
      title: data.name,
      videoCid: data.animation_url.split('/').pop()!,
      thumbnailCid: data.image.split('/').pop()!,
      jsonCid: tokenUri.split('/').pop()!,
    };
  };

  const initializeNfts = useCallback(async () => {
    setIsLoading(true);

    //load local and contract metadata uri
    let localMetadataUris = getLocalMetadataUris();
    const contractMetadataUris = await getContractMetadataUris();

    //remove existing local metadata if found in contract uri
    localMetadataUris = localMetadataUris.filter(
      (uri) =>
        !contractMetadataUris
          .map((metadataUris) => metadataUris.uri)
          .includes(uri),
    );

    //update local storage
    localStorage.setItem(
      'localMetadataUris',
      JSON.stringify(localMetadataUris),
    );

    //merge local and contract metadata uri
    const metadataUris = [
      ...localMetadataUris.map((uri) => {
        return { tokenId: -1, uri };
      }),
      ...contractMetadataUris,
    ];

    //load metadata and set nfts state
    const nfts: INft[] = [];
    for (const metadataUri of metadataUris) {
      nfts.push(await loadMetadata(metadataUri.tokenId, metadataUri.uri));
    }

    setNfts(nfts);
    setIsLoading(false);
  }, [getContractMetadataUris]);

  const addNft = async (metadataUri: string) => {
    //update local storage for new metadata
    const localMetadataUris = getLocalMetadataUris();
    localMetadataUris.push(metadataUri);
    localStorage.setItem(
      'localMetadataUris',
      JSON.stringify(localMetadataUris),
    );

    loadMetadata(-1, metadataUri).then((newNft) => {
      setNfts((nfts) => [newNft, ...nfts]);
    });
  };

  useEffect(() => {
    initializeNfts().then();
  }, [initializeNfts]);

  return (
    <NftContext.Provider
      value={{
        nfts,
        addNft,
        isLoading,
      }}
    >
      {children}
    </NftContext.Provider>
  );
};
