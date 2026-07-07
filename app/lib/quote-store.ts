import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import type { Band } from "@/app/lib/definitions";
import { monthlyPayment, type QuoteResponse } from "@/app/lib/quote-pricing";

export type QuoteRecord = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  systemSize: number;
  price: number;
  downPayment: number | null;
  band: Band;
  description: string;
};

const quoteWithUserArgs = Prisma.validator<Prisma.QuoteDefaultArgs>()({
  include: {
    user: true,
  },
});

export type QuoteWithUser = Prisma.QuoteGetPayload<typeof quoteWithUserArgs>;

export async function createQuote(input: {
  id: string;
  userId: string;
  date: Date;
  systemSize: number;
  price: number;
  downPayment: number | null;
  band: Band;
  description: string;
}) {

  const quote = await prisma.quote.create({
    data: {
      id: input.id,
      userId: input.userId,
      date: input.date,
      systemSize: input.systemSize,
      price: input.price,
      downPayment: input.downPayment,
      band: input.band,
      description: input.description,
    },
  });

  return quote;
}

export async function getQuoteById(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
}

export async function getQuotesForUser(userId: string, isAdmin: boolean) {
  const quotes = await prisma.quote.findMany({
    where: isAdmin ? undefined : { userId },
    orderBy: { date: "desc" },
    include: {
      user: true,
    },
  });

  return quotes.map((quote) => ({
    id: quote.id,
    userId: quote.userId,
    userName: quote.user.name,
    userEmail: quote.user.email,
    date: quote.date.toISOString(),
    systemSize: quote.systemSize,
    price: quote.price,
    downPayment: quote.downPayment,
    band: quote.band as Band,
    description: quote.description,
  })) satisfies QuoteRecord[];
}

export function toQuoteResponse(quote: QuoteWithUser): QuoteResponse {
  const principalAmount = Math.max(0, quote.price - (quote.downPayment ?? 0));
  const derivedValues = {
    systemPrice: quote.price,
    principalAmount,
    riskBand: quote.band as Band,
    baseApr: quote.band === "A" ? 6.9 : quote.band === "B" ? 8.9 : 11.9,
  };

  return {
    id: quote.id,
    inputs: {
      fullName: "",
      email: "",
      address: quote.description,
      monthlyConsumptionKwh: 0,
      systemSizeKw: quote.systemSize,
      downPayment: quote.downPayment ?? 0,
    },
    derivedValues,
    offers: [
      {
        termYears: 5,
        apr: derivedValues.baseApr,
        principalUsed: derivedValues.principalAmount,
        monthlyPayment: monthlyPayment(derivedValues.principalAmount, derivedValues.baseApr, 5),
      },
      {
        termYears: 10,
        apr: derivedValues.baseApr,
        principalUsed: derivedValues.principalAmount,
        monthlyPayment: monthlyPayment(derivedValues.principalAmount, derivedValues.baseApr, 10),
      },
      {
        termYears: 15,
        apr: derivedValues.baseApr,
        principalUsed: derivedValues.principalAmount,
        monthlyPayment: monthlyPayment(derivedValues.principalAmount, derivedValues.baseApr, 15),
      },
    ],
  };
}
