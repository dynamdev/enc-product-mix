import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

type TransactionStatus = '0' | '1' | '';

interface CheckStatusResponse {
  status: string;
  message: string;
  result: {
    status: TransactionStatus;
  };
}

interface GetTokenResponse {
  status: string;
  message: string;
  result: {
    tokenID: number;
  };
}

const checkTxHashStatus = async (txHash: string) => {
  const url = `${process.env.BLOCKCHAIN_EXPLORER_API_URL}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${process.env.BLOCKCHAIN_EXPLORER_API_KEY}`;

  // Helper function to pause execution for a set period of time
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Keep checking the transaction status until it's no longer pending
  while (true) {
    try {
      const response = await axios.get(url);
      const data = response.data as CheckStatusResponse;

      if (data.result.status === '1') {
        return true;
      } else if (data.result.status === '0') {
        return false;
      }

      // If transaction is still pending, wait for a while before checking again
      await delay(500); // Delay 0.5 seconds before the next check
    } catch (error) {
      throw error;
    }
  }
};

const getNftToken = async (account: string) => {
  const url =
    `${process.env.BLOCKCHAIN_EXPLORER_API_URL}` +
    `?module=account` +
    `&action=tokennfttx` +
    `&contractaddress=${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}` +
    `&address=${account}` +
    `&startblock=0` +
    `&endblock=99999999` +
    `&page=1` +
    `&offset=1` +
    `&sort=desc` +
    `&apikey=${process.env.BLOCKCHAIN_EXPLORER_API_KEY}`;

  try {
    const response = await axios.get(url);
    const data = response.data as GetTokenResponse;

    return data.result.tokenID;
  } catch (error) {
    throw error;
  }
};

export async function GET(request: Request) {
  const data = new URLSearchParams(new URL(request.url).search);
  const txHash: string | null = data.get('txhash') as unknown as string;
  const account: string | null = data.get('account') as unknown as string;

  if (!txHash || !account) {
    return NextResponse.json({ error: 'Missing parameters!' }, { status: 400 });
  }

  try {
    if (await checkTxHashStatus(txHash)) {
      return NextResponse.json({
        success: true,
        token: await getNftToken(account),
      });
    } else {
      return NextResponse.json({
        success: false,
        token: 0,
      });
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    return NextResponse.json({ error: axiosError.message }, { status: 400 });
  }
}
