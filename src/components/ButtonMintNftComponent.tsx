import { useCallback, useEffect, useState } from 'react';
import { useMetamask } from '@/hooks/useMetamask';
import { useSmartContract } from '@/hooks/useSmartContract';
import { getSmartContractCleanErrorMessage } from '@/helper/smartContractHelper';
import { showErrorToast } from '@/helper/toastHelper';
import { delay } from '@/helper/commonHelper';
import { INft } from '@/interfaces/INft';
import { useNft } from '@/hooks/useNft';

interface ButtonMintNftComponentProps {
  nft: INft;
}

export const ButtonMintNftComponent = (props: ButtonMintNftComponentProps) => {
  const { nft } = props;

  const { signer, account } = useMetamask();
  const { getContact, getContractOwner } = useSmartContract();
  const { mintUnmintedNft } = useNft();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const getNftTokenId = useCallback(
    async (txHash: string): Promise<number | null> => {
      if (signer === null) return null;

      while (true) {
        const txReceipt = await signer.provider.getTransactionReceipt(txHash);

        if (txReceipt === null || txReceipt.confirmations <= 10) {
          await delay(500);
          continue;
        }

        if (txReceipt.logs.length === 0) {
          break;
        }

        const txReceiptLog = txReceipt.logs.filter(
          (log) => log.topics.length === 1,
        )[0];

        return parseInt(txReceiptLog.data, 16);
      }

      return null;
    },
    [signer],
  );

  const onClickMint = useCallback(async () => {
    if (account === null) return;

    const contract = await getContact();
    const contractOwner =
      contract === null ? null : await getContractOwner(contract);

    if (contract === null) return;
    if (account !== contractOwner) return;

    setIsLoading(true);
    setLoadingMessage('Minting...');

    await contract
      .safeMint(
        nft.videoCid,
        process.env.NEXT_PUBLIC_IPFS_MAIN_METADATA_URL + nft.jsonCid,
      )
      .then((contractResponse) => {
        setIsLoading(true);
        setLoadingMessage('Minting...');

        getNftTokenId(contractResponse.hash).then((tokenId) => {
          if (tokenId === null) {
            setIsLoading(false);
            showErrorToast('Minting failed!');
            return;
          }

          //open transaction in blockchain explorer
          window.open(
            process.env.NEXT_PUBLIC_CONTRACT_EXPLORER_URL +
              contractResponse.hash,
          );

          //open link opensea
          window.open(
            process.env.NEXT_PUBLIC_OPENSEA_BASE_URL! +
              process.env.NEXT_PUBLIC_CONTRACT_ADDRESS! +
              '/' +
              tokenId,
          );

          mintUnmintedNft(tokenId, nft).then();
          setIsLoading(false);
        });
      })
      .catch((error) => {
        showErrorToast(getSmartContractCleanErrorMessage(error));
        setIsLoading(false);
      });
  }, [
    account,
    getContact,
    getContractOwner,
    getNftTokenId,
    mintUnmintedNft,
    nft,
  ]);

  return (
    <>
      {isLoading && (
        <>
          <button
            className={'btn btn-primary text-primary-content mx-auto w-full'}
            disabled={true}
          >
            <span className="loading loading-spinner"></span>
            {loadingMessage}
          </button>
        </>
      )}
      {!isLoading && nft.mintDate === null && (
        <button
          className={'btn btn-primary text-primary-content mx-auto w-full'}
          onClick={() => {
            onClickMint().then();
          }}
        >
          Mint
        </button>
      )}
      {!isLoading && nft.mintDate !== null && (
        <div
          className={
            'h-12 font-bold bg-secondary rounded-lg text-secondary-content mx-auto w-full text-center flex flex-col justify-center'
          }
        >
          Minted: {nft.mintDate.toDateString()}{' '}
          {nft.mintDate.toLocaleTimeString()}
        </div>
      )}
    </>
  );
};
