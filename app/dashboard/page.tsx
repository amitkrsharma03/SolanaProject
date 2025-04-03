'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { BalanceDisplay } from '@/components/ui/balance-display';
import { TransactionHistory } from '@/components/ui/transaction-history';
import { SendSol } from '@/components/ui/send-sol';
import SendSplToken from '@/components/ui/send-spl-token';
import { Button } from '@/components/ui/button';
import Graph from '@/app/dashboard/graph'

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();

  if (!connected || !publicKey) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h2 className="text-2xl font-semibold">Wallet Not Connected</h2>
          <p className="text-muted-foreground">Please connect your wallet to view the dashboard.</p>
          <Button onClick={() => router.push('/')} className="gradient-button">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Dashboard
      </h1>
      <Graph/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6 bg-accent/20 backdrop-blur-sm border-accent/30 card-hover">
            <div className="flex items-center gap-4 mb-4">
              <Wallet className="w-6 h-6" />
              <h2 className="text-2xl font-semibold">Wallet Balance</h2>
            </div>
            <BalanceDisplay />
          </Card>
          
          <SendSol />
          <SendSplToken />
        </div>

        <TransactionHistory />
      </div>
    </div>
  );
}