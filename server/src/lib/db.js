// server/src/lib/db.js
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB en server/data/app.db
const dbDir = path.join(__dirname, "../../data");
const dbPath = path.join(dbDir, "app.db");

// crea la carpeta si falta (why: evitar SQLITE_CANTOPEN en Windows)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

sqlite3.verbose();
export const db = new sqlite3.Database(dbPath);

export async function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}
export async function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function (err, row) {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
export async function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, function (err, rows) {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export async function initDb() {
  await run(`PRAGMA foreign_keys = ON;`);
  await run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, surname TEXT, dni TEXT, sex TEXT, birthdate TEXT,
    email TEXT UNIQUE, phone TEXT, address TEXT,
    blood_group TEXT, rh_factor TEXT,
    password_hash TEXT, role TEXT DEFAULT 'DONOR',
    status TEXT DEFAULT 'ACTIVE'
  );`);
  await run(`CREATE TABLE IF NOT EXISTS centers(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, address TEXT, hours TEXT
  );`);
  await run(`CREATE TABLE IF NOT EXISTS campaigns(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT, center_id INTEGER, address TEXT,
    start TEXT, end TEXT, capacity INTEGER, status TEXT DEFAULT 'ACTIVE',
    requirements TEXT, organizer_id INTEGER,
    FOREIGN KEY(center_id) REFERENCES centers(id),
    FOREIGN KEY(organizer_id) REFERENCES users(id)
  );`);
  await run(`CREATE TABLE IF NOT EXISTS registrations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER, user_id INTEGER,
    status TEXT DEFAULT 'PENDING',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`);
  await run(`CREATE TABLE IF NOT EXISTS health_forms(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, weight REAL,
    chronic TEXT, meds TEXT, last_donation TEXT,
    blood_group TEXT, rh_factor TEXT, state TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`);
  await run(`CREATE TABLE IF NOT EXISTS donations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, center_id INTEGER, date TEXT,
    blood_group TEXT, rh_factor TEXT, volume_ml INTEGER, notes TEXT, success INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(center_id) REFERENCES centers(id)
  );`);
  await run(`CREATE TABLE IF NOT EXISTS volunteer_slots(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, days TEXT, time_from TEXT, time_to TEXT,
    task TEXT, note TEXT, FOREIGN KEY(user_id) REFERENCES users(id)
  );`);
  await run(`CREATE TABLE IF NOT EXISTS notif_settings(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, channel TEXT, frequency TEXT, types TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`);
  await run(`CREATE TABLE IF NOT EXISTS role_requests(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, target_role TEXT, reason TEXT, status TEXT DEFAULT 'PENDING',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );`);
  await run(`CREATE TABLE IF NOT EXISTS announcements(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER, target TEXT, subject TEXT, message TEXT, attachment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id)
  );`);
}

export async function seedIfEmpty() {
  const u = await get(`SELECT COUNT(*) as c FROM users;`);
  if (u.c > 0) return;
  const hash = await bcrypt.hash("123456", 10);
  const donorId = (await run(
    `INSERT INTO users(name,surname,email,password_hash,role,sex,birthdate,blood_group,rh_factor)
     VALUES(?,?,?,?,?,?,?,?,?)`,
    ["Ana","Donante","donor@demo.com",hash,"DONOR","F","1995-05-10","O","+"]
  )).lastID;
  const orgId = (await run(
    `INSERT INTO users(name,surname,email,password_hash,role)
     VALUES(?,?,?,?,?)`,
    ["Oscar","Organizador","org@demo.com",hash,"ORG"]
  )).lastID;
  await run(
    `INSERT INTO users(name,surname,email,password_hash,role)
     VALUES(?,?,?,?,?)`,
    ["Ada","Admin","admin@demo.com",hash,"ADMIN"]
  );

  const c1 = (await run(
    `INSERT INTO centers(name,address,hours) VALUES(?,?,?)`,
    ["Hospital Durand","Av. Díaz Vélez 5044","L-V 08:00–16:00"])
  ).lastID;
  const c2 = (await run(
    `INSERT INTO centers(name,address,hours) VALUES(?,?,?)`,
    ["UBA Medicina","Paraguay 2155","L-V 09:00–17:00"])
  ).lastID;

  const now = new Date();
  const start1 = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 8).toISOString();
  const end1 = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 14).toISOString();
  await run(
    `INSERT INTO campaigns(title,center_id,address,start,end,capacity,requirements,organizer_id)
     VALUES(?,?,?,?,?,?,?,?)`,
    ["Colecta Solidaria en Centro Medico Cuinsa", c1, "Av. Malvinas Argentinas 677, CABA",
     start1, end1, 50, JSON.stringify(["Desayuno liviano","Sin antibióticos","Grupo: cualquiera"]), orgId]
  );

  const start2 = new Date(now.getFullYear(), now.getMonth(), now.getDate()+2, 9).toISOString();
  const end2 = new Date(now.getFullYear(), now.getMonth(), now.getDate()+2, 16).toISOString();
  await run(
    `INSERT INTO campaigns(title,center_id,address,start,end,capacity,requirements,organizer_id)
     VALUES(?,?,?,?,?,?,?,?)`,
    ["Jornada de Donación en Universidad Nacional", c2, "Av. Siempre Viva 123, CABA",
     start2, end2, 50, JSON.stringify(["Desayuno liviano"]), orgId]
  );

  await run(
    `INSERT INTO donations(user_id,center_id,date,blood_group,rh_factor,volume_ml,notes,success)
     VALUES(?,?,?,?,?,?,?,?)`,
    [donorId, c1, new Date().toISOString(), "A","+", 450, "Donación exitosa. Buen nivel de hierro.", 1]
  );

  await run(
    `INSERT INTO notif_settings(user_id,channel,frequency,types)
     VALUES(?,?,?,?)`,
    [donorId,"EMAIL","SEMANAL",JSON.stringify(["REMINDERS","ALERTS","CONFIRMATIONS","ANNOUNCEMENTS"])]
  );
}
