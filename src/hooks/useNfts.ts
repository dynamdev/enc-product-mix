import { useContext } from 'react';
import { NftContext } from '@/context/NftContext';

export const useNfts = () => {
  return useContext(NftContext)!;
};
