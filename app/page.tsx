'use client';
import { useState } from 'react';

export default function WalletRoast() {
  const [address, setAddress] = useState('');
  const [roast, setRoast] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoast = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      setRoast(data.roast || data.error);
    } catch (err) {
      setRoast("Something went wrong, try again.");
    }
    setLoading(false);
  };

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Wallet Roaster 💀</h1>
      <input 
        value={address} 
        onChange={(e) => setAddress(e.target.value)} 
        placeholder="Enter wallet address"
        style={{ padding: '10px', width: '300px' }}
      />
      <button onClick={handleRoast} style={{ padding: '10px 20px', marginLeft: '10px' }}>
        {loading ? 'Roasting...' : 'Roast Wallet'}
      </button>
      <div style={{ marginTop: '20px', fontSize: '1.2rem', color: '#333' }}>
        {roast}
      </div>
    </main>
  );
}