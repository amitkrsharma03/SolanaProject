import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Sidebar } from '@/components/ui/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Solana Wallet App',
  description: 'Connect your Solana wallet and view your balance',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-16">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}