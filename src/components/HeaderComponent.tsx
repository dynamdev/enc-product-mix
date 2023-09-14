import { ButtonMetamaskComponent } from '@/components/ButtonMetamaskComponent';

export const HeaderComponent = () => {
  return (
    <>
      <div className="navbar bg-neutral text-neutral-content flex flex-row justify-between">
        <div className="normal-case text-xl px-4 font-bold">
          Enchantmint Product Mix
        </div>
        <ButtonMetamaskComponent />
      </div>
    </>
  );
};
