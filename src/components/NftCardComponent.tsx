import { Store } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import enchantmintProductMixNftAbi from '@/abi/enchantmintProductMixNft.json';
import { ButtonMintNftComponent } from '@/components/ButtonMintNftComponent';
import { INft } from '@/interfaces/INft';

export const NftCardComponent = (props: INft) => {
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
            src={process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL + thumbnailCid}
            alt={thumbnailCid}
          />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title">{title}</h2>

          <p>{description}</p>
          <sub className={'mx-auto pb-2 flex gap-2'}>
            <span>IPFS: </span>
            <span>
              [
              <a
                href={process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL + jsonCid}
                target={'_blank'}
                className={'link'}
              >
                Metadata
              </a>
              ]
            </span>
            <span>
              [
              <a
                href={process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL + thumbnailCid}
                target={'_blank'}
                className={'link'}
              >
                Thumbnail
              </a>
              ]
            </span>
            <span>
              [
              <a
                href={process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL + videoCid}
                target={'_blank'}
                className={'link'}
              >
                Video
              </a>
              ]
            </span>
          </sub>
          <sub className={'mx-auto pb-2 flex gap-2'}>
            <span>Gateway: </span>
            <span>
              [
              <a
                href={process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL + jsonCid}
                target={'_blank'}
                className={'link'}
              >
                Metadata
              </a>
              ]
            </span>
            <span>
              [
              <a
                href={
                  process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL + thumbnailCid
                }
                target={'_blank'}
                className={'link'}
              >
                Thumbnail
              </a>
              ]
            </span>
            <span>
              [
              <a
                href={process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL + videoCid}
                target={'_blank'}
                className={'link'}
              >
                Video
              </a>
              ]
            </span>
          </sub>
          <div className="card-actions">
            <ButtonMintNftComponent jsonCid={jsonCid} videoCid={videoCid} />
          </div>
        </div>
      </div>
    </>
  );
};
