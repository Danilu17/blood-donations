// server/src/routes/notifications.js
import express from "express";
import { db } from "../db.js";
import { authRequired } from "../middlewares.js";
import { ok, fail } from "../utils.js";

export const notifRouter = express.Router();

notifRouter.get("/", authRequired, (req, res) => {
  db.all(`SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50`, [req.user.id], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

notifRouter.post("/read", authRequired, (req, res) => {
  db.run(`UPDATE notifications SET read=1 WHERE user_id=?`, [req.user.id], (err) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, { read: true });
  });
});

export default notifRouter;
