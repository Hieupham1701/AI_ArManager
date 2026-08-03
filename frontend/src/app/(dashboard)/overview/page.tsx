import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Clock,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Prioritizes overdue invoices",
    description:
      "The AI agent continuously ranks outstanding invoices so the accounts most at risk get attention first.",
  },
  {
    icon: Clock,
    title: "Smart follow-up timing",
    description:
      "It determines the best moment to reach out to each client, avoiding both under- and over-communication.",
  },
  {
    icon: MessageCircle,
    title: "Personalized communication",
    description:
      "Every message is tailored to the client, using the tone and channel most likely to get a response.",
  },
  {
    icon: ShieldCheck,
    title: "Healthier cash flow",
    description:
      "By automating collections end-to-end, the platform improves cash flow while cutting down manual effort.",
  },
];

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Hero / introduction */}
      <section
        className="overflow-hidden rounded-2xl border border-slate-200 p-8 sm:p-12"
        style={{
          background: "linear-gradient(120deg, #1a2332 0%, #2f6d9c 55%, #4b9cd3 100%)",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Bot className="h-7 w-7 text-white" />
          </span>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Welcome to AI AR Manager</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">
            An AI-powered accounts receivable platform for SMBs that autonomously manages invoice
            collections. Your AI agent prioritizes overdue invoices, determines the best follow-up
            timing and communication strategy, and personalizes client interactions to improve
            cash flow while reducing manual collection efforts.
          </p>
          <Link
            href="/strategy"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* What the platform does */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900">How your AI agent helps</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: "rgba(75, 156, 211, 0.1)" }}
              >
                <feature.icon className="h-4.5 w-4.5 text-carolina-600" />
              </span>
              <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-xs leading-relaxed text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
