import Header from "@/app/components/Header";
import { authOptions } from "@/app/lib/auth";
import { getQuoteById } from "@/app/lib/quote-store";
import type { UserRole } from "@/app/lib/definitions";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    user?: string;
    email?: string;
  }>;
};

export default async function QuoteDetailPage({ params, searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as typeof session.user & { role: UserRole };
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const queryString = buildQueryString(resolvedSearchParams);
  const quote = await getQuoteById(id);

  if (!quote) {
    notFound();
  }

  if (user.role !== "admin" && quote.userId !== user.id) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#0B9A96]">Quote</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              {quote.user.name}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{quote.user.email}</p>
          </div>

          <Link
            href={queryString ? `/quotes?${queryString}` : "/quotes"}
            className="inline-flex items-center rounded-md border border-[#c7ece8] px-4 py-2 text-sm font-medium text-[#0B9A96] hover:bg-[#f1fbfa] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back to quotes
          </Link>
        </div>

        <section className="rounded-2xl border border-[#d8efed] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#e8faf8] px-2 py-1 text-xs font-medium text-[#0B9A96] dark:bg-slate-800 dark:text-slate-300">
                  Band {quote.band}
                </span>
                <span className="rounded-full bg-[#f1fbfa] px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {new Date(quote.date).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{quote.description}</p>
            </div>
            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
              <p>{new Date(quote.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="System size" value={`${quote.systemSize} kW`} />
            <Info label="Price" value={`$${quote.price.toLocaleString()}`} />
            <Info
              label="Down payment"
              value={quote.downPayment !== null ? `$${quote.downPayment.toLocaleString()}` : "N/A"}
            />
            <Info label="Owner" value={quote.user.name} />
          </div>
        </section>
      </main>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e2f4f2] bg-[#f8fcfb] px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function buildQueryString(params: { user?: string; email?: string }) {
  const query = new URLSearchParams();

  if (params.user?.trim()) {
    query.set("user", params.user.trim());
  }

  if (params.email?.trim()) {
    query.set("email", params.email.trim());
  }

  return query.toString();
}
