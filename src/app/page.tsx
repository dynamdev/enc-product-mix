'use client';

import {
  NftCardComponent,
  NftCardComponentProps,
} from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';
import { UploadToFilebaseFabComponent } from '@/components/UploadToFilebaseFabComponent';
import { useNfts } from '@/hooks/useNfts';

export default function Home() {
  const { nfts, isLoading } = useNfts();

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
