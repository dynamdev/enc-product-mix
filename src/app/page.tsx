'use client';

import {
  NftCardComponent,
  NftCardComponentProps,
} from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GetPinnedObjectsResponse } from '@/lib/filebase';
import axios from 'axios';
import { UploadToFilebaseFabComponent } from '@/components/UploadToFilebaseFabComponent';
import { ReactNotifications } from 'react-notifications-component';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
    setNfts([]);

    axios.get('/api/filebase').then((response) => {
      const data: GetPinnedObjectsResponse[] = response.data.metadata;
      const promises = data.map((datum) => loadMetadata(datum.pin.cid));

      Promise.all(promises).then((results) => {
        results.sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
        setNfts((prev) => [...prev, ...results]);
        setIsLoading(false);
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
        {isLoading && (
          <>
            <span className="loading loading-dots loading-lg h-96"></span>
          </>
        )}

        {!isLoading && nfts.length === 0 && (
          <div className={'h-96 flex flex-col justify-center text-lg'}>
            No Data
          </div>
        )}

        {!isLoading &&
          nfts.map((nft, index) => {
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
      <UploadToFilebaseFabComponent />
    </>
  );
}
