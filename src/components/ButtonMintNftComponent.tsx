import { useCallback, useEffect, useState } from 'react';
import { useMetamask } from '@/hooks/useMetamask';
import { useSmartContract } from '@/hooks/useSmartContract';
import { getSmartContractCleanErrorMessage } from '@/helper/smartContractHelper';
import { showErrorToast } from '@/helper/toastHelper';
import axios from 'axios';
import { delay } from '@/helper/commonHelper';
import { Interface, ZeroAddress } from 'ethers';

interface ButtonMintNftComponentProps {
  jsonCid: string;
  videoCid: string;
}

export const ButtonMintNftComponent = (props: ButtonMintNftComponentProps) => {
  const { jsonCid, videoCid } = props;

  const { accounts, signer } = useMetamask();
  const { contract, contractOwner } = useSmartContract();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [mintDate, setMintDate] = useState<Date | null>(null);

  useEffect(() => {
    if (accounts.length === 0) {
      setIsLoading(true);
      setLoadingMessage('Please connect your Metamask');
      return;
    }

    if (contractOwner === null) {
      setIsLoading(true);
      setLoadingMessage('Checking the owner of the contract!');
      return;
    }

    if (accounts[0] !== contractOwner) {
      setIsLoading(true);
      setLoadingMessage('You are not the contract owner!');
      return;
    }

    if (contract === null) {
      setIsLoading(true);
      setLoadingMessage("Can't load the smart contract!");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Checking if NFT is already minted');

    setMintDate(null);

    contract
      .getMintDateByVideoCid(videoCid)
      .then((result) => {
        console.log('mint date from contract: ' + result);
        setMintDate(new Date(parseInt(result) * 1000));
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [accounts, accounts.length, contract, contractOwner, videoCid]);

  const getNftTokenId = useCallback(
    async (txHash: string): Promise<number | null> => {
      if (signer === null) return null;

      console.log(signer);
      console.log(txHash);

      const txReceipt = await signer.provider.getTransactionReceipt(txHash);

      console.log(txReceipt);

      return null;
    },
    [signer],
  );

  const onClickMint = useCallback(() => {
    if (accounts.length === 0) return;
    if (accounts[0] !== contractOwner) return;
    if (contract === null) return;

    setIsLoading(true);
    setLoadingMessage('Minting...');

    contract
      .safeMint(
        videoCid,
        process.env.NEXT_PUBLIC_IPFS_MAIN_METADATA_URL + jsonCid,
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

          setMintDate(new Date());
          setIsLoading(false);
        });
      })
      .catch((error) => {
        showErrorToast(getSmartContractCleanErrorMessage(error));
        setIsLoading(false);
      });
  }, [accounts, contract, contractOwner, getNftTokenId, jsonCid, videoCid]);

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
