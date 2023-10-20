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

export const NftContext = createContext<{
  isLoading: boolean;
  nfts: NftCardComponentProps[];
  reloadNfts: () => void;
  addNft: (jsonCid: string) => void;
} | null>(null);

export const NftProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState<NftCardComponentProps[]>([]);

  const loadMetadata = async (
    jsonCid: string,
  ): Promise<NftCardComponentProps> => {
    const baseUrl = 'https://ipfs.filebase.io/ipfs/';
    const response = await axios.get(baseUrl + jsonCid);
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
      jsonCid: jsonCid,
    };
  };

  const reloadNfts = useCallback(() => {
    setIsLoading(true);
    setNfts([]);

    axios.get('/api/filebase').then((response) => {
      const data: GetPinnedObjectsResponse[] = response.data.metadata;
      const promises = data.map((datum) => loadMetadata(datum.pin.cid));

      Promise.all(promises).then((results) => {
        results.reverse();

        setNfts((prev) => [...prev, ...results]);
        setIsLoading(false);
      });
    });
  }, []);

  const addNft = useCallback((jsonCid: string) => {
    loadMetadata(jsonCid).then((results) => {
      setNfts((prev) => [...prev, results]);
    });
  }, []);

  useEffect(() => {
    reloadNfts();
  }, [reloadNfts]);

  return (
    <NftContext.Provider
      value={{
        isLoading,
        nfts,
        reloadNfts,
        addNft,
      }}
    >
      {children}
    </NftContext.Provider>
  );
};
