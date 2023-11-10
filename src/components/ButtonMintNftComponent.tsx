import { useCallback, useEffect, useState } from 'react';
import { useMetamask } from '@/hooks/useMetamask';
import { useSmartContract } from '@/hooks/useSmartContract';
import { getSmartContractCleanErrorMessage } from '@/helper/smartContractHelper';
import { showErrorToast } from '@/helper/toastHelper';
import { delay } from '@/helper/commonHelper';

interface ButtonMintNftComponentProps {
  jsonCid: string;
  videoCid: string;
}

export const ButtonMintNftComponent = (props: ButtonMintNftComponentProps) => {
  const { jsonCid, videoCid } = props;

  const { account, signer } = useMetamask();
  const { getContact, getContractOwner } = useSmartContract();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [mintDate, setMintDate] = useState<Date | null>(null);

  const initialize = useCallback(async () => {
    if (account === null || signer === null) {
      setIsLoading(true);
      setLoadingMessage('Please connect your Metamask');
      return;
    }

    const contract = await getContact();
    const contractOwner =
      contract !== null ? await getContractOwner(contract) : null;

    if (contractOwner === null) {
      setIsLoading(true);
      setLoadingMessage('Checking the owner of the contract!');
      return;
    }

    if (account !== contractOwner) {
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
        setMintDate(new Date(parseInt(result) * 1000));
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, [account, getContact, getContractOwner, signer, videoCid]);

  useEffect(() => {
    if (!isLoaded) {
      initialize().then();
      setIsLoaded(true);
    }
  }, [initialize, isLoaded]);

  const getNftTokenId = useCallback(
    async (txHash: string): Promise<number | null> => {
      if (signer === null) return null;

      while (true) {
        const txReceipt = await signer.provider.getTransactionReceipt(txHash);

        if (txReceipt === null || txReceipt.confirmations >= 10) {
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
  }, [account, getContact, getContractOwner, getNftTokenId, jsonCid, videoCid]);

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
            onClickMint().then();
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
