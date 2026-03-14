export const fetchRoastStream = async (
  address: string,
  lastPersona: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (err: any) => void
) => {
  try {
    const response = await fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, lastPersona }),
    });

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Heartbeat/Stall detection logic
    let lastDataTime = Date.now();
    const stallWatcher = setInterval(() => {
      if (Date.now() - lastDataTime > 5000) { // 5-second stall threshold
        clearInterval(stallWatcher);
        onError("SYSTEM_STALL_DETECTED");
        // We do not close the reader here to avoid complex state; 
        // the error message will inform the user.
      }
    }, 1000);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      lastDataTime = Date.now(); // Reset heartbeat on data arrival
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }

    clearInterval(stallWatcher);
    onComplete();
  } catch (err) {
    onError(err);
  }
};