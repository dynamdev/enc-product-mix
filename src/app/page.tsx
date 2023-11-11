'use client';

import { NftCardComponent } from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';
import { FabUploadToFilebaseComponent } from '@/components/FabUploadToFilebaseComponent';
import { useNft } from '@/hooks/useNft';
import { ReactNotifications } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';
import { useTrezor } from '@/hooks/useTrezor';

export default function Home() {
  const { unmintedNfts, mintedNfts, isLoading } = useNft();
  const { account } = useMetamask();

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

        {!isLoading &&
          account !== null &&
          mintedNfts.length + unmintedNfts.length === 0 && (
            <div className={'h-96 flex flex-col justify-center text-lg'}>
              No NFT Data
            </div>
          )}

        {!isLoading && account !== null && unmintedNfts.length !== 0 && (
          <>
            <div className={'container flex flex-col gap-2 mb-4'}>
              <div className={'text-xl font-bold'}>Unminted Nfts</div>
              <div className={'flex flex-wrap gap-2 justify-center'}>
                {unmintedNfts.map((nft, index) => {
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
              </div>
            </div>
          </>
        )}

        {!isLoading && account !== null && mintedNfts.length !== 0 && (
          <>
            <div className={'container flex flex-col gap-2 mb-4'}>
              <div className={'text-xl font-bold'}>Minted Nfts</div>
              <div className={'flex flex-wrap gap-2 justify-center'}>
                {mintedNfts.map((nft, index) => {
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
              </div>
            </div>
          </>
        )}
      </main>
      <FabUploadToFilebaseComponent />
    </>
  );
}
