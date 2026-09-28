import { redirect } from "next/navigation";
import { EmployeeDashboard } from "@/components/EmployeeDashboard";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/utils";

type WorkMode = "ONSITE" | "REMOTE" | "LEAVE";

function toMode(mode: string): WorkMode {
  return mode === "REMOTE" || mode === "LEAVE" ? mode : "ONSITE";
}

export default async function EmployeePage() {
  const user = await requireUser();
  if (user.isAdmin) redirect("/admin/dashboard");
  await prisma.attendance.updateMany({
    where: { userId: user.id, status: "ACTIVE", punchInAt: { lt: new Date(Date.now() - 1000 * 60 * 60 * 12) } },
    data: { status: "CLOSED", punchOutAt: new Date(), standupNote: "System auto-closed stale shift after 12 hours." }
  });
  const [active, occupied, history] = await Promise.all([
    prisma.attendance.findFirst({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.attendance.findMany({ where: { date: todayKey(), mode: "ONSITE", status: "ACTIVE" }, select: { desk: true, user: { select: { name: true } } } }),
    prisma.attendance.findMany({ where: { userId: user.id }, orderBy: { punchInAt: "desc" }, take: 8 })
  ]);
  return (
    <EmployeeDashboard
      user={{ name: user.name, role: user.role, phone: user.phone }}
      active={active ? { id: active.id, mode: toMode(active.mode), desk: active.desk, standupNote: active.standupNote, punchInAt: active.punchInAt.toISOString() } : null}
      occupied={occupied}
      history={history.map((item) => ({ id: item.id, date: item.date, mode: item.mode, desk: item.desk, punchInAt: item.punchInAt.toISOString(), punchOutAt: item.punchOutAt?.toISOString() ?? null, status: item.status, standupNote: item.standupNote }))}
    />
  );
}
