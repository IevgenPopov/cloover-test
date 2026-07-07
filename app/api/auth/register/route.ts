import { createUser } from "@/app/lib/auth-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? "");
    const email = String(body?.email ?? "");
    const password = String(body?.password ?? "");

    const user = await createUser({ name, email, password });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return Response.json({ message }, { status: 400 });
  }
}
