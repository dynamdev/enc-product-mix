import { NftCardComponent } from '@/components/NftCardComponent';
import { HeaderComponent } from '@/components/HeaderComponent';

export default function Home() {
  return (
    <>
      <HeaderComponent />
      <main className="flex flex-wrap justify-center gap-4 p-4">
        <NftCardComponent />
      </main>
    </>
  );
}
