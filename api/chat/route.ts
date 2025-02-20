import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

const DEFAULT_MODEL = "gpt-3.5-turbo";

export default async function POST(req: Request) {
  try {
    const { input, model = DEFAULT_MODEL } = await req.json();

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: input }],
    });

    const chatResponse = response.choices[0].message.content || "";

    await prisma.chat.create({
      data: {
        model,
        input,
        response: chatResponse,
      },
    });

    return NextResponse.json(
      { response: chatResponse, model },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
