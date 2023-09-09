'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ChangeEvent, useRef, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { MintButtonComponent } from '@/components/MintButtonComponent';
import axios from 'axios';

export default function HomeClient() {
  const { toast } = useToast();

  const refFrom = useRef<HTMLFormElement | null>(null);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Mint');

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setSelectedVideoUrl(objectURL);
      setSelectedVideo(file);
      setFilename(file.name);
    }
  };

  const onMint = () => {
    if (refFrom.current === null) return;

    const isFormValid = refFrom.current.checkValidity();

    if (!isFormValid) return;

    setButtonText('Minting...');
    setIsButtonLoading(true);

    const formData = new FormData();
    formData.append('video', selectedVideo!);
    formData.append('filename', filename);
    formData.append('name', name);
    formData.append('description', description);

    axios.post('/api/mint', formData).then((response) => {
      console.log(response);
      setButtonText('Mint');
      setIsButtonLoading(false);
    });

    // toast({
    //   variant: 'destructive',
    //   title: 'Unsuccessful Mint!',
    //   description: 'Only contract owner can mint!',
    // });
  };

  const onTest = () => {
    console.log('Hello Test!');
  };

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
              onMint();
            }}
            text={buttonText}
            isLoading={isButtonLoading}
          />
          <MintButtonComponent
            onCLick={() => {
              onTest();
            }}
            text={'Test'}
            isLoading={false}
          />
        </form>
      </div>
    </main>
  );
}
