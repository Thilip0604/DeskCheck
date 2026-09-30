"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { BriefcaseBusiness, Building2, CalendarCheck, Code2, Eye, EyeOff, KeyRound, Laptop, LockKeyhole, Shield, UserRound, UsersRound } from "lucide-react";
import { loginAction, registerAction, resetPasswordAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const roles = [
  { name: "Software Engineer", admin: false, icon: Code2 },
  { name: "Software Developer", admin: false, icon: Laptop },
  { name: "Technology Intern", admin: false, icon: UserRound },
  { name: "HR Specialist", admin: true, icon: Shield },
  { name: "Engineering Manager", admin: true, icon: BriefcaseBusiness }
];

export function AuthClient({ mode }: { mode: "login" | "register" }) {
  const [loginState, loginForm] = useFormState(loginAction, null);
  const [registerState, registerForm] = useFormState(registerAction, null);
  const [resetState, resetForm] = useFormState(resetPasswordAction, null);
  const [selectedRole, setSelectedRole] = useState(roles[0].name);
  const [resetOpen, setResetOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const isRegister = mode === "register";
  const strength = password.length >= 12 ? "Strong" : password.length >= 8 ? "Good" : password.length > 0 ? "Weak" : "";

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-white"><Building2 className="h-5 w-5" /></span>
          DeskCheck
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href={isRegister ? "/login" : "/register"} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold dark:border-zinc-700">{isRegister ? "Sign in" : "Create account"}</Link>
        </div>
      </nav>
      <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:pt-12">
        <section className="order-2 lg:order-1">
          <ProductPanel />
        </section>
        <section className="order-1 flex justify-center lg:order-2">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="mb-7">
            <p className="text-sm font-semibold text-primary">{isRegister ? "Start with DeskCheck" : "Secure sign in"}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">{isRegister ? "Create your workspace profile" : "Welcome back"}</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{isRegister ? "Choose the role that matches your work track. Leadership roles open admin access." : "Use your registered account to enter the employee or admin workspace."}</p>
          </div>
          <form action={isRegister ? registerForm : loginForm} className="space-y-4">
            {isRegister && <input className="field" name="name" placeholder="Full name" required />}
            <input className="field" name="email" type="email" placeholder="Work email" required />
            {isRegister && <input className="field" name="phone" placeholder="Phone number" required />}
            <div>
              <div className="relative">
                <input className="field pr-11" name="password" type={showPassword ? "text" : "password"} placeholder="Password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-zinc-500">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isRegister && strength && <p className={cn("mt-1 text-xs", strength === "Weak" ? "text-rose-500" : strength === "Good" ? "text-[#539e0b]" : "text-emerald-500")}>Password strength: {strength}</p>}
            </div>
            {isRegister && (
              <div>
                <p className="mb-2 text-xs text-zinc-500">Employee roles open the employee portal. HR Specialist and Engineering Manager open admin access.</p>
                <input type="hidden" name="role" value={selectedRole} />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button type="button" key={role.name} onClick={() => setSelectedRole(role.name)} className={cn("rounded-xl border p-3 text-left transition", selectedRole === role.name ? "border-primary bg-primary/10" : "border-zinc-200 hover:border-primary/50 dark:border-zinc-800")}>
                        <Icon className="mb-2 h-5 w-5 text-primary" />
                        <div className="text-sm font-semibold">{role.name}</div>
                        <div className="text-xs text-zinc-500">{role.admin ? "Leadership admin" : "Employee portal"}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {(loginState?.error || registerState?.error) && <p className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500">{loginState?.error || registerState?.error}</p>}
            <SubmitButton label={isRegister ? "Create account" : "Sign in"} />
          </form>
          <div className="mt-5 flex items-center justify-between text-sm">
            <a className="text-primary" href={isRegister ? "/login" : "/register"}>{isRegister ? "Already registered?" : "Create an account"}</a>
            <button className="inline-flex items-center gap-1 text-zinc-500" onClick={() => setResetOpen(true)}><KeyRound className="h-4 w-4" /> Forgot password</button>
          </div>
        </div>
        </section>
      </div>
      <AnimatePresence>
        {resetOpen && (
          <motion.div className="fixed inset-0 z-20 grid place-items-center bg-zinc-950/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form action={resetForm} className="glass w-full max-w-md rounded-2xl p-6" initial={{ scale: .95 }} animate={{ scale: 1 }}>
              <h2 className="text-xl font-bold">Reset password</h2>
              <p className="mt-1 text-sm text-zinc-500">Mock recovery: enter your security email and a new password.</p>
              <input className="field mt-5" name="email" type="email" placeholder="Work email" required />
              <input className="field mt-3" name="password" type="password" placeholder="New password" required minLength={8} />
              {resetState?.error && <p className="mt-3 text-sm text-rose-500">{resetState.error}</p>}
              {resetState?.ok && <p className="mt-3 text-sm text-emerald-500">{resetState.ok}</p>}
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setResetOpen(false)} className="rounded-lg border px-4 py-2">Close</button>
                <button className="rounded-lg bg-primary px-4 py-2 text-white">Reset</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function ProductPanel() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[2rem] bg-primary/10 blur-3xl" />
      <div className="relative max-w-2xl">
        <p className="text-sm font-semibold text-primary">Enterprise-ready hybrid operations</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">One login. The right portal. A cleaner workday.</h2>
        <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">DeskCheck keeps attendance, desk booking, leave visibility, and admin recovery in one secure workspace.</p>
        <div className="mt-8 grid gap-3">
          {[
            { icon: LockKeyhole, title: "Local secure authentication", text: "Users enter with email and password; roles route them automatically." },
            { icon: Building2, title: "Visual desk booking", text: "Onsite employees reserve desks with backend conflict checks." },
            { icon: CalendarCheck, title: "Attendance history", text: "Punch-in, punch-out, remote, onsite, and leave records stay traceable." },
            { icon: UsersRound, title: "Admin control center", text: "HR and managers can monitor status, recover missed punch-outs, and export CSV." }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-3 rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70">{pending ? "Please wait..." : label}</button>;
}
