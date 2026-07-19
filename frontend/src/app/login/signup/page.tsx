export default function SignupPage() {
    return (
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <form className="mt-8 space-y-4">
        <div>
          <label htmlFor="fullname" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="fullname"
            name="fullname"
            type="text"
            placeholder="Your full name"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-carolina-600 focus:outline-none focus:ring-2 focus:ring-carolina-100"
          />
        </div>
        <div>
          <label htmlFor="businessemail" className="mb-1.5 block text-sm font-medium text-slate-700">
            Business Email
          </label>
          <input
            id="businessemail"
            name="businessemail"
            type="email"
            placeholder="you@company.com"
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
          Create Account
        </button>

        <div className="text-center">
          <p className="text-sm font-medium text-black ">
            Already have an account?{" "}
            <a href="/login" className="text-sm font-medium text-carolina-600 hover:text-carolina-700">
              Log In
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}