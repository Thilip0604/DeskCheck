"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { Building2, CalendarDays, Check, Home, LogOut, Moon, Pencil, Sun, Timer, Umbrella } from "lucide-react";
import { logoutAction, punchInAction, punchOutAction, updateProfileAction } from "@/app/actions";
import { cn, desks, todayKey } from "@/lib/utils";

type WorkMode = "ONSITE" | "REMOTE" | "LEAVE";

type Active = { id: string; mode: WorkMode; desk: string | null; standupNote: string; punchInAt: string } | null;
type Occupied = { desk: string | null; user: { name: string } }[];
type History = { id: string; date: string; mode: string; desk: string | null; punchInAt: string; punchOutAt: string | null; status: string; standupNote: string }[];

export function EmployeeDashboard({ user, active, occupied, history }: { user: { name: string; role: string; phone: string }; active: Active; occupied: Occupied; history: History }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [punchState, punchForm] = useFormState(punchInAction, null);
  const [outState, outAction] = useFormState(punchOutAction, null);
  const [profileState, profileForm] = useFormState(updateProfileAction, null);
  const [date, setDate] = useState(todayKey());
  const [mode, setMode] = useState<WorkMode>("ONSITE");
  const [desk, setDesk] = useState("");
  const [now, setNow] = useState(Date.now());
  const [dark, setDark] = useState(false);
  const occupiedMap = useMemo(() => new Map(occupied.filter((o) => o.desk).map((o) => [o.desk!, o.user.name])), [occupied]);

  useEffect(() => {
    const saved = localStorage.getItem("deskcheck-theme");
    const next = saved ? saved === "dark" : document.documentElement.classList.contains("dark");
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (punchState?.ok) setOpen(false);
  }, [punchState]);

  const elapsed = active ? formatElapsed(now - new Date(active.punchInAt).getTime()) : "00h:00m:00s";
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("deskcheck-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 sm:p-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Employee Portal</p>
          <h1 className="text-3xl font-bold">Hi, {user.name}</h1>
          <p className="text-sm text-zinc-500">{user.role}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="rounded-lg border px-3 py-2 text-sm" aria-label="Toggle theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button onClick={() => setProfileOpen(true)} className="rounded-lg border px-3 py-2 text-sm"><Pencil className="inline h-4 w-4" /> Profile</button>
          <form action={logoutAction}><button className="rounded-lg border px-3 py-2 text-sm"><LogOut className="inline h-4 w-4" /> Sign out</button></form>
        </div>
      </header>
      <section className="mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-[1fr_.8fr]">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Current shift</p>
              <h2 className="mt-1 text-4xl font-bold">{elapsed} active</h2>
            </div>
            <span className={cn("h-4 w-4 rounded-full", active ? "animate-pulse bg-emerald-400" : "bg-zinc-300")} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Info icon={CalendarDays} label="Date" value={todayKey()} />
            <Info icon={active?.mode === "REMOTE" ? Home : Building2} label="Mode" value={active?.mode ?? "Not checked in"} />
            <Info icon={Timer} label="Desk" value={active?.desk ?? "None"} />
          </div>
          <div className="mt-6 flex gap-3">
            {!active ? <button onClick={() => setOpen(true)} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white shadow-glow">Punch In</button> : <form action={outAction}><SubmitButton className="rounded-lg bg-rose-500 px-5 py-3 font-semibold text-white" label="Punch Out" /></form>}
          </div>
          {punchState?.ok && <p className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">{punchState.ok}</p>}
          {punchState?.error && <p className="mt-4 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500">{punchState.error}</p>}
          {outState?.ok && <p className="mt-4 text-sm text-emerald-500">Shift saved successfully.</p>}
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold">Today’s desk map</h2>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {desks.map((d) => (
              <div key={d} title={occupiedMap.get(d) ?? "Available"} className={cn("rounded-lg border p-3 text-center text-sm", occupiedMap.has(d) ? "border-zinc-300 bg-zinc-200 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900" : "border-emerald-400/30 bg-emerald-400/10")}>
                <span className={cn("mx-auto mb-2 block h-2 w-2 rounded-full", occupiedMap.has(d) ? "bg-zinc-500" : "bg-emerald-400")} />{d}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto mt-5 max-w-6xl">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold">Attendance history</h2>
          <div className="mt-4 space-y-3">
            {history.length === 0 && <p className="text-sm text-zinc-500">No shifts recorded yet.</p>}
            {history.map((item) => (
              <div key={item.id} className="grid gap-2 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800 sm:grid-cols-6">
                <span className="font-semibold">{item.date}</span>
                <span>{item.mode}</span>
                <span>{item.desk ?? "No desk"}</span>
                <span>{new Date(item.punchInAt).toLocaleTimeString()}</span>
                <span>{item.punchOutAt ? new Date(item.punchOutAt).toLocaleTimeString() : item.status}</span>
                <span>{item.punchOutAt ? formatElapsed(new Date(item.punchOutAt).getTime() - new Date(item.punchInAt).getTime()) : "-"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {open && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-zinc-950/70 p-4">
          <motion.form action={punchForm} className="glass max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold">Smart punch-in</h2>
            <input type="hidden" name="mode" value={mode} />
            <input type="hidden" name="desk" value={desk} />
            <label className="mt-5 block text-sm font-medium">Attendance date</label>
            <input className="field mt-2" type="date" name="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ModeCard active={mode === "ONSITE"} icon={Building2} title="Onsite" subtitle="Book a physical desk" onClick={() => setMode("ONSITE")} />
              <ModeCard active={mode === "REMOTE"} icon={Home} title="Remote" subtitle="Work from home" onClick={() => setMode("REMOTE")} />
              <ModeCard active={mode === "LEAVE"} icon={Umbrella} title="Leave" subtitle="Mark approved time away" onClick={() => setMode("LEAVE")} />
            </div>
            {mode === "ONSITE" && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {["A", "B"].map((row) => (
                  <div key={row} className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                    <p className="mb-3 text-sm font-semibold">Row {row}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {desks.filter((d) => d.startsWith(row)).map((d) => {
                        const taken = occupiedMap.get(d);
                        return <button type="button" disabled={!!taken} title={taken ? `Occupied by ${taken}` : "Available"} onClick={() => setDesk(d)} key={d} className={cn("rounded-lg border p-3 text-sm transition", taken ? "cursor-not-allowed border-zinc-300 bg-zinc-200 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900" : desk === d ? "border-primary bg-primary/15 shadow-glow" : "border-emerald-400/30 bg-emerald-400/10")}>{d}</button>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <textarea className="field mt-5 min-h-24" name="standupNote" placeholder="What is your main focus today?" required />
            {punchState?.error && <p className="mt-3 text-sm text-rose-500">{punchState.error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2">Cancel</button>
              <SubmitButton className="rounded-lg bg-primary px-4 py-2 font-semibold text-white" label="Confirm" icon />
            </div>
          </motion.form>
        </div>
      )}
      {profileOpen && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-zinc-950/70 p-4">
          <motion.form action={profileForm} className="glass w-full max-w-md rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold">Profile</h2>
            <input className="field mt-5" name="name" defaultValue={user.name} required />
            <input className="field mt-3" name="phone" defaultValue={user.phone} required />
            {profileState?.error && <p className="mt-3 text-sm text-rose-500">{profileState.error}</p>}
            {profileState?.ok && <p className="mt-3 text-sm text-emerald-500">{profileState.ok}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded-lg border px-4 py-2">Close</button>
              <SubmitButton className="rounded-lg bg-primary px-4 py-2 font-semibold text-white" label="Save" />
            </div>
          </motion.form>
        </div>
      )}
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><Icon className="h-5 w-5 text-primary" /><p className="mt-2 text-xs text-zinc-500">{label}</p><p className="font-semibold">{value}</p></div>;
}

function ModeCard({ active, icon: Icon, title, subtitle, onClick }: { active: boolean; icon: any; title: string; subtitle: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("rounded-xl border p-4 text-left transition", active ? "border-primary bg-primary/10" : "border-zinc-200 dark:border-zinc-800")}><Icon className="h-6 w-6 text-primary" /><div className="mt-3 font-bold">{title}</div><div className="text-sm text-zinc-500">{subtitle}</div></button>;
}

function SubmitButton({ label, className, icon = false }: { label: string; className: string; icon?: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className={cn(className, "disabled:cursor-wait disabled:opacity-70")}>{icon && <Check className="inline h-4 w-4" />} {pending ? "Please wait..." : label}</button>;
}

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600).toString().padStart(2, "0");
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${h}h:${m}m:${s}s`;
}
