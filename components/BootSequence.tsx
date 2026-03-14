"use client";
import { useState, useEffect } from "react";

const logs = [
  "KAOS_ENGINE_V1.0.0 INITIALIZING...",
  "BINDING MEMORY_BUFFER... [OK]",
  "CONNECTING TO ONCHAIN_GATEWAY... [OK]",
  "CRYPTO_PARSER_MODULE: LOADED",
  "TERMINAL READY. AWAITING INPUT."
];

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < logs.length) {
      const timer = setTimeout(() => {
        setDisplayedLogs((prev) => [...prev, logs[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, 600); // Speed of logs
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 1000); // Pause before mounting app
    }
  }, [currentIndex, onComplete]);

  return (
    <div className="flex h-screen w-screen bg-black text-[#39FF14] font-mono p-10">
      <div>
        {displayedLogs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
        <div className="w-3 h-5 bg-[#39FF14] animate-pulse mt-2" />
      </div>
    </div>
  );
}