import { parseQuoteRequest, priceOrder } from "@/lib/pricing";
import { getMenu } from "@/lib/store";

export async function POST(request: Request) {
  const req = parseQuoteRequest(await request.json().catch(() => null));
  if (!req) return Response.json({ error: "Invalid request." }, { status: 400 });
  return Response.json({ quote: priceOrder(await getMenu(), req) });
}
