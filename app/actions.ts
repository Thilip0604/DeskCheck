"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { createSession, currentUser, destroySession, hashPassword, requireAdmin, requireUser, verifyPassword } from "@/lib/auth";
import { csvEscape, desks, todayKey } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

type WorkMode = "ONSITE" | "REMOTE" | "LEAVE";

const roles = ["Software Engineer", "Software Developer", "Technology Intern", "HR Specialist", "Engineering Manager"];

export async function registerAction(_: unknown, formData: FormData) {
  const input = z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7),
    password: z.string().min(8).regex(/[A-Z]/, "uppercase").regex(/[0-9]/, "number"),
    role: z.enum(roles as [string, ...string[]])
  }).safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "Please complete every field. Password needs 8+ characters, one uppercase letter, and one number." };
  const isAdmin = ["HR Specialist", "Engineering Manager"].includes(input.data.role);
  const { password, ...profile } = input.data;
  const email = input.data.email.toLowerCase();
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "That email is already registered. Sign in with that account, or use Forgot password to set a new password." };
    const user = await prisma.user.create({
      data: {
        ...profile,
        email,
        isAdmin,
        passwordHash: await hashPassword(password),
        avatarHue: Math.floor(Math.random() * 300) + 20
      }
    });
    await createSession(user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "That email is already registered. Sign in with that account, or use Forgot password to set a new password." };
    }
    console.error("Registration failed", error);
    return { error: "Account could not be created right now. Please check the details and try again." };
  }
  redirect(isAdmin ? "/admin/dashboard" : "/employee/dashboard");
}

export async function loginAction(_: unknown, formData: FormData) {
  const input = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "Enter your email and password." };
  const user = await prisma.user.findUnique({ where: { email: input.data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(input.data.password, user.passwordHash))) return { error: "Invalid credentials." };
  await createSession(user.id);
  redirect(user.isAdmin ? "/admin/dashboard" : "/employee/dashboard");
}

export async function resetPasswordAction(_: unknown, formData: FormData) {
  const input = z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/)
  }).safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "Use a valid email and a password with 8+ characters, one uppercase letter, and one number." };
  const email = input.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "No account found with that email. Please register first." };
  await prisma.user.update({
    where: { email },
    data: { passwordHash: await hashPassword(input.data.password) }
  });
  return { ok: "Password reset. You can sign in now." };
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function punchInAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const input = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    mode: z.enum(["ONSITE", "REMOTE", "LEAVE"]),
    desk: z.string().optional(),
    standupNote: z.string().min(2).max(500)
  }).safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "Choose a mode and add your focus note." };
  if (input.data.mode === "ONSITE" && (!input.data.desk || !desks.includes(input.data.desk))) return { error: "Select an available desk." };
  if (input.data.mode !== "ONSITE") input.data.desk = undefined;

  try {
    await prisma.$transaction(async (tx) => {
      const staleCutoff = new Date(Date.now() - 1000 * 60 * 60 * 12);
      await tx.attendance.updateMany({
        where: { userId: user.id, status: "ACTIVE", punchInAt: { lt: staleCutoff } },
        data: { status: "CLOSED", punchOutAt: new Date(), standupNote: "System auto-closed stale shift after 12 hours." }
      });
      const existing = await tx.attendance.findFirst({ where: { userId: user.id, status: "ACTIVE" } });
      if (existing) throw new Error("You already have an active shift.");
      const alreadyLoggedToday = await tx.attendance.findFirst({ where: { userId: user.id, date: input.data.date } });
      if (alreadyLoggedToday) throw new Error("You already submitted attendance for this date. Contact admin if it needs correction.");
      if (input.data.mode === "ONSITE") {
        const deskTaken = await tx.attendance.findFirst({
          where: { date: input.data.date, desk: input.data.desk, status: "ACTIVE", userId: { not: user.id } },
          include: { user: true }
        });
        if (deskTaken) throw new Error(`${input.data.desk} is already booked by ${deskTaken.user.name}.`);
      }
      await tx.attendance.create({
        data: {
          userId: user.id,
          date: input.data.date,
          mode: input.data.mode,
          desk: input.data.desk,
          standupNote: input.data.standupNote,
          punchInAt: new Date(),
          status: input.data.mode === "LEAVE" ? "PENDING_LEAVE" : "ACTIVE"
        }
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not punch in." };
  }
  revalidatePath("/employee/dashboard");
  revalidatePath("/admin/dashboard");
  return { ok: "You are punched in." };
}

export async function punchOutAction() {
  const user = await requireUser();
  const active = await prisma.attendance.findFirst({ where: { userId: user.id, status: "ACTIVE" } });
  if (!active) return { error: "No active shift found." };
  await prisma.attendance.update({ where: { id: active.id }, data: { status: "CLOSED", punchOutAt: new Date() } });
  revalidatePath("/employee/dashboard");
  revalidatePath("/admin/dashboard");
  return { ok: "Shift closed." };
}

export async function updateProfileAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const input = z.object({
    name: z.string().min(2),
    phone: z.string().min(7)
  }).safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "Enter a valid name and phone number." };
  await prisma.user.update({ where: { id: user.id }, data: input.data });
  revalidatePath("/employee/dashboard");
  return { ok: "Profile updated." };
}

export async function forcePunchOutAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "Admin force punch-out").slice(0, 160);
  const current = await prisma.attendance.findUnique({ where: { id } });
  await prisma.attendance.updateMany({
    where: { id, status: "ACTIVE" },
    data: { status: "CLOSED", punchOutAt: new Date(), forcedById: admin.id, standupNote: `${current?.standupNote ?? ""} | Force out: ${reason}` }
  });
  revalidatePath("/admin/dashboard");
}

