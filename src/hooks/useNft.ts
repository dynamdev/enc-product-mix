import { useContext } from 'react';
import { NftContext } from '@/context/NftContext';

export const useNft = () => {
  return useContext(NftContext)!;
};
