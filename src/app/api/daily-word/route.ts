import { NextResponse } from "next/server";
import { getDailyWord } from "../../../../lib/redis";

export async function GET(req: Request) {
	const word: string | null = await getDailyWord();

	return NextResponse.json({ word });
}
