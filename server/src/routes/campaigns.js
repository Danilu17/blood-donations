// server/src/routes/campaigns.js
import express from "express";
import dayjs from "dayjs";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail } from "../utils.js";

export const campaignsRouter = express.Router();

function overlaps(aStart, aEnd, bStart, bEnd) {
  return !(aEnd <= bStart || bEnd <= aStart);
}

// List
campaignsRouter.get("/", authRequired, (req, res) => {
  const { date, center, group } = req.query;
  let q = `SELECT c.*, centers.name as center_name, centers.address as center_address FROM campaigns c JOIN centers ON centers.id=c.center_id WHERE c.status='active'`;
  const params = [];
  if (date) { q += ` AND c.date=?`; params.push(date); }
  if (center) { q += ` AND c.center_id=?`; params.push(center); }
  // group filter inside requirements JSON string
  db.all(q + ` ORDER BY c.date ASC, c.start_time ASC`, params, (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

// Create
campaignsRouter.post("/", authRequired, requireRole("Organizer"), (req, res) => {
  const { name, center_id, date, start_time, end_time, requirements = {}, capacity = 40 } = req.body;
  if (!name || !center_id || !date || !start_time || !end_time) return fail(res, "Campos requeridos");
  // validate overlapping in same center
  db.all(`SELECT * FROM campaigns WHERE center_id=? AND date=? AND status='active'`, [center_id, date], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    const conflict = rows.some(r => overlaps(r.start_time, r.end_time, start_time, end_time));
    if (conflict) return fail(res, "Se superpone con otra campaña en el mismo centro", 409);
    db.run(
      `INSERT INTO campaigns(name, center_id, date, start_time, end_time, requirements, capacity, organizer_id)
       VALUES (?,?,?,?,?,?,?,?)`,
      [name, center_id, date, start_time, end_time, JSON.stringify(requirements), capacity, req.user.id],
      function (e2) {
        if (e2) return fail(res, "DB error", 500);
        ok(res, { id: this.lastID });
      }
    );
  });
});

// Detail
campaignsRouter.get("/:id", authRequired, (req, res) => {
  db.get(`SELECT c.*, centers.name as center_name, centers.address as center_address FROM campaigns c JOIN centers ON centers.id=c.center_id WHERE c.id=?`, [req.params.id], (err, row) => {
    if (err) return fail(res, "DB error", 500);
    if (!row) return fail(res, "No encontrada", 404);
    ok(res, row);
  });
});

// Update with versioning
campaignsRouter.put("/:id", authRequired, requireRole("Organizer"), (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM campaigns WHERE id=?`, [id], (err, old) => {
    if (err || !old) return fail(res, "No encontrada", 404);
    const versionData = JSON.stringify(old);
    db.get(`SELECT COALESCE(MAX(version),0)+1 v FROM campaign_versions WHERE campaign_id=?`, [id], (e2, vrow) => {
      if (e2) return fail(res, "DB error", 500);
      db.run(`INSERT INTO campaign_versions(campaign_id, version, data) VALUES (?,?,?)`, [id, vrow.v, versionData]);
      const { name=old.name, center_id=old.center_id, date=old.date, start_time=old.start_time, end_time=old.end_time, requirements=old.requirements, capacity=old.capacity, status=old.status } = req.body;
      db.run(`UPDATE campaigns SET name=?, center_id=?, date=?, start_time=?, end_time=?, requirements=?, capacity=?, status=? WHERE id=?`,
        [name, center_id, date, start_time, end_time, typeof requirements === 'string' ? requirements : JSON.stringify(requirements), capacity, status, id],
        (e3) => {
          if (e3) return fail(res, "DB error", 500);
          ok(res, { updated: true });
        }
      );
    });
  });
});

// Delete -> mark cancelled
campaignsRouter.delete("/:id", authRequired, requireRole("Organizer"), (req, res) => {
  db.run(`UPDATE campaigns SET status='cancelled' WHERE id=?`, [req.params.id], (err) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, { status: "cancelled" });
  });
});

export default campaignsRouter;
