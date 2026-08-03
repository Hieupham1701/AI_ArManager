"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "../../lib/auth/api";
import { saveSession } from "../../lib/auth/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      saveSession({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        user: response.user,
      });
      router.push("/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-carolina-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-carolina-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in…" : "Log In"}
        </button>

        <div className="text-center">
          <Link
            href="/login/forgotpassword"
            className="text-sm font-medium text-carolina-600 hover:text-carolina-700"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Link
        href="/login/signup"
        className="block w-full rounded-lg border border-carolina-600 px-4 py-2.5 text-center text-sm font-semibold text-carolina-600 transition hover:bg-carolina-50"
      >
        Create New Account
      </Link>

      <p className="mt-6 text-center text-xs text-slate-400">
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
}

