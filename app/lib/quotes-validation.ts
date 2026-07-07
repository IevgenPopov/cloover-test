import type { QuoteFormState } from "@/app/lib/definitions";

export type QuoteFormErrors = Partial<Record<keyof QuoteFormState, string>>;

export function validateQuoteForm(
  form: QuoteFormState,
  derivedValues: {
    monthlyConsumptionKwh: number;
    systemSizeKw: number;
    downPayment: number;
  },
) {
  const nextErrors: QuoteFormErrors = {};

  if (!form.fullName.trim()) {
    nextErrors.fullName = "Full name is required.";
  }

  if (!form.email.trim()) {
    nextErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!form.address.trim()) {
    nextErrors.address = "Address is required.";
  }

  if (!form.monthlyConsumptionKwh.trim()) {
    nextErrors.monthlyConsumptionKwh = "Monthly consumption is required.";
  } else if (!Number.isFinite(derivedValues.monthlyConsumptionKwh) || derivedValues.monthlyConsumptionKwh <= 0) {
    nextErrors.monthlyConsumptionKwh = "Enter a positive number.";
  }

  if (!form.systemSizeKw.trim()) {
    nextErrors.systemSizeKw = "System size is required.";
  } else if (!Number.isFinite(derivedValues.systemSizeKw) || derivedValues.systemSizeKw <= 0) {
    nextErrors.systemSizeKw = "Enter a positive number.";
  }

  if (form.downPayment.trim() && (!Number.isFinite(derivedValues.downPayment) || derivedValues.downPayment < 0)) {
    nextErrors.downPayment = "Enter a valid non-negative number.";
  }

  return nextErrors;
}
