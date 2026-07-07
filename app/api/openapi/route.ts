import { openApiSpec } from "@/app/lib/openapi";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(openApiSpec);
}
