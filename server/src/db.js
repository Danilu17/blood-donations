// server/src/db.js
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

sqlite3.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../data/database.sqlite");

export const db = new sqlite3.Database(dbPath);

export function initDb() {
  db.serialize(() => {
    // Users & Roles
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      dni TEXT NOT NULL UNIQUE,
      birthdate TEXT NOT NULL,
      sex TEXT NOT NULL CHECK (sex IN ('M','F','X')),
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      lock_until INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS user_roles (
      user_id INTEGER NOT NULL,
      role_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    // Health questionnaire
    db.run(`CREATE TABLE IF NOT EXISTS health_forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      weight REAL NOT NULL,
      diseases TEXT NOT NULL, -- csv
      medications TEXT NOT NULL,
      last_donation_date TEXT NOT NULL,
      blood_group TEXT NOT NULL CHECK (blood_group IN ('A','B','AB','O')),
      rh_factor TEXT NOT NULL CHECK (rh_factor IN ('Rh+','Rh-')),
      status TEXT NOT NULL, -- 'Apto','No apto','Requiere revision'
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    // Centers & Campaigns
    db.run(`CREATE TABLE IF NOT EXISTS centers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      hours TEXT NOT NULL,
      lat REAL,
      lng REAL,
      capacity INTEGER NOT NULL DEFAULT 50
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      center_id INTEGER NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      start_time TEXT NOT NULL, -- HH:mm
      end_time TEXT NOT NULL,   -- HH:mm
      requirements TEXT, -- JSON: {min_age, requested_groups, notes}
      capacity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active', -- active|finalized|cancelled
      organizer_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (center_id) REFERENCES centers(id),
      FOREIGN KEY (organizer_id) REFERENCES users(id)
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS campaign_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      version INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
    );`);

    // Enrollments & Donations
    db.run(`CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed|waitlist
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      UNIQUE(campaign_id, user_id),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      campaign_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      center_id INTEGER NOT NULL,
      blood_type TEXT NOT NULL,  -- e.g., O+, A-
      volume_ml INTEGER NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'successful', -- successful|failed
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY (center_id) REFERENCES centers(id)
    );`);

    // Notifications
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    // Volunteers
    db.run(`CREATE TABLE IF NOT EXISTS volunteer_availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      days TEXT NOT NULL, -- csv, e.g. "Mon,Wed"
      from_time TEXT NOT NULL,
      to_time TEXT NOT NULL,
      task TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    // Role management
    db.run(`CREATE TABLE IF NOT EXISTS role_change_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      requested_role TEXT NOT NULL, -- 'Organizer'|'Beneficiary'|'Donor'
      justification TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      decision_reason TEXT,
      decided_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`);

    // Beneficiary
    db.run(`CREATE TABLE IF NOT EXISTS beneficiary_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      blood_group TEXT NOT NULL,
      rh_factor TEXT NOT NULL,
      units INTEGER NOT NULL,
      center_id INTEGER NOT NULL,
      urgency TEXT NOT NULL, -- 'normal'|'urgent'|'critical'
      estimated_date TEXT NOT NULL, -- YYYY-MM-DD
      status TEXT NOT NULL DEFAULT 'pending', -- pending|in_campaign|closed|rejected
      reason TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (center_id) REFERENCES centers(id)
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS campaign_proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      beneficiary_id INTEGER NOT NULL,
      center_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- pending|approved|rejected|published
      linked_campaign_id INTEGER,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY (beneficiary_id) REFERENCES users(id),
      FOREIGN KEY (center_id) REFERENCES centers(id),
      FOREIGN KEY (linked_campaign_id) REFERENCES campaigns(id)
    );`);

    // Indexes for perf
    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_campaigns_center_date ON campaigns(center_id, date, start_time, end_time);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_enrollments_campaign ON enrollments(campaign_id);`);
  });
}
