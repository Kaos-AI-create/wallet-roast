"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { Address, Avatar, Name, Identity } from "@coinbase/onchainkit/identity";

export default function RoastPage() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  if (!hasMounted) return null;
  return <RoastPageContent />;
}

function RoastPageContent() {
  const [address, setAddress] = useState("");
  const [roastStatus, setRoastStatus] = useState<'IDLE' | 'LOADING'>('IDLE');
  const [cooldown, setCooldown] = useState(0);
  const [lastPersona, setLastPersona] = useState("");
  const [displayedRoast, setDisplayedRoast] = useState("");
  const [loadingStateIndex, setLoadingStateIndex] = useState(0);

  const { address: connectedAddress } = useAccount();
  const loadingStates = ["ANALYZING BLOCKCHAIN...", "PREPARING ROTISSERIE...", "TURNING UP HEAT...", "ROASTING..."];

  useEffect(() => { if (connectedAddress) setAddress(connectedAddress); }, [connectedAddress]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRoast = async () => {
    if (roastStatus !== 'IDLE' || cooldown > 0) return;
    setRoastStatus('LOADING');
    setCooldown(30);
    setDisplayedRoast("");
    const loadInterval = setInterval(() => setLoadingStateIndex(prev => (prev + 1) % loadingStates.length), 800);
    
    try {
      const response = await fetch("/api/roast", { 
        method: "POST", 
        body: JSON.stringify({ address, lastPersona }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      clearInterval(loadInterval);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      setLastPersona(decodeURIComponent(response.headers.get('X-Persona') || ""));
      
      let finalRoast = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        finalRoast += decoder.decode(value);
        setDisplayedRoast(finalRoast);
      }
      setRoastStatus('IDLE');
    } catch (e) { 
      console.error(e);
      clearInterval(loadInterval);
      setRoastStatus('IDLE');
    }
  };

  return (
    <main style={{ backgroundColor: '#000', color: '#22c55e', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', fontFamily: 'monospace' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <Wallet>
          <ConnectWallet className="bg-black border border-green-500 text-green-500" />
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick><Avatar /><Name /><Address /></Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      <div style={{ width: '100%', maxWidth: '600px', marginTop: '100px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.3em', marginBottom: '20px', opacity: 0.5, textAlign: 'center' }}>PROPERTY_OF_KAOS_SYSTEMS</p>
        <div style={{ border: '2px solid #22c55e', padding: '30px', background: '#000' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>{">>"} WALLET_ROAST</h1>
          <input
            disabled={roastStatus === 'LOADING'}
            style={{ width: '100%', background: '#000', border: '2px solid #22c55e', padding: '15px', color: '#22c55e', marginBottom: '20px', textAlign: 'center' }}
            placeholder="PASTE_0x_ADDRESS_OR_ENS"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button 
            disabled={roastStatus === 'LOADING' || cooldown > 0}
            onClick={handleRoast} 
            style={{ width: '100%', background: '#22c55e', color: '#000', padding: '15px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {roastStatus === 'LOADING' ? loadingStates[loadingStateIndex] : cooldown > 0 ? `COOLDOWN: ${cooldown}s` : "EXECUTE_ROAST"}
          </button>
        </div>
        
        {displayedRoast && (
          <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #22c55e', color: '#fff', fontSize: '16px' }}>
            {displayedRoast}
          </div>
        )}
      </div>

      <p style={{ fontSize: '10px', letterSpacing: '0.3em', marginTop: 'auto', opacity: 0.5, paddingBottom: '20px' }}>DECENTRALIZED_KAOS_ENGINE_V.1.0.4</p>
    </main>
  );
}