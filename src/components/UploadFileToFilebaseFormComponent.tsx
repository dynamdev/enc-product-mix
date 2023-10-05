import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Store } from 'react-notifications-component';
import axios from 'axios';
import { useNfts } from '@/hooks/useNfts';
import { convertVideoToGif } from '@/helper/videoHelper';

export const UploadFileToFilebaseFormComponent = (props: {
  toggleModel: () => void;
}) => {
  const { addNft } = useNfts();

  const { toggleModel } = props;

  const refFrom = useRef<HTMLFormElement | null>(null);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [isButtonUploadIpfsLoading, setIsButtonUploadIpfsLoading] =
    useState(false);
  const [buttonUploadIpfsText, setButtonUploadIpfsText] =
    useState('Upload to IPFS');

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setSelectedVideoUrl(objectURL);
      setSelectedVideo(file);
      setFilename(file.name);
    }
  };

  const onUploadToIpfs = async () => {
    if (refFrom.current === null) return;

    const isFormValid = refFrom.current.checkValidity();
    if (!isFormValid) {
      Store.addNotification({
        type: 'danger',
        message: 'Please fill out all required fields before submitting.',
        container: 'top-right',
        dismiss: {
          duration: 3000,
          onScreen: true,
          showIcon: true,
        },
      });
      return;
    }

    setButtonUploadIpfsText('Uploading...');
    setIsButtonUploadIpfsLoading(true);

    const formData = new FormData();
    formData.append('video', selectedVideo!);
    formData.append('gif', await convertVideoToGif(selectedVideo!));
    formData.append('filename', filename);
    formData.append('name', name);
    formData.append('description', description);

    axios
      .put('/api/filebase', formData)
      .then((response) => {
        addNft(response.data.jsonCid);
        toggleModel();
      })
      .finally(() => {
        setButtonUploadIpfsText('Upload to IPFS');
        setIsButtonUploadIpfsLoading(false);

        setSelectedVideoUrl(null);
        setSelectedVideo(null);
        setFilename('');
        setName('');
        setDescription('');
      });
  };

  return (
    <>
      <div className={'flex flex-row justify-center'}>
        <div className={'aspect-video w-full bg-black'}>
          {selectedVideoUrl === null && (
            <div
              className={
                'flex w-full h-full text-xl text-white justify-center items-center'
              }
            >
              Video Preview
            </div>
          )}
          {selectedVideoUrl && (
            <video
              src={selectedVideoUrl}
              loop={true}
              autoPlay={true}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
      <form
        ref={refFrom}
        onSubmit={(event) => {
          event.preventDefault();
        }}
        className={'flex flex-col mt-2 mb-4 mx-auto w-full'}
      >
        <input
          className="file-input file-input-bordered w-full"
          id="picture"
          type="file"
          accept="video/*"
          required={true}
          onChange={handleVideoChange}
        />
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Filename</span>
          </label>
          <input
            type="text"
            placeholder="Filename"
            className="input input-bordered w-full"
            required={true}
            value={filename}
            onChange={(e) => {
              setFilename(e.target.value);
            }}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            placeholder="Name"
            className="input input-bordered w-full"
            required={true}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            placeholder="Description"
            className="textarea textarea-bordered"
            required={true}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </div>
      </form>

      <button
        className={'btn btn-primary w-full'}
        onClick={() => {
          onUploadToIpfs().then();
        }}
        disabled={isButtonUploadIpfsLoading}
      >
        {buttonUploadIpfsText}
      </button>

      {/*<div className={'flex flex-col p-2 mx-auto w-full'}>*/}
      {/*  <div className={'text-center'}>*/}
      {/*    Connected Wallet:{' '}*/}
      {/*    {metamaskAddress === ''*/}
      {/*      ? 'Please connect your wallet!'*/}
      {/*      : metamaskAddress}*/}
      {/*  </div>*/}
      {/*  <MintButtonComponent*/}
      {/*    onCLick={() => {*/}
      {/*      onMintNft();*/}
      {/*    }}*/}
      {/*    text={buttonMintText}*/}
      {/*    isLoading={isButtonMintLoading}*/}
      {/*  />*/}
      {/*</div>*/}
    </>
  );
};
