import express from "express";
import { db } from "../db.js";
import { authRequired } from "../middlewares.js";
import { ok, fail } from "../utils.js";

export const enrollRouter = express.Router();

function checkEligibility(userId, cb) {
  // latest health form
  db.get(`SELECT * FROM health_forms WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, [userId], (err, hf) => {
    if (err) return cb("DB error");
    if (!hf || hf.status !== "Apto") return cb("Requiere cuestionario de salud apto");
    return cb(null, hf);
  });
}

function enrollUserToCampaign(campaignId, userId, res) {
  db.get(`SELECT * FROM campaigns WHERE id=? AND status='active'`, [campaignId], (err, camp) => {
    if (err || !camp) return fail(res, "Campaña no disponible", 404);
    checkEligibility(userId, (msg, hf) => {
      if (msg) return fail(res, msg);
      // capacity check
      db.get(`SELECT COUNT(1) c FROM enrollments WHERE campaign_id=? AND status='confirmed'`, [campaignId], (e2, row) => {
        if (e2) return fail(res, "DB error", 500);
        const hasCupo = row.c < camp.capacity;
        const status = hasCupo ? "confirmed" : "waitlist";
        db.run(`INSERT INTO enrollments(campaign_id, user_id, status) VALUES (?,?,?)`,
          [campaignId, userId, status],
          function (e3) {
            if (e3) return fail(res, "Ya inscripto o error", 400);
            db.run(`INSERT INTO notifications(user_id,title,body) VALUES (?,?,?)`,
              [userId, "Inscripción a campaña", `Te inscribiste a "${camp.name}" (${status}).`]);
            ok(res, { status });
          }
        );
      });
    });
  });
}

// Inscribir desde ruta RESTful original
enrollRouter.post("/:campaignId", authRequired, (req, res) => {
  enrollUserToCampaign(req.params.campaignId, req.user.id, res);
});

// Inscribir permitiendo body { campaign_id } (compatibilidad con UI)
enrollRouter.post("/", authRequired, (req, res) => {
  const { campaign_id } = req.body || {};
  if (!campaign_id) return fail(res, "Falta campaign_id", 400);
  enrollUserToCampaign(campaign_id, req.user.id, res);
});

enrollRouter.delete("/:campaignId", authRequired, (req, res) => {
  db.run(`DELETE FROM enrollments WHERE campaign_id=? AND user_id=?`, [req.params.campaignId, req.user.id], (err) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, { removed: true });
  });
});

enrollRouter.get("/my", authRequired, (req, res) => {
  db.all(`SELECT e.*, c.name, c.date, c.start_time, c.end_time, c.center_id, c.status as campaign_status
          FROM enrollments e JOIN campaigns c ON c.id=e.campaign_id
          WHERE e.user_id=?
          ORDER BY c.date DESC`, [req.user.id], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

export default enrollRouter;