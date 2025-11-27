// server/src/routes/campaigns.js  (REEMPLAZA COMPLETO – asegura guardado de place/blood_group/rh_factor)
import express from "express";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail } from "../utils.js";

export const campaignsRouter = express.Router();

function overlaps(aStart, aEnd, bStart, bEnd) {
  return !(aEnd <= bStart || bEnd <= aStart);
}

// LIST
campaignsRouter.get("/", authRequired, (req, res) => {
  const { date, center } = req.query;
  let q = `
    SELECT c.*, 
           centers.name  AS center_name,
           centers.address AS center_address
    FROM campaigns c
    JOIN centers ON centers.id = c.center_id
    WHERE c.status = 'active'
  `;
  const params = [];
  if (date)  { q += ` AND c.date = ?`;      params.push(date); }
  if (center){ q += ` AND c.center_id = ?`; params.push(center); }
  q += ` ORDER BY c.date ASC, c.start_time ASC`;
  db.all(q, params, (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

// History (Admin: incluye todas las campañas y su cantidad de inscriptos)
campaignsRouter.get("/history", authRequired, requireRole("Admin"), (req, res) => {
  db.all(
    `SELECT c.*, centers.name AS center_name, centers.address AS center_address,
            (SELECT COUNT(1) FROM enrollments e WHERE e.campaign_id = c.id) AS enrollment_count
       FROM campaigns c
       JOIN centers ON centers.id = c.center_id
       ORDER BY c.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return fail(res, "DB error", 500);
      ok(res, rows);
    }
  );
});

// CREATE
campaignsRouter.post("/", authRequired, requireRole("Organizer"), (req, res) => {
  const {
    name, place, center_id = 1,
    date, start_time, end_time,
    blood_group, rh_factor,
    capacity = 40, notes = ""
  } = req.body;

  if (!name || !place || !center_id || !date || !start_time || !end_time || !blood_group || !rh_factor) {
    return fail(res, "Campos requeridos: name, place, center_id, date, start_time, end_time, blood_group, rh_factor, capacity");
  }

  db.all(
    `SELECT start_time, end_time FROM campaigns
     WHERE center_id = ? AND date = ? AND status <> 'cancelled'`,
    [center_id, date],
    (err, rows) => {
      if (err) return fail(res, "DB error", 500);
      const conflict = rows.some(r => overlaps(r.start_time, r.end_time, start_time, end_time));
      if (conflict) return fail(res, "Se superpone con otra campaña en el mismo centro", 409);

      db.run(
        `INSERT INTO campaigns
         (name, place, center_id, date, start_time, end_time, blood_group, rh_factor, notes, capacity, organizer_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [name, place, center_id, date, start_time, end_time, blood_group, rh_factor, notes, capacity, req.user.id],
        function (e2) {
          if (e2) return fail(res, "DB error", 500);
          ok(res, { id: this.lastID });
        }
      );
    }
  );
});

// DETAIL
campaignsRouter.get("/:id/enrollments", authRequired, requireRole("Admin"), (req, res) => {
  db.all(
    `SELECT u.id, u.name, u.surname, u.email, u.phone, e.status, e.created_at
       FROM enrollments e JOIN users u ON u.id = e.user_id
      WHERE e.campaign_id = ?
      ORDER BY e.created_at DESC`,
    [req.params.id],
    (err, rows) => (err ? fail(res, "DB error", 500) : ok(res, rows))
  );
});

campaignsRouter.get("/:id", authRequired, (req, res) => {
  db.get(
    `SELECT c.*, centers.name AS center_name, centers.address AS center_address
     FROM campaigns c JOIN centers ON centers.id=c.center_id
     WHERE c.id=?`,
    [req.params.id],
    (err, row) => {
      if (err) return fail(res, "DB error", 500);
      if (!row) return fail(res, "No encontrada", 404);
      ok(res, row);
    }
  );
});

// UPDATE
campaignsRouter.put("/:id", authRequired, requireRole("Organizer"), (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM campaigns WHERE id=?`, [id], (err, old) => {
    if (err || !old) return fail(res, "No encontrada", 404);

    const snapshot = JSON.stringify(old);
    db.get(`SELECT COALESCE(MAX(version),0)+1 v FROM campaign_versions WHERE campaign_id=?`, [id], (e2, vrow) => {
      if (e2) return fail(res, "DB error", 500);
      db.run(`INSERT INTO campaign_versions(campaign_id, version, data) VALUES (?,?,?)`, [id, vrow.v, snapshot]);

      const {
        name        = old.name,
        place       = old.place,
        center_id   = old.center_id,      // seguimos permitiendo cambiar centro aunque no esté en el form
        date        = old.date,
        start_time  = old.start_time,
        end_time    = old.end_time,
        blood_group = old.blood_group,
        rh_factor   = old.rh_factor,
        notes       = old.notes,
        capacity    = old.capacity,
        status      = old.status
      } = req.body;

      db.all(
        `SELECT id, start_time, end_time FROM campaigns
         WHERE id <> ? AND center_id = ? AND date = ? AND status <> 'cancelled'`,
        [id, center_id, date],
        (e3, rows) => {
          if (e3) return fail(res, "DB error", 500);
          const conflict = rows.some(r => overlaps(r.start_time, r.end_time, start_time, end_time));
          if (conflict) return fail(res, "Se superpone con otra campaña en el mismo centro", 409);

          db.run(
            `UPDATE campaigns
             SET name=?, place=?, center_id=?, date=?, start_time=?, end_time=?,
                 blood_group=?, rh_factor=?, notes=?, capacity=?, status=?
             WHERE id=?`,
            [name, place, center_id, date, start_time, end_time, blood_group, rh_factor, notes, capacity, status, id],
            (e4) => {
              if (e4) return fail(res, "DB error", 500);
              ok(res, { updated: true });
            }
          );
        }
      );
    });
  });
});

// SOFT-DELETE (cancel)
campaignsRouter.delete("/:id", authRequired, requireRole("Organizer"), (req, res) => {
  db.run(`UPDATE campaigns SET status='cancelled' WHERE id=?`, [req.params.id], (err) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, { status: "cancelled" });
  });
});

export default campaignsRouter;
