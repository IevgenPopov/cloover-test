import Header from "@/app/components/Header";
import { authOptions } from "@/app/lib/auth";
import { getQuotesForUser } from "@/app/lib/quote-store";
import type { UserRole } from "@/app/lib/definitions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function QuotesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as typeof session.user & { role: UserRole };
  const quotes = await getQuotesForUser(user.id, user.role === "admin");

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

          <a
            href="/quote"
            className="inline-flex items-center rounded-md bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] px-4 py-2 text-sm font-medium text-white hover:from-[#0A897F] hover:to-[#0B9A96]"
          >
            New quote
          </a>
        </div>

        {quotes.length === 0 ? (
          <div className="rounded-2xl border border-[#d8efed] bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No quotes have been saved yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {quotes.map((quote) => (
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
