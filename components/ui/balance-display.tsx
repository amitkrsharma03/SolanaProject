'use client';

import { useEffect, useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function BalanceDisplay() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setError(null);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (err) {
      setError('Failed to fetch balance');
      console.error('Error fetching balance:', err);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchBalance();
    
    // Set up auto-refresh interval
    const intervalId = setInterval(fetchBalance, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchBalance]);

  if (!publicKey) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Coins className="w-6 h-6 text-muted-foreground" />
          <p className="text-muted-foreground">Connect your wallet to view balance</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <Coins className="w-6 h-6" />
        <h2 className="text-2xl font-semibold">SOL Balance</h2>
      </div>
      
      {loading && balance === null ? (
        <Skeleton className="h-10 w-32" />
      ) : error ? (
        <div className="text-destructive">{error}</div>
      ) : (
        <div className="space-y-2">
          <p className="text-3xl font-bold">
            {balance?.toFixed(2)} SOL
          </p>
          <p className="text-sm text-muted-foreground">
            Auto-updates every 30 seconds
          </p>
        </div>
      )}
    </Card>
  );
}