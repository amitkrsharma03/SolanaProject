'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { ParsedTransactionWithMeta, ParsedInstruction, PartiallyDecodedInstruction } from '@solana/web3.js';
import { Card } from './card';
import { ScrollArea } from './scroll-area';
import { ArrowDownUp } from 'lucide-react';

interface TransactionInfo {
  signature: string;
  timestamp: number;
  amount: number;
  from: string;
  to: string;
}

export function TransactionHistory() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch transactions
  const fetchTransactions = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 }); // Fetch up to 20 signatures

      const transactionDetails = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getParsedTransaction(sig.signature);
          return { signature: sig.signature, tx };
        })
      );

      const parsedTransactions = transactionDetails
        .map(({ signature, tx }) => {
          if (!tx) return null;

          const transferInstruction = tx.transaction.message.instructions.find(
            (instruction): instruction is ParsedInstruction => {
              return (
                'program' in instruction &&
                instruction.program === 'system' &&
                'parsed' in instruction &&
                instruction.parsed.type === 'transfer'
              );
            }
          );

          if (!transferInstruction || !('parsed' in transferInstruction)) return null;

          const { info } = transferInstruction.parsed;

          return {
            signature,
            timestamp: tx.blockTime || 0,
            amount: info.lamports / 1e9, // Convert lamports to SOL
            from: info.source,
            to: info.destination,
          };
        })
        .filter((tx): tx is TransactionInfo => tx !== null);

      // Merge new transactions with existing ones, avoiding duplicates
      setTransactions((prev) => {
        const existingSignatures = new Set(prev.map((tx) => tx.signature));
        const newTransactions = parsedTransactions.filter((tx) => !existingSignatures.has(tx.signature));
        return [...prev, ...newTransactions].sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp, newest first
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Polling for real-time transactions
  useEffect(() => {
    if (!publicKey) return;

    fetchTransactions(); // Initial fetch

    const interval = setInterval(fetchTransactions, 15000); // Poll every 15 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [connection, publicKey]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <ArrowDownUp className="w-6 h-6" />
        <h2 className="text-2xl font-semibold">Transaction History</h2>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        {loading && transactions.length === 0 ? (
          <div className="text-center py-4">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">No transactions found</div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.signature}
                className="p-4 rounded-lg bg-accent/20 backdrop-blur-sm hover:bg-accent/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">
                    {tx.from === publicKey?.toBase58() ? 'Sent' : 'Received'} {tx.amount} SOL
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(tx.timestamp * 1000).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground break-all">{tx.signature}</div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
