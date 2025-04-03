'use client';

import { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, mintTo, getOrCreateAssociatedTokenAccount, getAccount } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Coins } from 'lucide-react';
import { toast } from 'sonner';

export default function TokenPage() {
  const { publicKey, connected } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState('9');
  const [supply, setSupply] = useState('1000000');
  const [mintAmount, setMintAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [progress, setProgress] = useState(''); // Real-time updates

  const createToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setProgress('Initializing token creation...');

    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      setProgress('Funding temporary account with SOL...');

      // Generate a temporary payer and airdrop SOL for funding
      const payer = Keypair.generate();
      const airdropSignature = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(airdropSignature, 'confirmed');

      setProgress('Creating token mint...');
      const mint = await createMint(
        connection,
        payer, // Temporary payer
        publicKey, // Mint authority
        publicKey, // Freeze authority
        Number(decimals) // Number of decimals
      );

      // Update state with mint address and show on UI
      setTokenAddress(mint.toBase58());
      console.log('Mint Address:', mint.toBase58());

      setProgress('Setting up token account...');
      // Get the token account of the creator
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        publicKey
      );

      setProgress('Minting initial supply...');
      // Mint initial supply to the creator's token account
      const totalSupply = BigInt(supply) * BigInt(10 ** Number(decimals));
      await mintTo(
        connection,
        payer,
        mint,
        tokenAccount.address,
        publicKey, // Mint authority (requires signing)
        totalSupply
      );

      setProgress('Fetching token balance...');
      const accountInfo = await getAccount(connection, tokenAccount.address);
      setBalance(accountInfo.amount.toString());

      toast.success('Token created successfully!', {
        description: `Token address: ${mint.toBase58()}`,
      });
    } catch (err) {
      setProgress('');
      console.error('Error during token creation:', err);
      toast.error('Failed to create token', {
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  const mintMoreTokens = async () => {
    if (!connected || !publicKey || !tokenAddress || !mintAmount) {
      toast.error('Please provide all details for minting');
      return;
    }

    setIsLoading(true);
    setProgress('Initializing minting process...');

    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const payer = Keypair.generate();

      setProgress('Setting up associated token account...');
      // Get the associated token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        new PublicKey(tokenAddress),
        publicKey
      );

      setProgress('Minting additional tokens...');
      const amount = BigInt(mintAmount) * BigInt(10 ** Number(decimals));
      await mintTo(
        connection,
        payer,
        new PublicKey(tokenAddress),
        tokenAccount.address,
        publicKey, // Mint authority
        amount
      );

      setProgress('Fetching updated balance...');
      const accountInfo = await getAccount(connection, tokenAccount.address);
      setBalance(accountInfo.amount.toString());

      toast.success(`Successfully minted ${mintAmount} tokens!`);
      setMintAmount(''); // Reset input
    } catch (err) {
      setProgress('');
      console.error('Error during minting:', err);
      toast.error('Failed to mint tokens', {
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    } finally {
      setIsLoading(false);
      setProgress('');
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h2 className="text-2xl font-semibold">Wallet Not Connected</h2>
          <p className="text-muted-foreground">Please connect your wallet to create tokens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Create and Mint Tokens
      </h1>

      <Card className="p-6 bg-accent/20 backdrop-blur-sm border-accent/30">
        <div className="flex items-center gap-4 mb-6">
          <Coins className="w-6 h-6" />
          <h2 className="text-2xl font-semibold">Token Details</h2>
        </div>

        {progress && (
          <div className="p-4 mb-4 rounded-lg bg-primary/10">
            <p className="text-sm font-medium text-primary">{progress}</p>
          </div>
        )}

        <form onSubmit={createToken} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Token Name</Label>
              <Input
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="My Token"
                required
              />
            </div>

            <div>
              <Label>Token Symbol</Label>
              <Input
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                placeholder="MTK"
                required
              />
            </div>

            <div>
              <Label>Decimals</Label>
              <Input
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                min="0"
                max="9"
                required
              />
            </div>

            <div>
              <Label>Initial Supply</Label>
              <Input
                type="number"
                value={supply}
                onChange={(e) => setSupply(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Token...
              </>
            ) : (
              'Create Token'
            )}
          </Button>
        </form>

        {tokenAddress && (
          <div className="mt-6 p-4 rounded-lg bg-accent/30">
            <p className="font-medium">Token Address: {tokenAddress}</p>
            <p className="mt-2 text-sm">Balance: {balance}</p>

            <div className="mt-4">
              <Label>Mint More Tokens</Label>
              <Input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Amount to mint"
              />
              <Button
                onClick={mintMoreTokens}
                className="w-full mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'Minting...' : 'Mint Tokens'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
