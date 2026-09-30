import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Clock3, DatabaseZap, ShieldCheck, UsersRound } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fafafa_0%,#f4f4f5_48%,#ffffff_100%)] text-zinc-950 dark:bg-[linear-gradient(180deg,#09090b_0%,#18181b_55%,#09090b_100%)] dark:text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white"><Building2 className="h-5 w-5" /></span>
          DeskCheck
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900">Sign in</a>
          <a href="/register" className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white shadow-lg dark:bg-white dark:text-zinc-950">Get started</a>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-12 lg:grid-cols-[1fr_.85fr] lg:items-center lg:pb-28">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            Hybrid workforce operations for modern teams
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Attendance, desk booking, and team visibility in one refined system.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            DeskCheck gives employees a clear daily check-in flow and gives HR, admins, and managers a reliable control center for hybrid work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/register" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white shadow-glow">Create account <ArrowRight className="h-4 w-4" /></a>
            <a href="/login" className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold dark:border-zinc-700">Sign in</a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
            <Proof value="16" label="Managed desks" />
            <Proof value="3" label="Work modes" />
            <Proof value="CSV" label="HR reports" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
          <div className="relative rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm font-semibold text-primary">Built for daily office operations</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">A simple flow your team can understand on day one.</h2>
            <div className="mt-8 space-y-6">
              {[
                ["01", "Sign in securely", "Every user enters with their registered email and password."],
                ["02", "Mark the workday", "Employees choose onsite, remote, or leave and add a daily focus note."],
                ["03", "Book only free desks", "Onsite desk selection is checked before the shift is confirmed."],
                ["04", "Keep records clean", "Admins can fix forgotten punch-outs and export attendance reports."]
              ].map(([step, title, text]) => (
                <div key={step} className="flex gap-4">
                  <span className="mt-1 text-sm font-black text-primary">{step}</span>
                  <div className="border-b border-zinc-200 pb-5 last:border-0 dark:border-zinc-800">
                    <h3 className="font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="border-y border-zinc-200 bg-white/70 px-5 py-14 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          <Feature icon={Clock3} title="Punch in with context" text="Mode, date, desk, and daily focus are captured in one guided flow." />
          <Feature icon={ShieldCheck} title="Conflict prevention" text="Desk bookings are checked on the server and guarded in the database." />
          <Feature icon={UsersRound} title="Multi-admin ready" text="Leadership sees a shared operating view with override controls." />
          <Feature icon={DatabaseZap} title="Audit-friendly records" text="Attendance history, exports, and stale-shift recovery stay traceable." />
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-primary">Built for modern teams</p>
            <h2 className="mt-2 text-3xl font-black">A practical operating system for flexible work.</h2>
          </div>
          <div className="grid gap-3 lg:col-span-2">
            {["Employees know exactly where to check in, what desk is available, and how their day is recorded.", "Admins can recover forgotten punch-outs, edit work status, export reports, and spot capacity pressure.", "The system is intentionally local-auth friendly, so it works without external identity providers during pilot deployments."].map((item) => (
              <div key={item} className="flex gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"><CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" /><p className="text-zinc-600 dark:text-zinc-300">{item}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-zinc-200 px-5 py-16 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-primary">Who DeskCheck is for</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["HR teams", "Track attendance cleanly, handle leave visibility, and export records."],
              ["Office admins", "Understand onsite usage and reduce desk-booking confusion."],
              ["Team managers", "Know who is onsite, remote, unavailable, or missing punch-out."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="border-t border-zinc-200 px-5 py-8 text-sm text-zinc-500 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row">
          <span>DeskCheck · Hybrid attendance and desk booking</span>
          <span>Local secure auth · Admin reports · Employee attendance</span>
        </div>
      </footer>
    </main>
  );
}

function Proof({ value, label }: { value: string; label: string }) {
  return <div><p className="text-2xl font-black">{value}</p><p className="text-zinc-500">{label}</p></div>;
}

function Feature({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"><Icon className="h-6 w-6 text-primary" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p></div>;
}
