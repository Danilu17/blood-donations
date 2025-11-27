// server/src/routes/notifications.js
import express from "express";
import { db } from "../db.js";
import { authRequired } from "../middlewares.js";
import { ok, fail } from "../utils.js";

const notifRouter = express.Router();

/* Bootstrap idempotente: por si tu DB no tiene tablas */
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS roles(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS user_roles(
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    UNIQUE(user_id, role_id)
  )`);
  const seed = db.prepare(`INSERT OR IGNORE INTO roles(name) VALUES (?), (?), (?), (?)`);
  seed.run(["Donor","Organizer","Beneficiary","Admin"]);
  seed.finalize();

  db.run(`CREATE TABLE IF NOT EXISTS notifications(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    campaign_id INTEGER,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    sender_id INTEGER
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read, created_at DESC)`);
});

function getUserRoles(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT r.name
         FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
        WHERE ur.user_id = ?`,
      [userId],
      (err, rows) => (err ? reject(err) : resolve(rows.map(x => x.name)))
    );
  });
}

/* Campanita */
notifRouter.get("/", authRequired, (req, res) => {
  db.all(
    `SELECT id, subject, message, campaign_id, read, created_at
       FROM notifications
      WHERE user_id=?
      ORDER BY created_at DESC
      LIMIT 50`,
    [req.user.id],
    (err, rows) => (err ? fail(res, "DB error", 500) : ok(res, rows))
  );
});

/* Marcar leídas */
notifRouter.post("/read", authRequired, (req, res) => {
  db.run(`UPDATE notifications SET read=1 WHERE user_id=?`, [req.user.id], (err) =>
    err ? fail(res, "DB error", 500) : ok(res, { read: true })
  );
});

/* Broadcast por rol (Organizer/Admin) */
notifRouter.post("/broadcast", authRequired, async (req, res) => {
  try {
    const roles = req.user.roles || (await getUserRoles(req.user.id));
    const canSend = roles.includes("Organizer") || roles.includes("Admin");
    if (!canSend) return fail(res, "No autorizado", 403);

    const { audience, subject, message, campaign_id } = req.body || {};
    if (!subject || !message) return fail(res, "Faltan asunto/mensaje", 400);

    const map = { admins: "Admin", organizers: "Organizer", donors: "Donor", beneficiaries: "Beneficiary" };
    const roleName = map[audience];
    if (!roleName) return fail(res, "Audiencia inválida", 400);

    db.all(
      `SELECT u.id AS user_id
         FROM users u
         JOIN user_roles ur ON ur.user_id = u.id
         JOIN roles r ON r.id = ur.role_id
        WHERE r.name = ?`,
      [roleName],
      (err, rows) => {
        if (err) return fail(res, "DB error", 500);
        if (!rows || rows.length === 0) return ok(res, { count: 0 });

        db.serialize(() => {
          const stmt = db.prepare(
            `INSERT INTO notifications (user_id, subject, message, campaign_id, read, sender_id)
             VALUES (?,?,?,?,0,?)`
          );
          for (const r of rows) stmt.run([r.user_id, subject, message, campaign_id ?? null, req.user.id]);
          stmt.finalize((finalErr) => finalErr ? fail(res, "DB error", 500) : ok(res, { count: rows.length }));
        });
      }
    );
  } catch {
    fail(res, "Error inesperado", 500);
  }
});

export default notifRouter;
export { notifRouter };
