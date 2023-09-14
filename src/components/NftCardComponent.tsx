interface NftCardComponentProps {
  videoUrl: string;
  title: string;
  description: string;
  mintDate: Date | null;
}

export const NftCardComponent = (props: NftCardComponentProps) => {
  const { videoUrl, title, description, mintDate } = props;

  return (
    <>
      <div className="max-w-xs border rounded-lg shadow bg-gray-800 border-gray-700">
        <div
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
        </div>
        <div className="flex flex-col p-5">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
            {title}
          </h5>
          <p className="mb-3 font-normal text-gray-400">{description}</p>
          {mintDate === null && (
            <button
              className={'btn btn-primary text-primary-content mx-auto w-full'}
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
    </>
  );
};
