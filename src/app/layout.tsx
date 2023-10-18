import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'react-notifications-component/dist/theme.css';
import { NftItemProvider } from '@/context/NftItemContext';
import { MetamaskContext, MetamaskProvider } from '@/context/MetamaskContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Enchantmint Product Mix',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MetamaskProvider>
          <NftItemProvider>{children}</NftItemProvider>
        </MetamaskProvider>
      </body>
    </html>
  );
}
