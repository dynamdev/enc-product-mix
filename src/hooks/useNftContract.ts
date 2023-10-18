import { useContext } from 'react';
import { NftContractContext } from '@/context/NftContractContext';

export const useNftContract = () => {
  return useContext(NftContractContext)!;
};
