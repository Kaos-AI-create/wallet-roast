import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { getPersona } from '@/lib/personas';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, lastPersona } = body;
console.log("DEBUG_DATA:", { address, lastPersona });
    if (!address) {
      return NextResponse.json({ error: 'INVALID_ADDRESS' }, { status: 400 });
    }

    // Mixer Engine: Selects a persona using the modular lib
    const selected = getPersona(lastPersona);

    const stream = await groq.chat.completions.create({
      messages: [{ 
        role: "user", 
        content: `You are ${selected.prompt}. Roast this wallet address: ${address}. Keep it under 150 words.` 
      }],
      model: "llama-3.3-70b-versatile",
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
          console.error("STREAM_CHUNK_ERROR:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 
        'Content-Type': 'text/plain', 
        'X-Persona': encodeURIComponent(selected.prompt) 
      }
    });
  } catch (error) {
    console.error("API_FATAL_ERROR:", error);
    return NextResponse.json({ error: 'FAILED_TO_ROAST' }, { status: 500 });
  }
}