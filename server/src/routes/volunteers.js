// server/src/routes/volunteers.js
import express from "express";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail } from "../utils.js";

export const volunteersRouter = express.Router();

volunteersRouter.post("/", authRequired, (req, res) => {
  const { days, from_time, to_time, task="", notes="" } = req.body;
  if (!days || !from_time || !to_time) return fail(res, "Campos requeridos");
  db.run(`INSERT INTO volunteer_availability(user_id, days, from_time, to_time, task, notes) VALUES (?,?,?,?,?,?)`,
    [req.user.id, Array.isArray(days)?days.join(","):days, from_time, to_time, task, notes], function(err){
      if (err) return fail(res, "DB error", 500);
      ok(res, { id: this.lastID });
    });
});

volunteersRouter.get("/", authRequired, (req, res) => {
  db.all(`SELECT * FROM volunteer_availability WHERE user_id=? ORDER BY created_at DESC`, [req.user.id], (err, rows)=>{
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

volunteersRouter.get("/pool", authRequired, requireRole("Organizer"), (req, res) => {
  db.all(`SELECT va.*, u.name||' '||u.surname as full_name FROM volunteer_availability va JOIN users u ON u.id=va.user_id ORDER BY va.created_at DESC`, [], (err, rows)=>{
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

volunteersRouter.post("/:userId/assign/:campaignId", authRequired, requireRole("Organizer"), (req, res) => {
  db.run(`INSERT INTO notifications(user_id,title,body) VALUES (?,?,?)`,
    [req.params.userId, "Asignación a campaña", `Fuiste asignado como voluntario a la campaña ${req.params.campaignId}`], (err)=>{
      if (err) return fail(res, "DB error", 500);
      ok(res, { assigned: true });
    });
});

export default volunteersRouter;
