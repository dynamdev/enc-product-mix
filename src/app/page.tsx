'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChangeEvent, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export default function HomeClient() {
  const { toast } = useToast();

  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      setSelectedVideo(objectURL);
    }
  };

  const onMint = () => {
    console.log('minting ...');
    toast({
      variant: 'destructive',
      title: 'Unsuccessful Mint!',
      description: 'Only contract owner can mint!',
    });
  };

  return (
    <main className="min-h-screen">
      <div className={'max-w-md mx-auto flex flex-col p-2 mt-4 gap-6'}>
        <div className={'flex flex-row justify-center'}>
          <Card className={'aspect-video w-full bg-black'}>
            {selectedVideo === null && (
              <div
                className={
                  'flex w-full h-full text-xl text-white justify-center items-center'
                }
              >
                Video Preview
              </div>
            )}
            {selectedVideo && (
              <video
                src={selectedVideo}
                loop={true}
                autoPlay={true}
                className="w-full h-full"
              />
            )}
          </Card>
        </div>
        <div className={'flex flex-col gap-4 p-2 mx-auto w-full'}>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="picture">Video File</Label>
            <Input
              id="picture"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Filename</Label>
            <Input type="text" placeholder={'Filename'} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Name</Label>
            <Input type="text" placeholder={'Name'} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Description</Label>
            <Textarea placeholder={'Description'} />
          </div>
          <Button
            onClick={() => {
              onMint();
            }}
          >
            Mint
          </Button>
        </div>
      </div>
    </main>
  );
}
