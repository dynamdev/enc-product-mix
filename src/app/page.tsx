'use client';

import { NftCardComponent } from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';
import { FabUploadToFilebaseComponent } from '@/components/FabUploadToFilebaseComponent';
import { useNft } from '@/hooks/useNft';
import { ReactNotifications } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';
import { useTrezor } from '@/hooks/useTrezor';

export default function Home() {
  const { nfts, isLoading } = useNft();
  const { account } = useTrezor();

  return (
    <>
      <ReactNotifications />
      <HeaderComponent />
      <main className="flex flex-wrap justify-center gap-4 p-4">
        {isLoading && (
          <>
            <span className="loading loading-dots loading-lg h-96"></span>
          </>
        )}

        {!isLoading && account === null && (
          <div className={'h-96 flex flex-col justify-center text-lg'}>
            Please connect your metamask
          </div>
        )}

        {!isLoading && account !== null && nfts.length === 0 && (
          <div className={'h-96 flex flex-col justify-center text-lg'}>
            No NFT Data
          </div>
        )}

        {!isLoading &&
          account !== null &&
          nfts.map((nft, index) => {
            return (
              <NftCardComponent
                key={'nft_' + index}
                tokenId={nft.tokenId}
                videoCid={nft.videoCid}
                jsonCid={nft.jsonCid}
                title={nft.title}
                description={nft.description}
                thumbnailCid={nft.thumbnailCid}
              />
            );
          })}
      </main>
      <FabUploadToFilebaseComponent />
    </>
  );
}
