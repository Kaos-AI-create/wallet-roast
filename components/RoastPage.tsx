"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity } from "@coinbase/onchainkit/identity";

export default function RoastPage() {
  const [hasMounted, _setHasMounted] = useState(false);
  const [address, setAddress] = useState("");
  const [roast, setRoast] = useState("");
  const [displayedRoast, setDisplayedRoast] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'ROASTING'>('IDLE');
  const [cooldown, setCooldown] = useState(0);
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);

 // Add this inside your RoastPage function, below your state definitions
  const { address: connectedAddress } = useAccount();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update the auto-fill logic to use isClient
  useEffect(() => {
    if (isClient && connectedAddress) {
      setAddress(connectedAddress);
    }
  }, [connectedAddress, isClient]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (!roast || displayedRoast === roast) return;
    let i = displayedRoast.length;
    const interval = setInterval(() => {
      i++;
      setDisplayedRoast(roast.substring(0, i) + (i < roast.length ? "█" : ""));
      if (i >= roast.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [roast, displayedRoast]);

  const handleRoast = async () => {
    if (status !== 'IDLE' || cooldown > 0) return;
    const isEth = address.endsWith(".eth");
    const isHex = /^0x[a-fA-F0-9]{40}$/.test(address);
    if (!isEth && !isHex) return alert("INVALID_INPUT");

    setStatus('LOADING');
    setRoast("");
    setDisplayedRoast("");
    setCooldown(30); 
    
    const startTime = Date.now();
    const loadInterval = setInterval(() => setLoadingStateIndex(prev => (prev + 1) % loadingStates.length), 800);
    
    try {
      const res = await fetch("/api/roast", { method: "POST", body: JSON.stringify({ address }), headers: { 'Content-Type': 'application/json' }});
      const data = await res.json();
      const elapsed = Date.now() - startTime;
      if (elapsed < 3000) await new Promise(r => setTimeout(r, 3000 - elapsed));
      
      clearInterval(loadInterval);
      setRoast(data.roast);
      setHistory(prev => [data.roast, ...prev].slice(0, 3));
      setStatus('IDLE');
    } catch (error) { 
      clearInterval(loadInterval);
      setStatus('IDLE');
      console.error("Roast failed:", error);
    }
  };

  if (!hasMounted) return null;

  return (
    <main style={{ backgroundColor: '#000', color: '#22c55e', minHeight: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'monospace' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Wallet>
          <ConnectWallet className="bg-black border border-green-500 text-green-500" />
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar /><Name /><Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      <div style={{ width: '100%', maxWidth: '600px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.3em', marginBottom: '20px', opacity: 0.5, textAlign: 'center' }}>PROPERTY_OF_KAOS_SYSTEMS</p>

        <div style={{ border: '2px solid #22c55e', padding: '30px', background: '#000' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', letterSpacing: '0.2em', textAlign: 'center' }}>{">>"} WALLET_ROAST</h1>
          <input
            disabled={status === 'LOADING'}
            style={{ width: '100%', background: '#000', border: '2px solid #22c55e', padding: '15px', color: '#22c55e', marginBottom: '20px', textAlign: 'center', fontSize: '16px' }}
            placeholder="PASTE_0x_ADDRESS_OR_ENS"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button 
            disabled={status === 'LOADING' || cooldown > 0}
            onClick={handleRoast} 
            style={{ width: '100%', background: (status === 'LOADING' || cooldown > 0) ? '#000' : '#22c55e', color: (status === 'LOADING' || cooldown > 0) ? '#22c55e' : '#000', padding: '15px', fontWeight: 'bold', cursor: (status === 'LOADING' || cooldown > 0) ? 'not-allowed' : 'pointer', border: '2px solid #22c55e', fontSize: '16px' }}
          >
            {status === 'LOADING' ? loadingStates[loadingStateIndex] : cooldown > 0 ? `COOLDOWN: ${cooldown}s` : "EXECUTE_ROAST"}
          </button>
          {roast && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '30px', textAlign: 'left', borderTop: '1px solid #22c55e', paddingTop: '20px' }}>
              <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{displayedRoast}</p>
            </motion.div>
          )}
        </div>

        {/* KAOS Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', opacity: 0.5 }}>
          <p style={{ fontSize: '10px', letterSpacing: '0.2em' }}>DECENTRALIZED_ENGINE_OF_KAOS // v1.0.4-BETA</p>
        </div>

        {history.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <p style={{ fontSize: '8px', opacity: 0.5, marginBottom: '10px', letterSpacing: '0.2em' }}>[PREVIOUS_LOGS]</p>
            {history.map((h, i) => (
              <div key={i} style={{ fontSize: '10px', padding: '10px', borderLeft: '2px solid #22c55e', marginBottom: '10px', background: '#0a0a0a' }}>
                {h.substring(0, 60)}...
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}