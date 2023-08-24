import { NextResponse } from "next/server";
import { setDailyWord } from "../../../../lib/redis";

export async function GET() {
	const response : object = await setDailyWord();
	return NextResponse.json(response);
}