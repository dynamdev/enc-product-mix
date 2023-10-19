import { NextResponse } from 'next/server';
import { getPinnedObjects, uploadToBucket } from '@/helper/filebaseHelper';
import { generateCID } from '@/helper/ipfsHelper';
import axios, { AxiosError } from 'axios';

type TransactionStatus = '0' | '1' | '';

interface ApiResponse {
  status: string;
  message: string;
  result: {
    status: TransactionStatus;
  };
}

export async function GET(request: Request) {
  const data = new URLSearchParams(new URL(request.url).search);
  const txHash: string | null = data.get('txhash') as unknown as string;

  if (!txHash) {
    return NextResponse.json({ error: 'Missing parameters!' }, { status: 400 });
  }

  const url = `${process.env.BLOCKCHAIN_EXPLORER_API_URL}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${process.env.BLOCKCHAIN_EXPLORER_API_KEY}`;

  // Helper function to pause execution for a set period of time
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Keep checking the transaction status until it's no longer pending
  while (true) {
    try {
      const response = await axios.get(url);
      const data = response.data as ApiResponse;

      if (data.result.status === '1') {
        return NextResponse.json({ success: true });
      } else if (data.result.status === '0') {
        return NextResponse.json({ success: false });
      }

      // If transaction is still pending, wait for a while before checking again
      await delay(500); // Delay 0.5 seconds before the next check
    } catch (error) {
      const axiosError = error as AxiosError;
      return NextResponse.json({ error: axiosError.message }, { status: 400 });
    }
  }
}
