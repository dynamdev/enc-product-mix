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
import { getIpfsCidFromUrl } from '@/helper/ipfsHelper';
import { useMetamask } from '@/hooks/useMetamask';

export const NftContext = createContext<{
  mintedNfts: INft[];
  unmintedNfts: INft[];
  addUnmintedNft: (metadataUri: string) => void;
  removeUnmintedNft: (nft: INft) => void;
  mintUnmintedNft: (tokenId: number, unmintedNft: INft) => Promise<void>;
  isLoading: boolean;
} | null>(null);

export const NftProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { getContact } = useSmartContract();
  const { account } = useMetamask();

  const [isInitialyLoaded, setIsinitialyLoaded] = useState(false);
  const [mintedNfts, setMintedNfts] = useState<INft[]>([]);
  const [unmintedNfts, setUnmintedNfts] = useState<INft[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getLocalMetadataUris = (): string[] => {
    const localMetadataUrisJson = localStorage.getItem('localMetadataUris');
    return localMetadataUrisJson === null
      ? []
      : JSON.parse(localMetadataUrisJson);
  };

  const getContractMetadataUriObjects = useCallback(async (): Promise<
    { tokenId: number; uri: string }[]
  > => {
    const contract = await getContact();

    if (contract === null) return [];

    const totalSupply = await contract.totalSupply();
    const totalSupplyNumber = parseInt(totalSupply.toString());

    const contractMetadataUris: { tokenId: number; uri: string }[] = [];

    for (let x = 1; x <= totalSupplyNumber; x++) {
      const uri = await contract.tokenURI(x);

      contractMetadataUris.push({
        tokenId: x,
        uri:
          process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL! +
          getIpfsCidFromUrl(uri),
      });
    }

    return contractMetadataUris;
  }, [getContact]);

  const loadMetadata = useCallback(
    async (tokenId: number, tokenUri: string): Promise<INft | null> => {
      let gatewayTokenUri = tokenUri.replace(
        process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL!,
        '',
      );
      if (gatewayTokenUri !== tokenUri) {
        gatewayTokenUri =
          process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL + gatewayTokenUri;
      }

      try {
        const response = await axios.get(gatewayTokenUri);
        const data: {
          name: string;
          description: string;
          animation_url: string;
          image: string;
        } = response.data;

        const contract = await getContact();
        if (contract === null) return null;

        let mintDate: string | null;

        try {
          mintDate = await contract.getMintDateByVideoCid(
            getIpfsCidFromUrl(data.animation_url),
          );
        } catch (_) {
          mintDate = null;
        }

        return {
          tokenId,
          mintDate:
            mintDate === null ? null : new Date(parseInt(mintDate) * 1000),
          description: data.description,
          title: data.name,
          videoCid: data.animation_url.split('/').pop()!,
          thumbnailCid: data.image.split('/').pop()!,
          jsonCid: tokenUri.split('/').pop()!,
        };
      } catch (_) {
        return null;
      }
    },
    [getContact],
  );

  const initializeNfts = useCallback(async () => {
    setIsLoading(true);

    //load local and contract metadata uri
    let localMetadataUris = getLocalMetadataUris();
    const contractMetadataUriObjects = await getContractMetadataUriObjects();

    //remove existing local metadata if found in contract uri
    localMetadataUris = localMetadataUris.filter(
      (uri) =>
        !contractMetadataUriObjects
          .map((metadataUri) => getIpfsCidFromUrl(metadataUri.uri))
          .includes(getIpfsCidFromUrl(uri)),
    );

    //update local storage
    localStorage.setItem(
      'localMetadataUris',
      JSON.stringify(localMetadataUris),
    );

    //transform localMetadataUri to {token:number, uri:string}
    const localMetadataUriObjects = localMetadataUris.map((uri) => {
      return { tokenId: -1, uri };
    });

    const mintedNfts: INft[] = [];
    const unmintedNfts: INft[] = [];

    for (const metadataUriObject of localMetadataUriObjects) {
      const newNftData = await loadMetadata(
        metadataUriObject.tokenId,
        metadataUriObject.uri,
      );
      if (newNftData !== null) unmintedNfts.push(newNftData);
    }

    for (const metadataUriObject of contractMetadataUriObjects) {
      const newNftData = await loadMetadata(
        metadataUriObject.tokenId,
        metadataUriObject.uri,
      );
      if (newNftData !== null) mintedNfts.push(newNftData);
    }

    setUnmintedNfts(unmintedNfts);
    setMintedNfts(mintedNfts);
    setIsLoading(false);
  }, [getContractMetadataUriObjects, loadMetadata]);

  const addUnmintedNft = async (metadataUri: string) => {
    //update local storage for new metadata
    const localMetadataUris = getLocalMetadataUris();
    localMetadataUris.push(metadataUri);
    localStorage.setItem(
      'localMetadataUris',
      JSON.stringify(localMetadataUris),
    );

    loadMetadata(-1, metadataUri).then((newNft) => {
      if (newNft === null) return;
      setUnmintedNfts((nfts) => [...nfts, newNft]);
    });
  };

  const mintUnmintedNft = async (tokenId: number, unmintedNft: INft) => {
    const newNft = await loadMetadata(
      tokenId,
      process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL + unmintedNft.jsonCid,
    );

    if (newNft === null) return;

    const newUnmintedNfts = unmintedNfts.filter(
      (nft) => nft.jsonCid !== unmintedNft.jsonCid,
    );

    localStorage.setItem(
      'localMetadataUris',
      JSON.stringify(
        newUnmintedNfts.map(
          (nft) => process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL + nft.jsonCid,
        ),
      ),
    );

    setUnmintedNfts(newUnmintedNfts);
    setMintedNfts((nfts) => [...nfts, newNft]);
  };

  const removeUnmintedNft = (nft: INft) => {
    const confirmMsg =
      'Are you sure you want to hide this NFT? This will not remove the NFT in crust cloud';

    if (!confirm(confirmMsg)) return;

    setUnmintedNfts((unmintedNfts) =>
      unmintedNfts.filter((unmintedNft) => unmintedNft.jsonCid !== nft.jsonCid),
    );

    let localMetadataUris = getLocalMetadataUris();
    localMetadataUris = localMetadataUris.filter(
      (uri) => uri.split('/').pop()! !== nft.jsonCid,
    );

    localStorage.setItem(
      'localMetadataUris',
      JSON.stringify(localMetadataUris),
    );
  };

  useEffect(() => {
    if (account !== null && !isInitialyLoaded) {
      initializeNfts().then();
      setIsinitialyLoaded(true);
    }
  }, [account, initializeNfts, isInitialyLoaded]);

  return (
    <NftContext.Provider
      value={{
        mintedNfts,
        unmintedNfts,
        addUnmintedNft,
        removeUnmintedNft,
        mintUnmintedNft,
        isLoading,
      }}
    >
      {children}
    </NftContext.Provider>
  );
};
