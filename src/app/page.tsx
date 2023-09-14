'use client';

import {
  NftCardComponent,
  NftCardComponentProps,
} from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GetPinnedObjectsResponse } from '@/lib/filebase';
import { useMetamask } from '@/hooks/useMetamask';
import axios from 'axios';

export default function Home() {
  const [nfts, setNfts] = useState<NftCardComponentProps[]>([]);

  const refreshMetadata = useCallback(() => {
    const loadMetadata = (jsonCid: string) => {
      const baseUrl = 'https://ipfs.filebase.io/ipfs/';
      axios.get(baseUrl + jsonCid).then((response) => {
        const data: {
          name: string;
          description: string;
          animation_url: string;
        } = response.data;
        setNfts((nfts) => {
          nfts.push({
            mintDate: null,
            description: data.description,
            title: data.name,
            videoUrl: data.animation_url,
          });
          return nfts;
        });
      });
    };

    axios.get('/api/filebase').then((response) => {
      const data: GetPinnedObjectsResponse[] = response.data.metadata;
      for (let datum of data) {
        loadMetadata(datum.pin.cid);
      }
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
              mintDate={index === 0 ? new Date('sep 10 2023') : nft.mintDate}
            />
          );
        })}
      </main>
    </>
  );
}
