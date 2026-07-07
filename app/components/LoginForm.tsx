"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type User = { id: string; name: string; email: string } | null;
type AuthMode = "login" | "signup";

export default function LoginForm({
  onSuccessAction,
  mode = "login",
}: {
  onSuccessAction?: (user: User) => void;
  mode?: AuthMode;
}) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);

    if (isSignup) {
      if (!name || !email || !password || !confirmPassword) {
        setError("Please complete all signup fields.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (!acceptedTerms) {
        setError("Please accept the terms to continue.");
        return;
      }
    } else if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(payload?.message || "Signup failed");
        }

        onSuccessAction?.(payload?.user ?? null);

        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/quotes",
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push(result?.url ?? "/quotes");
      } else {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl: "/quotes",
        });

        if (result?.error) {
          throw new Error("Invalid credentials");
        }

        router.push(result?.url ?? "/quotes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isSignup ? "Signup failed" : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[#d8efed] bg-(--surface) shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.1fr_0.9fr] dark:border-slate-800 dark:bg-slate-900">
        <div className="hidden flex-col justify-between border-r border-[#e6f7f6] bg-linear-to-br from-[#f2fbfa] to-white p-8 lg:flex dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] text-lg font-bold text-white shadow-sm">
              C
            </div>
            <div>
              <p className="text-sm font-medium text-[#0B9A96]">Cloover</p>
              <p className="text-xs text-[#64748b] dark:text-slate-400">Quote workspace</p>
            </div>
          </div>

          <div className="max-w-sm">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground dark:text-white">
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#64748b] dark:text-slate-400">
              {isSignup
                ? "Set up a workspace, add your details, and start tracking quote estimates."
                : "Sign in to access your saved quote estimates and workspace settings."}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-[#334155] dark:text-slate-300">
            <div className="rounded-xl border border-[#dbeceb] bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              Quick setup for small teams and solo workflows.
            </div>
            <div className="rounded-xl border border-[#dbeceb] bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
              Clean inputs, clear actions, and a simple path to sign in or register.
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 md:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] text-white font-bold shadow-sm">
                C
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-foreground dark:text-white">
                {isSignup ? "Sign up" : "Sign in"}
              </h2>
              <p className="mt-1 text-sm text-[#64748b] dark:text-gray-400">
                {isSignup ? "Create your account to get started" : "Enter your credentials to continue"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {isSignup && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground dark:text-gray-300">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Alex Johnson"
                    className="mt-1 w-full rounded-md border border-[#e6f7f6] bg-(--surface) px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md border border-[#e6f7f6] bg-(--surface) px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              <div className={isSignup ? "grid gap-4 sm:grid-cols-2" : ""}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={isSignup ? "new-password" : "current-password"}
                      placeholder="••••••••"
                      className="w-full rounded-md border border-[#e6f7f6] bg-(--surface) px-3 py-2 pr-20 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {isSignup && (
                  <div className="mt-4 sm:mt-0">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground dark:text-gray-300">
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="mt-1 w-full rounded-md border border-[#e6f7f6] bg-(--surface) px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0EA5A4] dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                )}
              </div>

              {isSignup ? (
                <label className="flex items-start gap-3 text-sm text-[#334155] dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                  />
                  <span>
                    I agree to the terms and confirm that my account details are accurate.
                  </span>
                </label>
              ) : (
                <div className="flex items-center justify-between text-sm">
                  <a href="/forgot" className="text-[#0EA5A4] hover:underline">
                    Forgot password?
                  </a>
                  <a href="/register" className="text-[#334155] hover:underline dark:text-slate-300">
                    Sign up
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] px-4 py-2 font-medium text-white hover:from-[#098778] hover:to-[#0B9A96] disabled:opacity-60"
              >
                {loading ? (isSignup ? "Creating account…" : "Signing in…") : isSignup ? "Create account" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-400">
              {isSignup ? "Demo signup layout — connect it to your auth API when ready." : "Demo auth — do not use production credentials here."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
