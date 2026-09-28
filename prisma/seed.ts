import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Deskcheck@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@deskcheck.local" },
    update: {},
    create: {
      name: "Avery Admin",
      email: "admin@deskcheck.local",
      phone: "+1 555 0100",
      role: "Engineering Manager",
      isAdmin: true,
      passwordHash,
      avatarHue: 250
    }
  });
  await prisma.user.upsert({
    where: { email: "employee@deskcheck.local" },
    update: {},
    create: {
      name: "Sam Engineer",
      email: "employee@deskcheck.local",
      phone: "+1 555 0110",
      role: "Software Engineer",
      isAdmin: false,
      passwordHash,
      avatarHue: 170
    }
  });
  await prisma.user.upsert({
    where: { email: "deepak@gmail.com" },
    update: { passwordHash },
    create: {
      name: "Deepak Kumar",
      email: "deepak@gmail.com",
      phone: "+1 555 0120",
      role: "Software Developer",
      isAdmin: false,
      passwordHash,
      avatarHue: 205
    }
  });
}

main().finally(async () => prisma.$disconnect());
