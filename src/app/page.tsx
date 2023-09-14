import { NftCardComponent } from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';

export default function Home() {
  return (
    <>
      <HeaderComponent />
      <main className="flex flex-wrap justify-center gap-4 p-4">
        <NftCardComponent
          videoUrl={
            'https://ipfs.filebase.io/ipfs/QmZ5LiJvxhuSUx2RKcem2CL95Vx5wgKHqYziQWekqpwBwP'
          }
          title={'Ghoti #1'}
          description={'Fish in darkness while in red skin.'}
          mintDate={new Date()}
        />
      </main>
    </>
  );
}
