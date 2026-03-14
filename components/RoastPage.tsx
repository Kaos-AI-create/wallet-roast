"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity } from "@coinbase/onchainkit/identity";
import { fetchRoastStream } from "../lib/roast-client";
import { BootSequence } from "./BootSequence";

export default function RoastPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);
  const [address, setAddress] = useState("");
  const [displayedRoast, setDisplayedRoast] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);

  const { address: connectedAddress, isConnecting } = useAccount();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (connectedAddress && !address) {
      setAddress(connectedAddress);
    }
  }, [connectedAddress]);

  const handleStartRoast = async () => {
    if (!address || isRoasting) return;
    
    setIsRoasting(true);
    setDisplayedRoast(">> ANALYZING_BLOCKS...");
    
    fetchRoastStream(
      address, 
      "", 
      (chunk: string) => {
        setDisplayedRoast((prev) => (prev.includes("ANALYZING") ? chunk : prev + chunk));
      },
      () => setIsRoasting(false),
      (err: any) => {
        console.error("Stream Error:", err);
        setDisplayedRoast((prev) => 
          prev + (err === "SYSTEM_STALL_DETECTED" 
            ? "\n\n[ERR: CONNECTION_STALLED_RETRY_REQUIRED]" 
            : "\n\n[SYSTEM_ERROR: CONNECTION_REJECTED]")
        );
        setIsRoasting(false);
      }
    );
  };

  // 1. Hydration guard
  if (!isMounted) return null;

  // 2. Boot sequence control
  if (!hasBooted) {
    return <BootSequence onComplete={() => setHasBooted(true)} />;
  }

  // 3. Main Application
  return (
    <main style={{ backgroundColor: '#000', color: '#22c55e', minHeight: '100dvh', padding: '20px', fontFamily: 'monospace' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Wallet>
          <ConnectWallet className="bg-black border border-green-500 text-green-500" />
          <WalletDropdown>
            <Identity hasCopyAddressOnClick><Avatar /><Name /><Address /></Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      <div style={{ maxWidth: '600px', margin: '100px auto' }}>
        <h1 style={{ textAlign: 'center' }}>{">>"} WALLET_ROAST</h1>
        
        <input
          disabled={isRoasting}
          style={{ width: '100%', background: '#000', border: '2px solid #22c55e', padding: '15px', color: '#22c55e', marginBottom: '20px' }}
          placeholder="PASTE_0x_ADDRESS"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        
        <button 
          disabled={isRoasting || isConnecting}
          onClick={handleStartRoast} 
          style={{ width: '100%', background: isRoasting ? '#114411' : '#22c55e', color: '#000', padding: '15px', border: 'none' }}
        >
          {isRoasting ? "ANALYZING..." : "EXECUTE_ROAST"}
        </button>

        {displayedRoast && (
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #22c55e', whiteSpace: 'pre-wrap' }}>
            {displayedRoast}
          </div>
        )}
      </div>
    </main>
  );
}