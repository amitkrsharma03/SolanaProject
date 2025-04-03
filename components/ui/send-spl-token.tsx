'use client';

import { useState } from "react";
import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { createMint, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";

const connection = new Connection("https://api.devnet.solana.com");

export default function SendSPLToken() {
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState("Idle");
  const [tokenAddress, setTokenAddress] = useState("");

  const createToken = async () => {
    if (!publicKey) return alert("Connect your wallet first");
    setStatus("Creating Token (loading...)");

    try {
      const mint = Keypair.generate();
      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: 82, // Minimum space required for a mint account
          lamports: await connection.getMinimumBalanceForRentExemption(82),
          programId: TOKEN_PROGRAM_ID,
        })
      );
      
      setStatus("In Progress");
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "processed");

      setTokenAddress(mint.publicKey.toBase58());
      setStatus("Token successfully created");

      // Auto-update Minting Page
      updateMintingPage({ mintAddress: mint.publicKey.toBase58(), authority: publicKey.toBase58() });
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  interface UpdateMintingPageParams {
    mintAddress: string;
    authority: string;
  }

  const updateMintingPage = ({ mintAddress, authority }: UpdateMintingPageParams): void => {
    // Logic to update page.tsx with new mint address & authority
    console.log("Updating minting page with:", { mintAddress, authority });
  };

  return (
    <div>
      <button onClick={createToken}>Create Token</button>
      <p>Status: {status}</p>
      {tokenAddress && <p>Token Address: {tokenAddress}</p>}
    </div>
  );
}
// Removed duplicate export default statement