export async function decideLeaveAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (decision === "approve") {
    await prisma.attendance.update({ where: { id }, data: { status: "CLOSED", punchOutAt: new Date(), mode: "LEAVE" } });
  }
  if (decision === "reject") {
    await prisma.attendance.update({ where: { id }, data: { status: "REJECTED_LEAVE", punchOutAt: new Date() } });
  }
  revalidatePath("/admin/dashboard");
  revalidatePath("/employee/dashboard");
}

export async function editStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const mode = String(formData.get("mode")) as WorkMode;
  const desk = String(formData.get("desk") ?? "");
  if (!["ONSITE", "REMOTE", "LEAVE"].includes(mode)) return;
  if (mode === "ONSITE") {
    if (!desks.includes(desk)) return;
    const current = await prisma.attendance.findUnique({ where: { id } });
    if (!current) return;
    const taken = await prisma.attendance.findFirst({ where: { id: { not: id }, date: current.date, desk, status: "ACTIVE" } });
    if (taken) return;
    await prisma.attendance.update({ where: { id }, data: { mode, desk } });
  } else {
    await prisma.attendance.update({ where: { id }, data: { mode, desk: null } });
  }
  revalidatePath("/admin/dashboard");
}

export async function exportCsvAction() {
  await requireAdmin();
  const rows = await prisma.attendance.findMany({ include: { user: true }, orderBy: [{ date: "desc" }, { punchInAt: "desc" }] });
  return [
    ["Name", "Email", "Role", "Date", "Mode", "Desk", "Punch In", "Punch Out", "Note"].join(","),
    ...rows.map((r) => [r.user.name, r.user.email, r.user.role, r.date, r.mode, r.desk, r.punchInAt.toISOString(), r.punchOutAt?.toISOString() ?? "", r.standupNote].map(csvEscape).join(","))
  ].join("\n");
}

export async function homeRedirect() {
  const user = await currentUser();
  redirect(user?.isAdmin ? "/admin/dashboard" : user ? "/employee/dashboard" : "/login");
}
