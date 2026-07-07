import Header from "@/app/components/Header";
import { authOptions } from "@/app/lib/auth";
import { getQuotesForUser } from "@/app/lib/quote-store";
import type { UserRole } from "@/app/lib/definitions";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

type QuotesSearchParams = {
  user?: string;
  email?: string;
};

type QuotesPageProps = {
  searchParams?: Promise<QuotesSearchParams>;
};

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as typeof session.user & { role: UserRole };
  const resolvedSearchParams = (await searchParams) ?? {};
  const userFilter = normalizedFilter(resolvedSearchParams.user);
  const emailFilter = normalizedFilter(resolvedSearchParams.email);
  const isAdmin = user.role === "admin";
  const quotes = await getQuotesForUser(user.id, isAdmin);
  const queryString = buildQueryString(resolvedSearchParams);

  const filteredQuotes = isAdmin
    ? quotes.filter((quote) => {
        const matchesUser = !userFilter || quote.userName.toLowerCase().includes(userFilter);
        const matchesEmail = !emailFilter || quote.userEmail.toLowerCase().includes(emailFilter);
        return matchesUser && matchesEmail;
      })
    : quotes;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#0B9A96]">Quotes</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
              {user.role === "admin" ? "All quotes" : "My quotes"}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {user.role === "admin"
                ? "Admin users can review quotes submitted by every account."
                : "These are the quotes submitted by your account."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <Link
                href="/quotes"
                className="inline-flex items-center rounded-md border border-[#c7ece8] px-4 py-2 text-sm font-medium text-[#0B9A96] hover:bg-[#f1fbfa] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Clear filters
              </Link>
            ) : null}
            <a
              href="/quote"
              className="inline-flex items-center rounded-md bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] px-4 py-2 text-sm font-medium text-white hover:from-[#0A897F] hover:to-[#0B9A96]"
            >
              New quote
            </a>
          </div>
        </div>

        {isAdmin ? (
          <form method="get" className="mb-6 grid gap-3 rounded-2xl border border-[#d8efed] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">User</span>
              <input
                name="user"
                defaultValue={resolvedSearchParams.user ?? ""}
                placeholder="Filter by user name"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-[#0B9A96] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Email</span>
              <input
                name="email"
                defaultValue={resolvedSearchParams.email ?? ""}
                placeholder="Filter by email"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-[#0B9A96] dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] px-4 py-2 text-sm font-medium text-white hover:from-[#0A897F] hover:to-[#0B9A96]"
              >
                Apply
              </button>
            </div>
          </form>
        ) : null}

        {filteredQuotes.length === 0 ? (
          <div className="rounded-2xl border border-[#d8efed] bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            {quotes.length === 0
              ? "No quotes have been saved yet."
              : "No quotes match the current filters."}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuotes.map((quote) => (
              <article
                key={quote.id}
                className="rounded-2xl border border-[#d8efed] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {quote.userName}
                      </h2>
                      <span className="rounded-full bg-[#e8faf8] px-2 py-1 text-xs font-medium text-[#0B9A96] dark:bg-slate-800 dark:text-slate-300">
                        Band {quote.band}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{quote.userEmail}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                    <p>{new Date(quote.date).toLocaleDateString()}</p>
                    <p>{new Date(quote.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href={queryString ? `/quotes/${quote.id}?${queryString}` : `/quotes/${quote.id}`}
                    className="inline-flex items-center rounded-md border border-[#c7ece8] px-3 py-2 text-sm font-medium text-[#0B9A96] hover:bg-[#f1fbfa] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    View quote
                  </Link>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Info label="System size" value={`${quote.systemSize} kW`} />
                  <Info label="Price" value={`$${quote.price.toLocaleString()}`} />
                  <Info
                    label="Down payment"
                    value={quote.downPayment !== null ? `$${quote.downPayment.toLocaleString()}` : "N/A"}
                  />
                  <Info label="Description" value={quote.description} />
                </div>
              </article>
            ))}
          </div>
        )}
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

function normalizedFilter(value?: string) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : "";
}

function buildQueryString(params: QuotesSearchParams) {
  const query = new URLSearchParams();

  if (params.user?.trim()) {
    query.set("user", params.user.trim());
  }

  if (params.email?.trim()) {
    query.set("email", params.email.trim());
  }

  return query.toString();
}
