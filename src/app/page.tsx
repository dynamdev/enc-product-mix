'use client';

import {
  NftCardComponent,
  NftCardComponentProps,
} from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';
import { FabUploadToFilebaseComponent } from '@/components/FabUploadToFilebaseComponent';
import { useNft } from '@/hooks/useNft';
import { ReactNotifications } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';

export default function Home() {
  const { nfts } = useNft();
  const { accounts } = useMetamask();

  return (
    <>
      <ReactNotifications />
      <HeaderComponent />
      <main className="flex flex-wrap justify-center gap-4 p-4">
        {/*{isLoading && (*/}
        {/*  <>*/}
        {/*    <span className="loading loading-dots loading-lg h-96"></span>*/}
        {/*  </>*/}
        {/*)}*/}

        {nfts.length === 0 && accounts.length === 0 && (
          <div className={'h-96 flex flex-col justify-center text-lg'}>
            Please connect your metamask
          </div>
        )}

        {nfts.length !== 0 &&
          nfts.map((nft, index) => {
            return (
              <NftCardComponent
                key={'nft_' + index}
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
