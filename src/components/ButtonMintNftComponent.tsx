import { useCallback, useEffect, useState } from 'react';
import { useMetamask } from '@/hooks/useMetamask';
import { useSmartContract } from '@/hooks/useSmartContract';
import { getSmartContractCleanErrorMessage } from '@/helper/smartContractHelper';
import { showErrorToast } from '@/helper/toastHelper';
import axios from 'axios';

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

    contract
      .getMintDateByVideoCid(videoCid)
      .then((result) => {
        setMintDate(new Date(parseInt(result) * 1000));
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [accounts, accounts.length, contract, contractOwner, videoCid]);

  const onClickMint = useCallback(() => {
    if (accounts.length === 0) return;
    if (accounts[0] !== contractOwner) return;
    if (contract === null) return;

    setIsLoading(true);
    setLoadingMessage('Minting...');

    contract
      .safeMint(videoCid, 'https://ipfs.io/ipfs/' + jsonCid)
      .then((contractResponse) => {
        setIsLoading(true);
        setLoadingMessage('Minting...');

        axios
          .get('/api/blockchain/check?txhash=' + contractResponse.hash)
          .then((axiosResponse) => {
            const result = axiosResponse.data.success as boolean;

            if (!result) {
              setIsLoading(false);
              showErrorToast('Minting failed!');
              return;
            }

            window.open(
              process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER_URL +
                contractResponse.hash,
            );
            setMintDate(new Date());
            setIsLoading(false);
          })
          .catch((error) => {
            showErrorToast(error.message);
            setIsLoading(false);
          });
      })
      .catch((error) => {
        showErrorToast(getSmartContractCleanErrorMessage(error));
        setIsLoading(false);
      });
  }, [accounts, contract, contractOwner, jsonCid, videoCid]);

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
