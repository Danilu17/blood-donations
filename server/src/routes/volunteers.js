// server/src/routes/volunteers.js
import express from "express";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail } from "../utils.js";

export const volunteersRouter = express.Router();

/* Donante registra disponibilidad (voluntario) */
volunteersRouter.post("/", authRequired, (req, res) => {
  const { days, from_time, to_time, task = "", notes = "" } = req.body;
  if (!days || !from_time || !to_time) return fail(res, "Campos requeridos");
  db.run(
    `INSERT INTO volunteer_availability(user_id, days, from_time, to_time, task, notes)
     VALUES (?,?,?,?,?,?)`,
    [req.user.id, Array.isArray(days) ? days.join(",") : days, from_time, to_time, task, notes],
    function (err) {
      if (err) return fail(res, "DB error", 500);
      ok(res, { id: this.lastID });
    }
  );
});

/* Ver mis disponibilidades */
volunteersRouter.get("/", authRequired, (req, res) => {
  db.all(
    `SELECT * FROM volunteer_availability
     WHERE user_id=? ORDER BY created_at DESC`,
    [req.user.id],
    (err, rows) => (err ? fail(res, "DB error", 500) : ok(res, rows))
  );
});

/* Pool para organizador (trae tipo sanguíneo desde último health_form) */
volunteersRouter.get("/pool", authRequired, requireRole("Organizer"), (req, res) => {
  db.all(
    `SELECT
        va.*,
        u.name||' '||u.surname AS full_name,
        (SELECT hf.blood_group FROM health_forms hf WHERE hf.user_id=u.id ORDER BY hf.created_at DESC LIMIT 1) AS blood_group,
        (SELECT hf.rh_factor   FROM health_forms hf WHERE hf.user_id=u.id ORDER BY hf.created_at DESC LIMIT 1) AS rh_factor
     FROM volunteer_availability va
     JOIN users u ON u.id = va.user_id
     ORDER BY va.created_at DESC`,
    [],
    (err, rows) => (err ? fail(res, "DB error", 500) : ok(res, rows))
  );
});

/* Asignar voluntario a campaña → notifica con NOMBRE de campaña */
volunteersRouter.post("/:userId/assign/:campaignId", authRequired, requireRole("Organizer"), (req, res) => {
  const { userId, campaignId } = req.params;
  db.get(`SELECT id, name FROM campaigns WHERE id=?`, [campaignId], (e1, camp) => {
    if (e1) return fail(res, "DB error", 500);
    if (!camp) return fail(res, "Campaña inválida", 400);

    db.run(
      `INSERT INTO notifications(user_id, title, body)
       VALUES (?,?,?)`,
      [
        userId,
        "Asignación a campaña",
        `Fuiste asignado como voluntario a la campaña "${camp.name}".`,
      ],
      (e2) => (e2 ? fail(res, "DB error", 500) : ok(res, { assigned: true }))
    );
  });
});

export default volunteersRouter;
