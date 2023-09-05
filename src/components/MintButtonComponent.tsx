import { Button } from '@/components/ui/button';

interface MintButtonComponentProps {
  onCLick: () => void;
}
export const MintButtonComponent = (props: MintButtonComponentProps) => {
  const { onCLick } = props;

  return (
    <>
      <Button
        onClick={() => {
          onCLick();
        }}
      >
        Mint
      </Button>
    </>
  );
};
