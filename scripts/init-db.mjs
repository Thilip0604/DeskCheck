import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";

const dbPath = join(process.cwd(), "prisma", "dev.db");
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  isAdmin BOOLEAN NOT NULL DEFAULT false,
  passwordHash TEXT NOT NULL,
  avatarHue INTEGER NOT NULL DEFAULT 220,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS Session (
  id TEXT PRIMARY KEY NOT NULL,
  tokenHash TEXT NOT NULL UNIQUE,
  userId TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT Session_userId_fkey FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS Attendance (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL,
  date TEXT NOT NULL,
  mode TEXT NOT NULL,
  desk TEXT,
  standupNote TEXT NOT NULL,
  punchInAt DATETIME NOT NULL,
  punchOutAt DATETIME,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  forcedById TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT Attendance_userId_fkey FOREIGN KEY (userId) REFERENCES User (id) ON DELETE CASCADE ON UPDATE CASCADE
);
DROP INDEX IF EXISTS Attendance_userId_date_status_key;
CREATE INDEX IF NOT EXISTS Attendance_userId_date_status_idx ON Attendance(userId, date, status);
CREATE UNIQUE INDEX IF NOT EXISTS Attendance_active_user_guard ON Attendance(userId) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS Attendance_date_mode_status_idx ON Attendance(date, mode, status);
CREATE UNIQUE INDEX IF NOT EXISTS Attendance_active_desk_guard ON Attendance(date, desk) WHERE status = 'ACTIVE' AND desk IS NOT NULL;
`);

const passwordHash = await bcrypt.hash("Deskcheck@123", 12);
const insert = db.prepare(`
INSERT OR IGNORE INTO User (id, name, email, phone, role, isAdmin, passwordHash, avatarHue)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

insert.run("demo_admin", "Avery Admin", "admin@deskcheck.local", "+1 555 0100", "Engineering Manager", 1, passwordHash, 250);
insert.run("demo_employee", "Sam Engineer", "employee@deskcheck.local", "+1 555 0110", "Software Engineer", 0, passwordHash, 170);
insert.run("demo_deepak", "Deepak Kumar", "deepak@gmail.com", "+1 555 0120", "Software Developer", 0, passwordHash, 205);
db.close();
console.log("DeskCheck database ready at prisma/dev.db");
