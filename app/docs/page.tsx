import Header from "@/app/components/Header";
import SwaggerDocs from "@/app/docs/SwaggerDocs";
import { openApiSpec } from "@/app/lib/openapi";

export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#0B9A96]">API Docs</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">OpenAPI reference</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Interactive documentation generated from the local OpenAPI spec.
          </p>
        </div>

        <section className="rounded-2xl border border-[#d8efed] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <SwaggerDocs spec={openApiSpec as Record<string, unknown>} />
        </section>
      </main>
    </>
  );
}
