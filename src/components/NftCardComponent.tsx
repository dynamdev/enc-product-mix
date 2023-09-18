import { Store } from 'react-notifications-component';
import { useMetamask } from '@/hooks/useMetamask';
import { useCallback } from 'react';

export interface NftCardComponentProps {
  videoUrl: string;
  title: string;
  description: string;
  mintDate: Date | null;
}

export const NftCardComponent = (props: NftCardComponentProps) => {
  const { accounts } = useMetamask();
  const { videoUrl, title, description, mintDate } = props;

  const onClickMint = useCallback(() => {
    console.log(accounts);

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
  }, [accounts]);

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
            src={videoUrl}
          />
        </figure>
        <div className="card-body p-4">
          <h2 className="card-title">{title}</h2>
          <p>{description}</p>
          <div className="card-actions">
            {mintDate === null && (
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
            {mintDate !== null && (
              <div
                className={
                  'h-12 font-bold bg-secondary rounded-lg text-secondary-content mx-auto w-full text-center flex flex-col justify-center'
                }
              >
                Minted: {mintDate.toDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
