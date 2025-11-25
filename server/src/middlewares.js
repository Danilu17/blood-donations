// server/src/middlewares.js
import jwt from "jsonwebtoken";
import { db } from "./db.js";
import { fail } from "./utils.js";

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, "No token", 401);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = payload; next();
  } catch {
    return fail(res, "Token inválido", 401);
  }
}

export function requireRole(roleName) {
  return (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return fail(res, "No auth", 401);
    db.get(
      `SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=? AND r.name=?`,
      [userId, roleName],
      (err, row) => {
        if (err) return fail(res, "DB error", 500);
        if (!row) return fail(res, "Acceso denegado", 403);
        return next();
      }
    );
  };
}
