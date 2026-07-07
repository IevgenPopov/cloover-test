import type { Band } from "@/app/lib/definitions";

export const OFFER_TERMS = [5, 10, 15] as const;

export type QuoteInput = {
  fullName: string;
  email: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment: number;
};

export type QuoteOffer = {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
};

export type QuoteDerivedValues = {
  systemPrice: number;
  principalAmount: number;
  riskBand: Band;
  baseApr: number;
};

export type QuoteResponse = {
  id: string;
  inputs: QuoteInput;
  derivedValues: QuoteDerivedValues;
  offers: QuoteOffer[];
};

export function roundToCents(value: number) {
  return Math.round(value * 100) / 100;
}

export function determineRiskBand(monthlyConsumptionKwh: number, systemSizeKw: number): Band {
  if (monthlyConsumptionKwh >= 400 && systemSizeKw <= 6) {
    return "A";
  }

  if (monthlyConsumptionKwh >= 250) {
    return "B";
  }

  return "C";
}

export function aprForBand(band: Band) {
  if (band === "A") {
    return 6.9;
  }

  if (band === "B") {
    return 8.9;
  }

  return 11.9;
}

export function monthlyPayment(principal: number, apr: number, termYears: number) {
  if (principal <= 0) {
    return 0;
  }

  const monthlyRate = apr / 100 / 12;
  const totalPayments = termYears * 12;

  if (monthlyRate === 0) {
    return roundToCents(principal / totalPayments);
  }

  const payment = principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalPayments)));
  return roundToCents(payment);
}

export function calculateQuote(input: QuoteInput): QuoteResponse {
  const systemPrice = roundToCents(input.systemSizeKw * 1200);
  const principalAmount = roundToCents(systemPrice - input.downPayment);
  const riskBand = determineRiskBand(input.monthlyConsumptionKwh, input.systemSizeKw);
  const baseApr = aprForBand(riskBand);

  return {
    id: "",
    inputs: input,
    derivedValues: {
      systemPrice,
      principalAmount,
      riskBand,
      baseApr,
    },
    offers: OFFER_TERMS.map((termYears) => ({
      termYears,
      apr: baseApr,
      principalUsed: principalAmount,
      monthlyPayment: monthlyPayment(principalAmount, baseApr, termYears),
    })),
  };
}
