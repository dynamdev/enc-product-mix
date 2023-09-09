'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { MintButtonComponent } from '@/components/MintButtonComponent';
import { BrowserProvider } from 'ethers/providers';
import { Interface, FormatTypes } from '@ethersproject/abi';
import { ethers } from 'ethers';
import axios from 'axios';
import enchantmintProductMixNftAbi from './../abi/enchantmintProductMixNft.json';

const iface = new Interface(enchantmintProductMixNftAbi);
iface.format(FormatTypes.full);

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function HomeClient() {
  const { toast } = useToast();

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

  const [jsonCid, setJsonCid] = useState('');
  const [isButtonMintLoading, setIsButtonMintLoading] = useState(true);
  const [buttonMintText, setButtonMintText] = useState('Mint');
  const [metamaskAddress, setMetamaskAddress] = useState('');
  const [metamaskSigner, setMetamaskSigner] =
    useState<ethers.JsonRpcSigner | null>(null);

  useEffect(() => {
    if (metamaskAddress === '') {
      setButtonMintText('Connect Wallet');
      setIsButtonMintLoading(false);
      return;
    }

    if (jsonCid === '') {
      setIsButtonMintLoading(true);
      setButtonMintText('Mint');
      return;
    }

    setButtonMintText('Mint: ' + jsonCid);
    setIsButtonMintLoading(false);
  }, [jsonCid, metamaskAddress]);

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setSelectedVideoUrl(objectURL);
      setSelectedVideo(file);
      setFilename(file.name);
    }
  };

  const handleConnectWallet = async () => {
    const provider = new BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    setMetamaskAddress(await signer.getAddress());
    setMetamaskSigner(signer);
  };

  const onUploadToIpfs = () => {
    if (refFrom.current === null) return;

    const isFormValid = refFrom.current.checkValidity();

    if (!isFormValid) return;

    setButtonUploadIpfsText('Uploading...');
    setIsButtonUploadIpfsLoading(true);

    const formData = new FormData();
    formData.append('video', selectedVideo!);
    formData.append('filename', filename);
    formData.append('name', name);
    formData.append('description', description);

    axios.post('/api/mint', formData).then((response) => {
      setButtonUploadIpfsText('Upload to IPFS');
      setIsButtonUploadIpfsLoading(false);
      setJsonCid(response.data.jsonCid);
    });
  };

  const onMintNft = useCallback(() => {
    if (metamaskAddress === '') {
      handleConnectWallet().then(() => {});
      return;
    }

    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      enchantmintProductMixNftAbi,
      metamaskSigner,
    );

    nftContract
      .ownerMint('https://ipfs.filebase.io/ipfs/' + jsonCid)
      .then(() => {
        toast({
          title: 'Successfully minted ' + jsonCid,
        });
      });
  }, [metamaskAddress, metamaskSigner]);

  return (
    <main className="min-h-screen">
      <div className={'max-w-md mx-auto flex flex-col p-2 mt-4 gap-6'}>
        <div className={'flex flex-row justify-center'}>
          <Card className={'aspect-video w-full bg-black'}>
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
          </Card>
        </div>
        <form
          ref={refFrom}
          onSubmit={(event) => {
            event.preventDefault();
          }}
          className={'flex flex-col gap-4 p-2 mx-auto w-full'}
        >
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture">Video File</Label>
            <Input
              id="picture"
              type="file"
              accept="video/*"
              required={true}
              onChange={handleVideoChange}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Filename</Label>
            <Input
              type="text"
              placeholder={'Filename'}
              required={true}
              value={filename}
              onChange={(e) => {
                setFilename(e.target.value);
              }}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Name</Label>
            <Input
              type="text"
              placeholder={'Name'}
              required={true}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Description</Label>
            <Textarea
              placeholder={'Description'}
              required={true}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </div>
          <MintButtonComponent
            onCLick={() => {
              onUploadToIpfs();
            }}
            text={buttonUploadIpfsText}
            isLoading={isButtonUploadIpfsLoading}
          />
        </form>
        <div className={'flex flex-col p-2 mx-auto w-full'}>
          <div className={'text-center'}>
            Connected Wallet:{' '}
            {metamaskAddress === ''
              ? 'Please connect your wallet!'
              : metamaskAddress}
          </div>
          <MintButtonComponent
            onCLick={() => {
              onMintNft();
            }}
            text={buttonMintText}
            isLoading={isButtonMintLoading}
          />
        </div>
      </div>
    </main>
  );
}
