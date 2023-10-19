import { Store } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import enchantmintProductMixNftAbi from '@/abi/enchantmintProductMixNft.json';
import { ButtonMintNftComponent } from '@/components/ButtonMintNftComponent';

export interface NftCardComponentProps {
  jsonCid: string;
  videoCid: string;
  thumbnailCid: string;
  title: string;
  description: string;
}

export const NftCardComponent = (props: NftCardComponentProps) => {
  const { jsonCid, thumbnailCid, videoCid, title, description } = props;

  return (
    <>
      <div className="card w-96 bg-base-100 shadow-lg">
        <figure
          className={
            'aspect-video bg-black w-full rounded-t-lg text-center flex flex-col justify-center'
          }
        >
          <img
            className="h-full"
            src={'https://ipfs.filebase.io/ipfs/' + thumbnailCid}
            alt={thumbnailCid}
          />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title">{title}</h2>
          <p>{description}</p>
          <div className="card-actions">
            <ButtonMintNftComponent jsonCid={jsonCid} videoCid={videoCid} />
          </div>
        </div>
      </div>
    </>
  );
};
