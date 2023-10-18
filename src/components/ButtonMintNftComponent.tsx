import { useCallback, useEffect, useMemo, useState } from 'react';
import { Store } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';
import { ethers, hexlify, bi } from 'ethers';
import enchantmintProductMixNftAbi from '@/abi/enchantmintProductMixNft.json';
import { BigNumber } from '@ethersproject/bignumber';

interface ButtonMintNftComponentProps {
  jsonCid: string;
  videoCid: string;
}

export const ButtonMintNftComponent = (props: ButtonMintNftComponentProps) => {
  const { jsonCid, videoCid } = props;

  const { accounts, signer } = useMetamask();

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
      .safeMint(videoCid, 'https://ipfs.io/ipfs/' + jsonCid, {
        gasLimit: BigNumber.from(250000).toHexString(),
      })
      .then((response) => {
        setMintDate(new Date());
        Store.addNotification({
          type: 'success',
          message: 'Successfully mint!',
          container: 'top-right',
          onRemoval: () => {
            window.open(
              process.env.NEXT_PUBLIC_TRANSACTION_SCAN_URL + response.hash,
            );
          },
          dismiss: {
            duration: 3000,
            onScreen: true,
            showIcon: true,
          },
        });
      })
      .catch((e) => {
        let errorMsg = e.data?.message || e.message || 'An error occurred.';
        console.error(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accounts.length, jsonCid, nftContract, videoCid]);

  return (
    <>
      {isLoading && (
        <>
          <button
            className={'btn btn-primary text-primary-content mx-auto w-full'}
            disabled={true}
          >
            {loadingMessage}
          </button>
        </>
      )}
      {!isLoading && mintDate === null && (
        <button
          className={'btn btn-primary text-primary-content mx-auto w-full'}
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
          Minted: {mintDate.toDateString()} {mintDate.toLocaleTimeString()}
        </div>
      )}
    </>
  );
};
