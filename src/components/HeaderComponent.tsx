import { ButtonTrezorComponent } from '@/components/ButtonTrezorComponent';

export const HeaderComponent = () => {
  return (
    <>
      <div className="navbar bg-accent text-accent-content flex flex-row justify-between">
        <div className="normal-case text-xl px-4 font-bold">
          Enchantmint Product Mix
        </div>
        <ButtonTrezorComponent />
      </div>
    </>
  );
};
