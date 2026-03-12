import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    const personas = [
      "a cynical 90s cyberpunk hacker who hates everything",
      "a pompous, elitist Wall Street trader looking down on your portfolio",
      "a disappointed, grandmotherly figure who just wants you to do better",
      "an unhinged degen who speaks entirely in meme-slang and crypto-jargon",
      "a cold, clinical AI auditor that lists your financial sins like a court transcript"
    ];

    const selectedPersona = personas[Math.floor(Math.random() * personas.length)];

    const completion = await groq.chat.completions.create({
      messages: [{ 
        role: "user", 
        content: `You are ${selectedPersona}. Roast this wallet address: ${address}. 
        Keep it under 150 words. Do not be repetitive.` 
      }],
      model: "llama-3.3-70b-versatile",
      temperature: 1.0, 
    });

    return NextResponse.json({ roast: completion.choices[0]?.message?.content });
  } catch (error: unknown) {
    // We check if it is an instance of Error to access the .message property safely
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}