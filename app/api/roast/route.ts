import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, lastPersona } = body;

    if (!address) {
      return NextResponse.json({ error: 'INVALID_ADDRESS' }, { status: 400 });
    }

    const personas = [
      "a cynical 90s cyberpunk hacker who hates everything",
      "a pompous, elitist Wall Street trader looking down on your portfolio",
      "a disappointed, grandmotherly figure who just wants you to do better",
      "an unhinged degen who speaks entirely in meme-slang and crypto-jargon",
      "a cold, clinical AI auditor that lists your financial sins like a court transcript"
    ];

    const selectedPersona = personas[Math.floor(Math.random() * personas.length)];

    // Using a guaranteed-available model
    const stream = await groq.chat.completions.create({
      messages: [{ 
        role: "user", 
        content: `You are ${selectedPersona}. Roast this wallet address: ${address}. Keep it under 150 words.` 
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
        'X-Persona': encodeURIComponent(selectedPersona) 
      }
    });
  } catch (error) {
    console.error("API_FATAL_ERROR:", error);
    return NextResponse.json({ error: 'FAILED_TO_ROAST' }, { status: 500 });
  }
}