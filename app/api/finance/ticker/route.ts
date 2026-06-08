import { NextResponse } from "next/server";
import { getFinanceTickerData } from "@/lib/finance/yahoo";

export async function GET() {
  const data = await getFinanceTickerData();
  return NextResponse.json(data);
}
