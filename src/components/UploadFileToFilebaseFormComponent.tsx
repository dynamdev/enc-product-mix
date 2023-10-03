import {
  ChangeEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Store } from 'react-notifications-component';
import axios from 'axios';
import { useNfts } from '@/hooks/useNfts';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

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

  const loadFfmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    });
  };

  const convertVideoToGif = async (video: File): Promise<File> => {
    await ffmpeg.writeFile('video1.mp4', await fetchFile(video));
    await ffmpeg.exec(['-i', 'video1.mp4', '-f', 'gif', 'out.gif']);
    const data = await ffmpeg.readFile('out.gif');
    const blob = new Blob([data], { type: 'image/gif' });
    return new File([blob], 'converted.gif', { type: 'image/gif' });
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

  useEffect(() => {
    loadFfmpeg().then();
  }, []);

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
          <input
            type="text"
            placeholder="Description"
            className="input input-bordered w-full"
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
