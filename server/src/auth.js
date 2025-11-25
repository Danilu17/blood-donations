// server/src/auth.js
import express from "express";
import dayjs from "dayjs";
import { db } from "./db.js";
import { comparePassword, hashPassword, signJWT, validatePasswordPolicy, ok, fail } from "./utils.js";

export const authRouter = express.Router();

// Register
authRouter.post("/register", (req, res) => {
  const { name, surname, dni, birthdate, sex, email, phone, address, password } = req.body;
  if (!name || !surname || !dni || !birthdate || !sex || !email || !phone || !address || !password) {
    return fail(res, "Campos obligatorios faltantes");
  }
  if (!validatePasswordPolicy(password)) return fail(res, "Contraseña insegura");
  db.serialize(() => {
    db.run(`INSERT OR IGNORE INTO roles(name) VALUES ('Donor'),('Beneficiary'),('Organizer'),('Admin');`);
    db.get(`SELECT id FROM users WHERE dni=? OR email=?`, [dni, email], (err, row) => {
      if (err) return fail(res, "DB error", 500);
      if (row) return fail(res, "DNI o Email ya registrados", 409);
      const hash = hashPassword(password);
      db.run(
        `INSERT INTO users(name,surname,dni,birthdate,sex,email,phone,address,password_hash) VALUES (?,?,?,?,?,?,?,?,?)`,
        [name, surname, dni, birthdate, sex, email, phone, address, hash],
        function (err2) {
          if (err2) return fail(res, "DB error", 500);
          const userId = this.lastID;
          db.get(`SELECT id FROM roles WHERE name='Donor'`, [], (e2, roleRow) => {
            if (e2) return fail(res, "DB error", 500);
            db.run(`INSERT INTO user_roles(user_id,role_id) VALUES (?,?)`, [userId, roleRow.id]);
            const token = signJWT({ id: userId, email });
            ok(res, { token });
          });
        }
      );
    });
  });
});

// Login with lockout
authRouter.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email=?`, [email], (err, user) => {
    if (err) return fail(res, "DB error", 500);
    if (!user) return fail(res, "Credenciales inválidas", 401);
    const now = Math.floor(Date.now() / 1000);
    if (user.lock_until && user.lock_until > now) return fail(res, "Cuenta bloqueada temporalmente. Intente más tarde.", 423);
    const okPwd = comparePassword(password, user.password_hash);
    if (!okPwd) {
      const attempts = (user.failed_attempts || 0) + 1;
      let lockUntil = user.lock_until || 0;
      if (attempts >= 3) {
        lockUntil = now + 10; // 10 seconds
      }
      db.run(`UPDATE users SET failed_attempts=?, lock_until=? WHERE id=?`, [attempts, lockUntil, user.id]);
      return fail(res, "Credenciales inválidas", 401);
    }
    // reset attempts
    db.run(`UPDATE users SET failed_attempts=0, lock_until=0 WHERE id=?`, [user.id]);
    const token = signJWT(user);
    ok(res, { token });
  });
});

authRouter.get("/me", async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, "No token", 401);
  try {
    const payload = (await import("jsonwebtoken")).default.verify(token, process.env.JWT_SECRET || "devsecret");
    const userId = payload.id;
    db.get(
      `SELECT id,name,surname,email,dni,sex,birthdate,phone,address FROM users WHERE id=?`,
      [userId],
      (err, row) => {
        if (err) return fail(res, "DB error", 500);
        if (!row) return fail(res, "No user", 404);
        db.all(
          `SELECT r.name FROM roles r JOIN user_roles ur ON ur.role_id=r.id WHERE ur.user_id=?`,
          [userId],
          (e2, roles) => {
            if (e2) return fail(res, "DB error", 500);
            ok(res, { ...row, roles: roles.map(r => r.name) });
          }
        );
      }
    );
  } catch {
    return fail(res, "Token inválido", 401);
  }
});

// Forgot password -> create code
authRouter.post("/forgot", (req, res) => {
  const { email } = req.body;
  db.get(`SELECT id FROM users WHERE email=?`, [email], (err, user) => {
    if (err) return fail(res, "DB error", 500);
    if (!user) return fail(res, "Si existe, enviamos instrucciones", 200);
    const code = Math.floor(100000 + Math.random()*900000).toString();
    const expires = Math.floor(Date.now()/1000) + 15*60;
    db.run(`INSERT INTO password_resets(user_id, code, expires_at) VALUES (?,?,?)`, [user.id, code, expires]);
    console.log(`🔐 Código de reseteo para ${email}: ${code}`); // sin email externo
    ok(res, { message: "Código enviado. Revise la consola del servidor." });
  });
});

// Reset password using code
authRouter.post("/reset", (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!validatePasswordPolicy(newPassword)) return fail(res, "Contraseña insegura");
  db.get(`SELECT id FROM users WHERE email=?`, [email], (err, user) => {
    if (err || !user) return fail(res, "Código inválido", 400);
    db.get(`SELECT * FROM password_resets WHERE user_id=? AND code=? AND used=0 ORDER BY id DESC`, [user.id, code], (e2, pr) => {
      const now = Math.floor(Date.now() / 1000);
      if (e2 || !pr || pr.expires_at < now) return fail(res, "Código inválido o expirado", 400);
      db.serialize(() => {
        db.run(`UPDATE password_resets SET used=1 WHERE id=?`, [pr.id]);
        db.run(`UPDATE users SET password_hash=? WHERE id=?`, [hashPassword(newPassword), user.id]);
        ok(res, { message: "Contraseña actualizada" });
      });
    });
  });
});

export default authRouter;
