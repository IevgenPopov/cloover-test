import crypto from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { createQuote } from "@/app/lib/quote-store";
import { calculateQuote, type QuoteInput } from "@/app/lib/quote-pricing";

export const runtime = "nodejs";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseNumber(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return Number.NaN;
  }

  return Number(value);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Partial<QuoteInput>;

    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const address = String(body.address ?? "").trim();
    const monthlyConsumptionKwh = parseNumber(body.monthlyConsumptionKwh);
    const systemSizeKw = parseNumber(body.systemSizeKw);
    const downPayment = parseNumber(body.downPayment ?? 0);

    if (!fullName) {
      throw new Error("Full name is required.");
    }

    if (!email || !isEmail(email)) {
      throw new Error("A valid email address is required.");
    }

    if (!address) {
      throw new Error("Address is required.");
    }

    if (!Number.isFinite(monthlyConsumptionKwh) || monthlyConsumptionKwh <= 0) {
      throw new Error("Monthly consumption must be a positive number.");
    }

    if (!Number.isFinite(systemSizeKw) || systemSizeKw <= 0) {
      throw new Error("System size must be a positive number.");
    }

    if (!Number.isFinite(downPayment) || downPayment < 0) {
      throw new Error("Down payment must be a valid non-negative number.");
    }

    const calculation = calculateQuote({
      fullName,
      email,
      address,
      monthlyConsumptionKwh,
      systemSizeKw,
      downPayment,
    });

    if (downPayment > calculation.derivedValues.systemPrice) {
      throw new Error("Down payment cannot exceed the system price.");
    }

    const id = crypto.randomUUID();
    const createdAt = new Date();
    const responseBody = {
      id,
      inputs: calculation.inputs,
      derivedValues: calculation.derivedValues,
      offers: calculation.offers,
    };

    await createQuote({
      id,
      userId: session.user.id,
      date: createdAt,
      systemSize: systemSizeKw,
      price: calculation.derivedValues.systemPrice,
      downPayment,
      band: calculation.derivedValues.riskBand,
      description: address,
    });

    return Response.json(responseBody, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to calculate quote.";
    return Response.json({ message }, { status: 400 });
  }
}
