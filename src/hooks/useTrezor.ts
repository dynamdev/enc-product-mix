import { useContext } from 'react';
import { MetamaskContext } from '@/context/MetamaskContext';
import { TrezorContext } from '@/context/TrezorContext';

export const useTrezor = () => {
  return useContext(TrezorContext)!;
};
