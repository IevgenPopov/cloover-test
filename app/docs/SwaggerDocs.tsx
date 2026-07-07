"use client";

import type { ReactNode } from "react";

type OpenApiSpec = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string }>;
  paths: Record<
    string,
    Record<
      string,
      {
        summary?: string;
        operationId?: string;
        description?: string;
        requestBody?: {
          required?: boolean;
          content?: Record<
            string,
            {
              schema?: {
                type?: string;
                required?: string[];
                properties?: Record<
                  string,
                  {
                    type?: string;
                    format?: string;
                    minimum?: number;
                  }
                >;
              };
            }
          >;
        };
        parameters?: Array<{
          name: string;
          in: string;
          required?: boolean;
          schema?: { type?: string };
        }>;
        responses?: Record<string, { description?: string }>;
      }
    >
  >;
};

const methodStyles: Record<string, string> = {
  get: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
  post: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900",
  put: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  patch: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900",
  delete: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900",
};

export default function SwaggerDocs({ spec }: { spec: OpenApiSpec }) {
  const entries = Object.entries(spec.paths).flatMap(([path, methods]) =>
    Object.entries(methods).map(([method, operation]) => ({
      path,
      method,
      operation,
    })),
  );

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Version" value={spec.openapi} />
        <Stat label="Servers" value={spec.servers?.length ? spec.servers.map((server) => server.url).join(", ") : "N/A"} />
        <Stat label="Operations" value={String(entries.length)} />
      </section>

      <section className="rounded-2xl border border-[#e2f4f2] bg-[#f8fcfb] p-5 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-sm font-medium text-[#0B9A96]">Specification</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{spec.info.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          {spec.info.description ?? "OpenAPI reference for the app."}
        </p>
      </section>

      <section className="grid gap-4">
        {entries.map(({ path, method, operation }) => (
          <article key={`${method}-${path}`} className="rounded-2xl border border-[#d8efed] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${methodStyles[method.toLowerCase()] ?? "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"}`}>
                    {method.toUpperCase()}
                  </span>
                  <code className="text-sm font-medium text-slate-700 dark:text-slate-200">{path}</code>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{operation.summary ?? operation.operationId ?? path}</h3>
                {operation.description ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{operation.description}</p>
                ) : null}
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                {operation.operationId ? <p>Operation ID: {operation.operationId}</p> : null}
                {operation.requestBody?.required ? <p>Request body required</p> : null}
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <Panel title="Parameters">
                {operation.parameters?.length ? (
                  <ul className="space-y-2">
                    {operation.parameters.map((parameter) => (
                      <li key={`${parameter.in}-${parameter.name}`} className="flex items-center justify-between gap-3 rounded-lg border border-[#e2f4f2] bg-[#f8fcfb] px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
                        <span className="font-medium text-slate-900 dark:text-white">{parameter.name}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {parameter.in}
                          {parameter.required ? " · required" : ""}
                          {parameter.schema?.type ? ` · ${parameter.schema.type}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState>None</EmptyState>
                )}
              </Panel>

              <Panel title="Request body">
                {renderRequestBody(operation.requestBody) ?? <EmptyState>None</EmptyState>}
              </Panel>

              <Panel title="Responses">
                {operation.responses ? (
                  <ul className="space-y-2">
                    {Object.entries(operation.responses).map(([status, response]) => (
                      <li key={status} className="flex items-center justify-between gap-3 rounded-lg border border-[#e2f4f2] bg-[#f8fcfb] px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
                        <span className="font-medium text-slate-900 dark:text-white">{status}</span>
                        <span className="text-slate-500 dark:text-slate-400">{response.description ?? "No description"}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState>None</EmptyState>
                )}
              </Panel>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d8efed] bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e2f4f2] bg-[#f8fcfb] p-4 dark:border-slate-800 dark:bg-slate-950">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-500 dark:text-slate-400">{children}</p>;
}

function renderRequestBody(requestBody: OpenApiSpec["paths"][string][string]["requestBody"]) {
  const schema = requestBody?.content?.["application/json"]?.schema;

  if (!schema?.properties) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {requestBody.required ? "Required" : "Optional"}
      </p>
      <ul className="space-y-2">
        {Object.entries(schema.properties).map(([name, property]) => (
          <li
            key={name}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#e2f4f2] bg-[#f8fcfb] px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <span className="font-medium text-slate-900 dark:text-white">{name}</span>
            <span className="text-slate-500 dark:text-slate-400">
              {property.type ?? "unknown"}
              {property.format ? ` · ${property.format}` : ""}
              {typeof property.minimum === "number" ? ` · min ${property.minimum}` : ""}
              {schema.required?.includes(name) ? " · required" : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
