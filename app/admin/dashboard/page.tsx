import { AdminDashboard } from "@/components/AdminDashboard";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
type WorkMode = "ONSITE" | "REMOTE" | "LEAVE";

function toMode(mode: string): WorkMode | "NONE" {
  return mode === "ONSITE" || mode === "REMOTE" || mode === "LEAVE" ? mode : "NONE";
}

export default async function AdminPage() {
  await requireAdmin();
  const [employees, todayShifts] = await Promise.all([
    prisma.user.findMany({ where: { isAdmin: false }, orderBy: { name: "asc" } }),
    prisma.attendance.findMany({ where: { date: todayKey() }, include: { user: true }, orderBy: { punchInAt: "desc" } })
  ]);
  const latestByUser = new Map<string, (typeof todayShifts)[number]>();
  for (const shift of todayShifts) {
    if (!latestByUser.has(shift.userId)) latestByUser.set(shift.userId, shift);
  }
  const active = todayShifts.filter((shift) => shift.status === "ACTIVE");
  const rows = employees.map((employee) => {
    const shift = latestByUser.get(employee.id);
    return {
      id: shift?.id ?? "",
      name: employee.name,
      email: employee.email,
      role: employee.role,
      avatarHue: employee.avatarHue,
      mode: shift ? toMode(shift.mode) : "NONE" as const,
      punchInAt: shift?.punchInAt.toISOString() ?? null,
      punchOutAt: shift?.punchOutAt?.toISOString() ?? null,
      desk: shift?.desk ?? null,
      note: shift?.standupNote ?? "",
      status: shift?.status ?? "NONE"
    };
  });
  const onsite = active.filter((a) => a.mode === "ONSITE").length;
  const remote = active.filter((a) => a.mode === "REMOTE").length;
  const leave = active.filter((a) => a.mode === "LEAVE").length;
  return <AdminDashboard rows={rows} totals={{ registered: employees.length, onsite, remote, leave }} />;
}
