export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>

      <form className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
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
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-carolina-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-carolina-700"
        >
          Log In
        </button>

        <div className="text-center">
          <a href="#" className="text-sm font-medium text-carolina-600 hover:text-carolina-700">
            Forgot password?
          </a>
        </div>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        className="w-full rounded-lg border border-carolina-600 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white"
      >
        <span className="flex items-center justify-center gap-2 text-carolina-600 font-semibold ">
          Create New Account
        </span>
      </button>

      <p className="mt-6 text-center text-xs text-slate-400">
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
}
