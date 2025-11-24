import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { get } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export async function authenticate(email, password) {
  const user = await get(`SELECT * FROM users WHERE email = ?`, [email]);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash || "");
  if (!ok) return null;
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  return { token, user: sanitize(user) };
}

export function requireAuth(roles = []) {
  return (req, res, next) => {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token" });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(payload.role)) return res.status(403).json({ error: "Forbidden" });
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

function sanitize(u) {
  const { password_hash, ...rest } = u;
  return rest;
}