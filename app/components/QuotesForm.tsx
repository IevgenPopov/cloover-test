"use client";

import type {FormEvent, ReactNode} from "react";
import {useMemo, useState} from "react";
import type {QuoteFormState, QuoteResult, SessionUser} from "@/app/lib/definitions";
import { validateQuoteForm, type QuoteFormErrors } from "@/app/lib/quotes-validation";

const initialState = (user: SessionUser): QuoteFormState => ({
  fullName: user.name ?? "",
  email: user.email ?? "",
  address: "",
  monthlyConsumptionKwh: "",
  systemSizeKw: "",
  downPayment: "",
});

export default function QuotesForm({ user }: { user: SessionUser }) {
  const [form, setForm] = useState<QuoteFormState>(() => initialState(user));
  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);

  const monthlyConsumption = useMemo(() => Number(form.monthlyConsumptionKwh), [form.monthlyConsumptionKwh]);
  const systemSize = useMemo(() => Number(form.systemSizeKw), [form.systemSizeKw]);
  const downPayment = useMemo(() => Number(form.downPayment || 0), [form.downPayment]);

  function updateField<K extends keyof QuoteFormState>(key: K, value: QuoteFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const nextErrors = validateQuoteForm(form, {
      monthlyConsumptionKwh: monthlyConsumption,
      systemSizeKw: systemSize,
      downPayment,
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setResult(null);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          monthlyConsumptionKwh: monthlyConsumption,
          systemSizeKw: systemSize,
          downPayment: form.downPayment.trim() ? downPayment : undefined,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Unable to calculate.");
      }

      setResult(payload as QuoteResult);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to calculate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 rounded-2xl border border-[#d8efed] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr_0.9fr] dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-[#0B9A96]">Quotes</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              Get a pre-qualification estimate
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Review the project details, estimate the system cost, and send the request for a pricing calculation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Full name"
                error={errors.fullName}
                input={
                  <input
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    className={inputClass(errors.fullName)}
                    placeholder="Alex Johnson"
                    autoComplete="name"
                  />
                }
              />

              <Field
                label="Email"
                error={errors.email}
                input={
                  <input
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className={inputClass(errors.email)}
                    placeholder="alex@example.com"
                    autoComplete="email"
                  />
                }
              />
            </div>

            <Field
              label="Address"
              error={errors.address}
              input={
                <input
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  className={inputClass(errors.address)}
                  placeholder="123 Main Street, Berlin"
                  autoComplete="street-address"
                />
              }
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Monthly consumption (kWh)"
                error={errors.monthlyConsumptionKwh}
                input={
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.monthlyConsumptionKwh}
                    onChange={(event) => updateField("monthlyConsumptionKwh", event.target.value)}
                    className={inputClass(errors.monthlyConsumptionKwh)}
                    placeholder="650"
                  />
                }
              />

              <Field
                label="System size (kW)"
                error={errors.systemSizeKw}
                input={
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.systemSizeKw}
                    onChange={(event) => updateField("systemSizeKw", event.target.value)}
                    className={inputClass(errors.systemSizeKw)}
                    placeholder="8.5"
                  />
                }
              />

              <Field
                label="Down payment"
                error={errors.downPayment}
                input={
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.downPayment}
                    onChange={(event) => updateField("downPayment", event.target.value)}
                    className={inputClass(errors.downPayment)}
                    placeholder="2500"
                  />
                }
              />
            </div>

            {submitError && (
              <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] px-4 py-2 text-sm font-medium text-white hover:from-[#0A897F] hover:to-[#0B9A96] disabled:opacity-60"
            >
              {loading ? "Calculating..." : "Get quote"}
            </button>
          </form>
        </div>

        <aside className="space-y-4 rounded-xl border border-[#d8efed] bg-[#f8fcfb] p-5 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Result</h2>
          {result ? (
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <div className="space-y-2">
                <ResultRow
                  label="System price"
                  value={`$${result.derivedValues.systemPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <ResultRow
                  label="Principal amount"
                  value={`$${result.derivedValues.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
                <ResultRow label="Risk band" value={result.derivedValues.riskBand} />
                <ResultRow label="Base APR" value={`${result.derivedValues.baseApr.toFixed(1)}%`} />
              </div>

              <div className="space-y-2">
                {result.offers.map((offer) => (
                  <div
                    key={offer.termYears}
                    className="rounded-lg border border-[#e2f4f2] bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-slate-900 dark:text-white">{offer.termYears} years</span>
                      <span className="text-slate-500 dark:text-slate-400">{offer.apr.toFixed(1)}% APR</span>
                    </div>
                    <div className="mt-2 grid gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <p>Principal used: ${offer.principalUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p>Monthly payment: ${offer.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Submit the form to calculate a quote.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  input,
}: {
  label: string;
  error?: string;
  input: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {input}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#e2f4f2] bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
      <span>{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function inputClass(error?: string) {
  return [
    "mt-1 w-full rounded-md border bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500",
    error ? "border-red-300 focus:ring-red-500" : "border-[#d8efed] dark:border-slate-700",
  ].join(" ");
}
