export const NftCardComponent = () => {
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
            src={
              'https://ipfs.filebase.io/ipfs/QmZ5LiJvxhuSUx2RKcem2CL95Vx5wgKHqYziQWekqpwBwP'
            }
          />
          {/*Video Preview*/}
        </div>
        <div className="flex flex-col p-5">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
            Noteworthy technology acquisitions 2021
          </h5>
          <p className="mb-3 font-normal text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so
            far, in reverse chronological order.
          </p>
          <div className={'btn btn-primary mx-auto w-full'}>Mint</div>
        </div>
      </div>
    </>
  );
};
