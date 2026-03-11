import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are a savage, witty crypto critic. Roast this wallet address: ${address}. Be funny, ruthless, and keep it under 100 words.`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const roast = completion.choices[0]?.message?.content || "Could not roast this wallet.";
    return NextResponse.json({ roast });
    
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to roast" }, { status: 500 });
  }
}