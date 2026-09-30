"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Download, Home, LogOut, Moon, Search, Sun, Umbrella, Users } from "lucide-react";
import { decideLeaveAction, editStatusAction, exportCsvAction, forcePunchOutAction, logoutAction } from "@/app/actions";
import { cn, desks } from "@/lib/utils";

type WorkMode = "ONSITE" | "REMOTE" | "LEAVE";

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarHue: number;
  mode: WorkMode | "NONE";
  punchInAt: string | null;
  punchOutAt: string | null;
  desk: string | null;
  note: string;
  status: string;
};

export function AdminDashboard({ rows, totals }: { rows: Row[]; totals: { registered: number; onsite: number; remote: number; leave: number } }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [range, setRange] = useState("TODAY");
  const [selected, setSelected] = useState<Row | null>(null);
  const [dark, setDark] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const filtered = useMemo(() => rows.filter((r) => (filter === "ALL" || r.mode === filter) && r.name.toLowerCase().includes(query.toLowerCase())), [rows, filter, query]);
  const stale = rows.filter((r) => r.punchInAt && !r.punchOutAt && Date.now() - new Date(r.punchInAt).getTime() > 1000 * 60 * 60 * 10);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("deskcheck-theme");
    const next = saved ? saved === "dark" : document.documentElement.classList.contains("dark");
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("deskcheck-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  function downloadCsv() {
    startTransition(async () => {
      const csv = await exportCsvAction();
      const blob = new Blob([csv], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "deskcheck-attendance.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950 sm:p-8">
      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Admin Control Center</p>
          <h1 className="text-3xl font-bold">Synced team operations</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleTheme} className="rounded-lg border px-3 py-2 text-sm" aria-label="Toggle theme">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <form action={logoutAction}><button className="rounded-lg border px-3 py-2 text-sm"><LogOut className="inline h-4 w-4" /> Sign out</button></form>
        </div>
      </header>
      {stale.length > 0 && <div className="mx-auto mt-5 max-w-7xl rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm font-semibold text-[#539e0b]">{stale.length} shift{stale.length > 1 ? "s" : ""} open for more than 10 hours. Review or force punch-out if needed.</div>}
      <section className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-4">
        <Metric icon={Users} label="Registered" value={totals.registered} />
        <Metric icon={Building2} label="Onsite" value={totals.onsite} tone="emerald" />
        <Metric icon={Home} label="Remote" value={totals.remote} tone="amber" />
        <Metric icon={Umbrella} label="On Leave" value={totals.leave} tone="rose" />
      </section>
      <section className="glass mx-auto mt-6 max-w-7xl rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input className="h-11 w-full rounded-lg border border-zinc-200 bg-white/80 py-2 pl-12 pr-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/25 dark:border-zinc-800 dark:bg-zinc-950/70" placeholder="Search employee" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {["TODAY", "WEEK", "MONTH"].map((r) => <button key={r} onClick={() => setRange(r)} className={cn("rounded-lg border px-3 py-2 text-sm", range === r && "border-primary bg-primary/10 text-primary")}>{r[0] + r.slice(1).toLowerCase()}</button>)}
            {["ALL", "ONSITE", "REMOTE", "LEAVE", "NONE"].map((f) => <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg border px-3 py-2 text-sm", filter === f && "border-primary bg-primary/10 text-primary")}>{f === "NONE" ? "Not Checked In" : f[0] + f.slice(1).toLowerCase()}</button>)}
            <button onClick={downloadCsv} disabled={isPending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"><Download className="inline h-4 w-4" /> Export CSV</button>
          </div>
        </div>
        <div className="mt-5 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-3">Employee</th><th>Mode</th><th>Punch In</th><th>Punch Out</th><th>Desk</th><th>Standup</th><th>Admin Override</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.email} onClick={() => setSelected(row)} className="cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/70">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white" style={{ background: `hsl(${row.avatarHue} 70% 45%)` }}>{row.name.slice(0, 2).toUpperCase()}</div>
                      <div><div className="font-semibold">{row.name}</div><div className="text-xs text-zinc-500">{row.role} · {row.email}</div></div>
                    </div>
                  </td>
                  <td><Badge mode={row.mode} status={row.status} /></td>
                  <td>{formatTime(row.punchInAt)}</td>
                  <td>{row.punchOutAt ? `${formatTime(row.punchOutAt)} (${duration(row)})` : "-"}</td>
                  <td>{row.desk ?? "-"}</td>
                  <td className="max-w-xs truncate" title={row.note}>{row.note || "-"}</td>
                  <td>
                    {row.status === "PENDING_LEAVE" && (
                      <form action={decideLeaveAction} onClick={(e) => e.stopPropagation()} className="flex gap-1">
                        <input type="hidden" name="id" value={row.id} />
                        <button name="decision" value="approve" className="rounded-lg border px-2 py-2 text-xs text-emerald-500">Approve</button>
                        <button name="decision" value="reject" className="rounded-lg border px-2 py-2 text-xs text-rose-500">Reject</button>
                      </form>
                    )}
                    {row.status === "ACTIVE" && (
                      <div className="flex gap-2">
                        <form action={forcePunchOutAction} onClick={(e) => e.stopPropagation()} onSubmit={(e) => { if (!confirm("Force punch-out this employee?")) e.preventDefault(); }}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="reason" value="Forgot to punch out" />
                          <button className="rounded-lg border border-rose-300 px-3 py-2 text-xs text-rose-500">Force Punch-Out</button>
                        </form>
                        <form action={editStatusAction} onClick={(e) => e.stopPropagation()} className="flex gap-1">
                          <input type="hidden" name="id" value={row.id} />
                          <select name="mode" defaultValue={row.mode} className="rounded-lg border bg-transparent px-2 text-xs"><option>ONSITE</option><option>REMOTE</option><option>LEAVE</option></select>
                          <select name="desk" defaultValue={row.desk ?? "A1"} className="rounded-lg border bg-transparent px-2 text-xs">{desks.map((desk) => <option key={desk}>{desk}</option>)}</select>
                          <button className="rounded-lg border px-2 text-xs">Save</button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 grid gap-3 md:hidden">
          {filtered.map((row) => (
            <div key={`${row.email}-card`} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-semibold">{row.name}</p><p className="text-xs text-zinc-500">{row.role}</p></div>
                <Badge mode={row.mode} status={row.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-500">
                <span>Desk: {row.desk ?? "-"}</span>
                <span>In: {formatTime(row.punchInAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-zinc-950/70 p-4" onClick={() => setSelected(null)}>
          <div className="glass w-full max-w-lg rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selected.name}</h2>
                <p className="text-sm text-zinc-500">{selected.role} · {selected.email}</p>
              </div>
              <Badge mode={selected.mode} status={selected.status} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Detail label="Punch in" value={formatDateTime(selected.punchInAt)} />
              <Detail label="Punch out" value={formatDateTime(selected.punchOutAt)} />
              <Detail label="Worked hours" value={duration(selected)} />
              <Detail label="Desk" value={selected.desk ?? "-"} />
            </div>
            <div className="mt-4 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase text-zinc-500">Daily note</p>
              <p className="mt-1 text-sm">{selected.note || "-"}</p>
            </div>
            <button onClick={() => setSelected(null)} className="mt-5 rounded-lg bg-primary px-4 py-2 font-semibold text-white">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({ icon: Icon, label, value, tone = "indigo" }: { icon: any; label: string; value: string | number; tone?: string }) {
  return <div className="glass rounded-2xl p-4"><Icon className={cn("h-5 w-5", tone === "emerald" ? "text-emerald-500" : tone === "amber" ? "text-[#539e0b]" : tone === "rose" ? "text-rose-500" : "text-primary")} /><p className="mt-3 text-sm text-zinc-500">{label}</p><p className="text-2xl font-bold">{value}</p></div>;
}

function Badge({ mode, status }: { mode: Row["mode"]; status: string }) {
  if (status === "PENDING_LEAVE") return <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-[#539e0b]">Leave pending</span>;
  if (status === "REJECTED_LEAVE") return <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">Leave rejected</span>;
  if (status === "CLOSED" && mode !== "NONE") return <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-500">Punched out · {mode}</span>;
  const cls = mode === "ONSITE" ? "bg-emerald-500/10 text-emerald-500" : mode === "REMOTE" ? "bg-[#539e0b]/10 text-[#539e0b]" : mode === "LEAVE" ? "bg-rose-500/10 text-rose-500" : "bg-zinc-500/10 text-zinc-500";
  return <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", cls)}>{mode === "NONE" ? "Not checked in" : mode}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"><p className="text-xs uppercase text-zinc-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function duration(row: Row) {
  if (!row.punchInAt || !row.punchOutAt) return "-";
  const ms = new Date(row.punchOutAt).getTime() - new Date(row.punchInAt).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Asia/Kolkata"
});

function formatTime(value: string | null) {
  return value ? timeFormatter.format(new Date(value)) : "-";
}

function formatDateTime(value: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : "-";
}
