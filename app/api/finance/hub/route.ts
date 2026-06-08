import { NextResponse } from "next/server";
import { getFinanceHubData } from "@/lib/finance/yahoo";

export async function GET() {
  const data = await getFinanceHubData();
  return NextResponse.json(data);
}

