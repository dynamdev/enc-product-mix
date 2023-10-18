import { useContext } from 'react';
import { SmartContractContext } from '@/context/SmartContractContext';

export const useSmartContract = () => {
  return useContext(SmartContractContext)!;
};
