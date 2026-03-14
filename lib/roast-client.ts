// lib/roast-client.ts

export async function fetchRoastStream(
  address: string,
  lastPersona: string,
  onChunk: (chunk: string) => void,
  onComplete: (persona: string) => void,
  onError: (error: Error) => void
) {
  try {
    const response = await fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, lastPersona }),
    });

    if (!response.body) throw new Error("Stream connection failed.");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // Extract metadata before the stream
    const persona = decodeURIComponent(response.headers.get('X-Persona') || "Unknown");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }
    
    onComplete(persona);
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Stream interrupted"));
  }
}