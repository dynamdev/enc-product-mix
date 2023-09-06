import { Button } from '@/components/ui/button';

interface MintButtonComponentProps {
  isLoading: boolean;
  text: string;
  onCLick: () => void;
}

export const MintButtonComponent = (props: MintButtonComponentProps) => {
  const { onCLick, text, isLoading } = props;

  return (
    <>
      <Button
        onClick={() => {
          onCLick();
        }}
        disabled={isLoading}
      >
        {text}
      </Button>
    </>
  );
};
