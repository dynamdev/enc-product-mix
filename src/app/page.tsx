'use client';

import {
  NftCardComponent,
  NftCardComponentProps,
} from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GetPinnedObjectsResponse } from '@/lib/filebase';
import axios from 'axios';
import dynamic from 'next/dynamic';

export default function Home() {
  const [nfts, setNfts] = useState<NftCardComponentProps[]>([]);

  const loadMetadata = (jsonCid: string) => {
    const baseUrl = 'https://ipfs.filebase.io/ipfs/';
    return axios.get(baseUrl + jsonCid).then((response) => {
      const data: {
        name: string;
        description: string;
        animation_url: string;
      } = response.data;

      return {
        mintDate: null,
        description: data.description,
        title: data.name,
        videoUrl: data.animation_url,
      };
    });
  };

  const refreshMetadata = useCallback(() => {
    axios.get('/api/filebase').then((response) => {
      const data: GetPinnedObjectsResponse[] = response.data.metadata;
      const promises = data.map((datum) => loadMetadata(datum.pin.cid));

      Promise.all(promises).then((results) => {
        results.sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
        setNfts((prev) => [...prev, ...results]);
      });
    });
  }, []);

  useEffect(() => {
    refreshMetadata();
  }, [refreshMetadata]);

  return (
    <>
      <HeaderComponent />
      <main className="flex flex-wrap justify-center gap-4 p-4">
        {nfts.map((nft, index) => {
          return (
            <NftCardComponent
              key={'nft_' + index}
              videoUrl={nft.videoUrl}
              title={nft.title}
              description={nft.description}
              mintDate={nft.mintDate}
            />
          );
        })}
      </main>
    </>
  );
}
