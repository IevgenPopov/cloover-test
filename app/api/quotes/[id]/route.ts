import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getQuoteById, toQuoteResponse } from "@/app/lib/quote-store";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuoteById(id);
  if (!quote) {
    return Response.json({ message: "Quote not found" }, { status: 404 });
  }

  if (session.user.role !== "admin" && quote.userId !== session.user.id) {
    return Response.json({ message: "Forbidden" }, { status: 403 });
  }

  return Response.json(toQuoteResponse(quote));
}
