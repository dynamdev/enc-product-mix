import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Store } from 'react-notifications-component';
import axios from 'axios';
import { useNft } from '@/hooks/useNft';
import { convertVideoToGif } from '@/helper/videoHelper';
import { useMetamask } from '@/hooks/useMetamask';
import { useSmartContract } from '@/hooks/useSmartContract';
import { showErrorToast } from '@/helper/toastHelper';
import { IIpfs } from '@/interfaces/IIpfs';
import { removeExtension } from '@/helper/fileHelper';

export interface UploadFileToFilebaseModalComponentElement {
  toggleModal: () => void;
}

// eslint-disable-next-line react/display-name
export const ModalUploadFileToFilebaseComponent = forwardRef<
  UploadFileToFilebaseModalComponentElement,
  {}
>(({}, ref) => {
  const { addNft } = useNft();
  const { accounts } = useMetamask();
  const { contractOwner } = useSmartContract();

  const refFrom = useRef<HTMLFormElement | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setFilename(removeExtension(file.name));
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

    setIsButtonUploadIpfsLoading(true);
    setButtonUploadIpfsText('Generating Gif from Video...');

    const gif = await convertVideoToGif(selectedVideo!);
    const filenameVideo = filename + '.mp4';
    const filenameThumbnail = filename + '.gif';
    const filenameJson = filename + '.json';

    let videoResponse: IIpfs;
    try {
      setButtonUploadIpfsText('Uploading to video to IPFS...');

      const videoFormData = new FormData();
      videoFormData.append('filename', filenameVideo);
      videoFormData.append('fileData', selectedVideo!);

      videoResponse = (
        await axios.put('/api/crust-network/upload', videoFormData)
      ).data;
    } catch (_) {
      setButtonUploadIpfsText('Upload to IPFS');
      setIsButtonUploadIpfsLoading(false);
      showErrorToast('Fail to upload video!');
      return;
    }

    let thumbnailResponse: IIpfs;
    try {
      setButtonUploadIpfsText('Uploading to thumbnail to IPFS...');

      const thumbnailFormData = new FormData();
      thumbnailFormData.append('filename', filenameThumbnail);
      thumbnailFormData.append('fileData', gif);

      thumbnailResponse = (
        await axios.put('/api/crust-network/upload', thumbnailFormData)
      ).data;
    } catch (_) {
      setButtonUploadIpfsText('Upload to IPFS');
      setIsButtonUploadIpfsLoading(false);
      showErrorToast('Fail to upload thumbnail!');
      return;
    }

    let jsonResponse: IIpfs;
    try {
      setButtonUploadIpfsText('Uploading to metadata to IPFS...');

      const jsonContent = JSON.stringify({
        name: name,
        description: description,
        image: 'https://ipfs.io/ipfs/' + thumbnailResponse.Hash,
        animation_url: 'https://ipfs.io/ipfs/' + videoResponse.Hash,
      });

      const jsonFormData = new FormData();
      jsonFormData.append('filename', filenameJson);
      jsonFormData.append('fileData', jsonContent);

      jsonResponse = (
        await axios.put('/api/crust-network/upload', jsonFormData)
      ).data;
    } catch (_) {
      setButtonUploadIpfsText('Upload to IPFS');
      setIsButtonUploadIpfsLoading(false);
      showErrorToast('Fail to upload metadata!');
      return;
    }

    addNft('https://ipfs.io/ipfs/' + jsonResponse.Hash);

    setButtonUploadIpfsText('Upload to IPFS');
    setIsButtonUploadIpfsLoading(false);
    setSelectedVideoUrl(null);
    setSelectedVideo(null);
    setFilename('');
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  const toggleModal = useCallback(() => {
    if (accounts.length === 0) {
      showErrorToast('Please connect your Metamask');
      return;
    }

    if (contractOwner === null) {
      showErrorToast('Checking the owner of the contract!');
      return;
    }

    if (accounts[0] !== contractOwner) {
      showErrorToast('You are not the contract owner!');
      return;
    }

    setIsModalOpen((prevState) => !prevState);
  }, [accounts, contractOwner]);

  useImperativeHandle(ref, () => ({
    toggleModal,
  }));

  return (
    <>
      <div className={'modal ' + (isModalOpen ? 'modal-open' : '')}>
        <div className="modal-box overflow-hidden">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Upload File to Filebase</h3>
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
        </div>
      </div>
    </>
  );
});
