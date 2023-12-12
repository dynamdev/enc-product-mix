import { ButtonMintNftComponent } from '@/components/ButtonMintNftComponent';
import { INft } from '@/interfaces/INft';
import { useNft } from '@/hooks/useNft';

interface NftCardComponentProps {
  nft: INft;
}

export const NftCardComponent = (props: NftCardComponentProps) => {
  const { nft } = props;
  const { removeUnmintedNft } = useNft();

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
            src={
              process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL + nft.thumbnailCid
            }
            alt={nft.thumbnailCid}
          />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title">
            {nft.title}
            <button
              className={'p-2 rounded border tooltip'}
              data-tip={'Hide'}
              onClick={() => {
                removeUnmintedNft(nft);
              }}
            >
              <svg
                className={'text-black h-5 w-5'}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                ></path>
              </svg>
            </button>
          </h2>

          <p>{nft.description}</p>
          <sub className={'mx-auto pb-2 flex gap-2'}>
            <span>IPFS: </span>
            <span>
              [
              <a
                href={process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL + nft.jsonCid}
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
                  process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL + nft.thumbnailCid
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
                href={process.env.NEXT_PUBLIC_IPFS_MAIN_BASE_URL + nft.videoCid}
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
                href={
                  process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL + nft.jsonCid
                }
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
                  process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL +
                  nft.thumbnailCid
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
                href={
                  process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE_URL + nft.videoCid
                }
                target={'_blank'}
                className={'link'}
              >
                Video
              </a>
              ]
            </span>
          </sub>
          <div className="card-actions">
            <ButtonMintNftComponent nft={nft} />
          </div>
        </div>
      </div>
    </>
  );
};
