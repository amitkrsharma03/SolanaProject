'use client';

import { WalletConnectButton } from '@/components/ui/wallet-connect-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Coins } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletAnimation } from '@/components/ui/wallet-animation';

export default function Home() {
  const { connected } = useWallet(); // Check the connection status

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <div className="rounded-full bg-accent/20 p-4 backdrop-blur-sm">
            <Coins className="w-12 h-12 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Connect Your Solana Wallet
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-[600px]">
            Access your Solana wallet, view your balance, and track your transactions in one place.
          </p>
          
          {connected && <WalletAnimation />} {/* Render WalletAnimation only if connected */}

          <div className="flex flex-col sm:flex-row gap-4">
            <WalletConnectButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-accent/20 backdrop-blur-sm rounded-lg card-hover">
              <h3 className="text-xl font-semibold mb-2">Secure Connection</h3>
              <p className="text-muted-foreground">Connect securely with Phantom or Solflare wallet</p>
            </div>
            <div className="p-6 bg-accent/20 backdrop-blur-sm rounded-lg card-hover">
              <h3 className="text-xl font-semibold mb-2">Real-time Balance</h3>
              <p className="text-muted-foreground">View your SOL balance instantly</p>
            </div>
            <div className="p-6 bg-accent/20 backdrop-blur-sm rounded-lg card-hover">
              <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
              <p className="text-muted-foreground">Track your recent transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
