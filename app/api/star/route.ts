import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const starredChats = await prisma.star.findMany({
      include: { chat: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(starredChats);
  } catch (error) {
    console.error("Error fetching starred chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch starred chats" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { chatId } = await req.json();
    if (!chatId)
      return NextResponse.json({ error: "Missing chat ID" }, { status: 400 });

    const existingStar = await prisma.star.findUnique({ where: { chatId } });
    if (existingStar)
      return NextResponse.json({ error: "Already starred" }, { status: 400 });

    const newStar = await prisma.star.create({ data: { chatId } });
    return NextResponse.json(newStar, { status: 201 });
  } catch (error) {
    console.error("Error starring message:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { chatId } = await req.json();
    if (!chatId)
      return NextResponse.json({ error: "Missing chat ID" }, { status: 400 });

    await prisma.star.delete({ where: { chatId } });
    return NextResponse.json({ message: "Unstarred message" }, { status: 200 });
  } catch (error) {
    console.error("Error unstarring message:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
