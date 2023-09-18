import { useContext } from 'react';
import { MetamaskContext } from '@/context/MetamaskContext';

export const useMetamask = () => {
  return useContext(MetamaskContext)!;
};
