import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { address, lastPersona } = await req.json();

    const isEth = address.endsWith(".eth");
    const isHex = /^0x[a-fA-F0-9]{40}$/.test(address);
    if (!isEth && !isHex) {
      return NextResponse.json({ error: 'INVALID_ADDRESS' }, { status: 400 });
    }

    const personas = [
      "a cynical 90s cyberpunk hacker who hates everything",
      "a pompous, elitist Wall Street trader looking down on your portfolio",
      "a disappointed, grandmotherly figure who just wants you to do better",
      "an unhinged degen who speaks entirely in meme-slang and crypto-jargon",
      "a cold, clinical AI auditor that lists your financial sins like a court transcript"
    ];

    const available = personas.filter(p => p !== lastPersona);
    const selectedPersona = available[Math.floor(Math.random() * available.length)];

    const stream = await groq.chat.completions.create({
      messages: [{ 
        role: "user", 
        content: `You are ${selectedPersona}. Roast this wallet address: ${address}. Keep it under 150 words. Do not be repetitive. Be creative.` 
      }],
      model: "llama-3.3-8b-instant",
      temperature: 0.9,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            controller.enqueue(encoder.encode(content));
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 
        'Content-Type': 'text/plain', 
        'X-Persona': encodeURIComponent(selectedPersona) 
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'FAILED_TO_ROAST' }, { status: 500 });
  }
}