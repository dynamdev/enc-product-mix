'use client';

import { useMetamask } from '@/hooks/useMetamask';
import { useTrezor } from '@/hooks/useTrezor';

export const ButtonTrezorComponent = () => {
  const { account, connect, disconnect } = useTrezor();

  const formatAddress = (str: string) => {
    // Ensure the string has at least 6 characters
    if (str.length < 6) {
      return str;
    }

    // Get the first two characters
    const start = str.substring(0, 2);

    // Get the last four characters
    const end = str.substring(str.length - 4);

    // Combine the parts
    return start + '...' + end;
  };

  return (
    <>
      <button
        type="button"
        className="btn bg-white my-auto mx-4"
        onClick={() => {
          if (account === null) {
            connect();
            return;
          }

          if (confirm('Do you want to disconnect?')) {
            disconnect();
          }
        }}
      >
        <svg
          className={'w-6 h-5 '}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 353 512"
          fill="currentColor"
        >
          <path d="M176.478 0C106.241 0 49.4 56.842 49.4 127.079v47.628C24.735 179.172 0 185.125 0 192.85v248.56s0 6.874 7.725 10.135c27.996 11.34 138.135 50.32 163.438 59.251 3.26 1.205 4.181 1.205 5.032 1.205 1.205 0 1.772 0 5.032-1.205 25.302-8.93 135.725-47.911 163.721-59.251 7.158-2.977 7.442-9.852 7.442-9.852V192.85c0-7.725-24.381-13.962-49.116-18.143v-47.628C303.628 56.842 246.432 0 176.478 0zm0 60.74c41.391 0 66.41 25.019 66.41 66.41v41.39c-46.423-3.26-86.042-3.26-132.748 0v-41.39c0-41.462 25.018-66.41 66.338-66.41zm-.283 168.753c57.763 0 106.241 4.465 106.241 12.474V397.04c0 2.41-.283 2.693-2.41 3.544-2.055.921-98.515 35.72-98.515 35.72s-3.899 1.206-5.033 1.206c-1.204 0-5.032-1.489-5.032-1.489s-96.46-34.8-98.516-35.72c-2.055-.922-2.41-1.206-2.41-3.545V241.683c-.567-8.009 47.912-12.19 105.675-12.19z" />
        </svg>

        {account === null && 'Connect with Trezor'}
        {account !== null && 'Connected: ' + formatAddress(account)}
      </button>
    </>
  );
};