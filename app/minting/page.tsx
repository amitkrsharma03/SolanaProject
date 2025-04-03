'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, Transaction, PublicKey } from '@solana/web3.js';
import {
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  mintTo,
} from '@solana/spl-token';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function CreateAndMintToken() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [amountToMint, setAmountToMint] = useState<string>(''); // For minting additional tokens

  const createToken = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);

    try {
      // Create an SPL token with the user's wallet as the mint authority
      const mint = await createMint(
        connection,                // Solana connection
        Keypair.generate(),        // Temporary fee payer
        publicKey,                 // Mint authority (user's wallet)
        null,                      // Freeze authority (can be null)
        9                          // Decimals
      );

      // Derive the associated token account address for the wallet
      const tokenAccountAddress = await getAssociatedTokenAddress(
        mint, // Mint address
        publicKey // Owner's wallet address
      );

      // Create the associated token account (if it doesn't already exist)
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        publicKey, // Payer
        tokenAccountAddress, // Associated token account address
        publicKey, // Owner
        mint // Mint address
      );

      // Submit the transaction to create the associated token account
      const transaction = new Transaction().add(createATAInstruction);
      await sendTransaction(transaction, connection);

      // Save the mint address for future use
      setMintAddress(mint.toBase58());
      toast.success(`SPL Token created successfully! Mint address: ${mint.toBase58()}`);
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Failed to create the SPL token.', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mintTokens = async () => {
    if (!publicKey || !mintAddress) {
      toast.error('Please create an SPL token first.');
      return;
    }

    setIsLoading(true);

    try {
      // Derive the associated token account address
      const tokenAccountAddress = await getAssociatedTokenAddress(
        new PublicKey(mintAddress), // Mint address
        publicKey // Owner's wallet address
      );

      // Mint additional tokens
      const mintAmount = parseFloat(amountToMint) * 10 ** 9; // Adjust based on input value
      await mintTo(
        connection,                  // Solana connection
        Keypair.generate(),          // Fee payer
        new PublicKey(mintAddress),  // Mint address
        tokenAccountAddress,         // Destination address
        Keypair.generate(),          // Mint authority
        mintAmount                   // Amount to mint
      );

      toast.success(`Minted ${amountToMint} tokens successfully!`);
      setAmountToMint(''); // Reset mint amount field
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error('Failed to mint tokens.', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Create and Mint SPL Token</h2>
      <Button
        onClick={createToken}
        className="w-full mb-4"
        disabled={!publicKey || isLoading}
      >
        {isLoading ? 'Creating...' : 'Create Token'}
      </Button>

      {mintAddress && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Mint Address:</h3>
          <p>{mintAddress}</p>

          <div className="mt-4">
            <h4 className="text-md font-medium">Mint Additional Tokens:</h4>
            <Input
              type="number"
              placeholder="Amount to mint"
              value={amountToMint}
              onChange={(e) => setAmountToMint(e.target.value)}
              className="mb-2"
            />
            <Button
              onClick={mintTokens}
              className="w-full"
              disabled={!publicKey || isLoading || !amountToMint}
            >
              {isLoading ? 'Minting...' : 'Mint Tokens'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

