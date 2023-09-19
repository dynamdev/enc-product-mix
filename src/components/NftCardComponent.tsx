import { Store } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import enchantmintProductMixNftAbi from '@/abi/enchantmintProductMixNft.json';

export interface NftCardComponentProps {
  jsonCid: string;
  videoCid: string;
  title: string;
  description: string;
}

export const NftCardComponent = (props: NftCardComponentProps) => {
  const { accounts, signer } = useMetamask();

  const { jsonCid, videoCid, title, description } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [mintDate, setMintDate] = useState<Date | null>(null);

  const nftContract = useMemo(
    () =>
      new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        enchantmintProductMixNftAbi,
        signer! as any,
      ),
    [signer],
  );

  useEffect(() => {
    if (accounts.length === 0) {
      setIsLoading(true);
      setLoadingMessage('Please connect your Metamask');
    } else {
      setIsLoading(false);
    }
  }, [accounts.length]);

  useEffect(() => {
    if (accounts.length === 0) return;

    setIsLoading(true);
    setLoadingMessage('Checking if NFT is already minted');

    nftContract
      .getMintDateByVideoCid(videoCid)
      .then((result) => {
        setMintDate(new Date(parseInt(result) * 1000));
      })
      .catch((_) => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [accounts.length, jsonCid, nftContract, videoCid]);

  const onClickMint = useCallback(() => {
    if (accounts.length === 0) {
      Store.addNotification({
        type: 'danger',
        message: 'Please connect your metamask.',
        container: 'top-right',
        dismiss: {
          duration: 3000,
          onScreen: true,
          showIcon: true,
        },
      });
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Minting...');

    nftContract
      .safeMint(videoCid, 'https://ipfs.io/ipfs/' + jsonCid)
      .then((response) => {
        console.log(response);
        setMintDate(new Date());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accounts.length, jsonCid, nftContract, videoCid]);

  return (
    <>
      <div className="card w-96 bg-base-100 shadow-lg">
        <figure
          className={
            'aspect-video bg-black w-full rounded-t-lg text-center flex flex-col justify-center'
          }
        >
          <video
            className="aspect-video w-full"
            autoPlay={true}
            loop={true}
            muted={true}
            src={'https://ipfs.filebase.io/ipfs/' + videoCid}
          />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title">{title}</h2>
          <p>{description}</p>
          <div className="card-actions">
            {isLoading && (
              <>
                <button
                  className={
                    'btn btn-primary text-primary-content mx-auto w-full'
                  }
                  disabled={true}
                >
                  {loadingMessage}
                </button>
              </>
            )}
            {!isLoading && mintDate === null && (
              <button
                className={
                  'btn btn-primary text-primary-content mx-auto w-full'
                }
                onClick={() => {
                  onClickMint();
                }}
              >
                Mint
              </button>
            )}
            {!isLoading && mintDate !== null && (
              <div
                className={
                  'h-12 font-bold bg-secondary rounded-lg text-secondary-content mx-auto w-full text-center flex flex-col justify-center'
                }
              >
                Minted: {mintDate.toDateString()}{' '}
                {mintDate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
