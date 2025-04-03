'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

export function WalletConnectButton({ className }: { className?: string }) {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!connected || !publicKey) {
    return (
      <Button
        onClick={() => setVisible(true)}
        className={className}
        size="lg"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={className}
          size="lg"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {publicKey.toBase58().slice(0, 4)}...
          {publicKey.toBase58().slice(-4)}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem className="flex items-center">
          <span className="font-medium">
            {wallet?.adapter.name || 'Wallet'}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sm text-muted-foreground"
          onClick={() => {
            navigator.clipboard.writeText(publicKey.toBase58());
          }}
        >
          Copy address
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-sm text-destructive"
          onClick={() => disconnect()}
        >
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}