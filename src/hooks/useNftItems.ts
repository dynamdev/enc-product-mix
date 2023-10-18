import { useContext } from 'react';
import { NftItemContext } from '@/context/NftItemContext';

export const useNftItems = () => {
  return useContext(NftItemContext)!;
};
