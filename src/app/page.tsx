'use client';

import { NftCardComponent } from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';
import { FabUploadToFilebaseComponent } from '@/components/FabUploadToFilebaseComponent';
import { useNft } from '@/hooks/useNft';
import { ReactNotifications } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';

export default function Home() {
  const { nfts, isLoading } = useNft();
  const { accounts, network } = useMetamask();

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

        {!isLoading && accounts.length === 0 && (
          <div className={'h-96 flex flex-col justify-center text-lg'}>
            Please connect your metamask
          </div>
        )}

        {!isLoading &&
          accounts.length !== 0 &&
          network !== null &&
          network.chainId !==
            parseInt(process.env.NEXT_PUBLIC_CONTRACT_CHAIN_ID!) && (
            <div className={'h-96 flex flex-col justify-center text-lg'}>
              Please change your metamask network to{' '}
              {process.env.NEXT_PUBLIC_CONTRACT_CHAIN_NAME}
            </div>
          )}

        {!isLoading &&
          accounts.length !== 0 &&
          network !== null &&
          network.chainId ===
            parseInt(process.env.NEXT_PUBLIC_CONTRACT_CHAIN_ID!) &&
          nfts.length === 0 && (
            <div className={'h-96 flex flex-col justify-center text-lg'}>
              No NFT Data
            </div>
          )}

        {!isLoading &&
          accounts.length !== 0 &&
          network !== null &&
          network.chainId ===
            parseInt(process.env.NEXT_PUBLIC_CONTRACT_CHAIN_ID!) &&
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
