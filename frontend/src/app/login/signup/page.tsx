"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signup } from "../../../lib/auth/api";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setMessage(null);
        setIsSubmitting(true);

        try {
            const response = await signup({
                email,
                password,
                business_name: companyName,
            });
            setMessage(response.message);
            setTimeout(() => router.push("/login"), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to create account. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {error ? (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-600">{message}</p>
        ) : null}

        <div>
          <label htmlFor="businessemail" className="mb-1.5 block text-sm font-medium text-slate-700">
            Business Email
          </label>
          <input
            id="businessemail"
            name="businessemail"
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100"
          />
        </div>
        <div>
          <label htmlFor="companyname" className="mb-1.5 block text-sm font-medium text-slate-700">
            Company Name
          </label>
          <input
            id="companyname"
            name="companyname"
            type="text"
            placeholder="Your company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
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
            minLength={8}
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
          {isSubmitting ? "Creating account…" : "Create Account"}
        </button>

        <div className="text-center">
          <p className="text-sm font-medium text-black ">
            Already have an account?{" "}
            <Link href="/login" className="text-sm font-medium text-carolina-600 hover:text-carolina-700">
              Log In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}