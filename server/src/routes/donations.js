// server/src/routes/donations.js
import express from "express";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail, toBloodType } from "../utils.js";
import { generateCertificate, generateSimpleTablePDF } from "../pdf.js";

export const donationsRouter = express.Router();

donationsRouter.get("/history", authRequired, (req, res) => {
  db.all(`SELECT d.*, c.name as campaign_name, centers.name as center_name FROM donations d JOIN campaigns c ON c.id=d.campaign_id JOIN centers ON centers.id=d.center_id WHERE d.user_id=? ORDER BY d.date DESC`, [req.user.id], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

// Organizer marks successful donations (demo endpoint)
donationsRouter.post("/record", authRequired, requireRole("Organizer"), (req, res) => {
  const { user_id, campaign_id, volume_ml=450, notes="" } = req.body;
  db.get(`SELECT * FROM campaigns WHERE id=?`, [campaign_id], (err, c) => {
    if (err || !c) return fail(res, "Campaña inválida", 400);
    db.get(`SELECT * FROM centers WHERE id=?`, [c.center_id], (e2, center) => {
      if (e2 || !center) return fail(res, "Centro inválido", 400);
      db.get(`SELECT * FROM health_forms WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, [user_id], (e3, hf) => {
        if (e3 || !hf) return fail(res, "Sin datos de salud", 400);
        const bloodType = toBloodType(hf.blood_group, hf.rh_factor);
        db.run(`INSERT INTO donations(user_id,campaign_id,date,center_id,blood_type,volume_ml,notes,status) VALUES (?,?,?,?,?,?,?,?)`,
          [user_id, campaign_id, c.date, c.center_id, bloodType, volume_ml, notes, 'successful'], function (e4) {
            if (e4) return fail(res, "DB error", 500);
            db.run(`INSERT INTO notifications(user_id,title,body) VALUES (?,?,?)`,
              [user_id, "Gracias por donar ❤️", `Se registró tu donación en "${c.name}".`]);
            ok(res, { id: this.lastID });
          });
      });
    });
  });
});

donationsRouter.get("/:id/certificate.pdf", authRequired, (req, res) => {
  const id = req.params.id;
  db.get(`SELECT d.*, u.name||' '||u.surname as donor_name, centers.name as center_name FROM donations d JOIN users u ON u.id=d.user_id JOIN centers ON centers.id=d.center_id WHERE d.id=?`, [id], (err, row) => {
    if (err || !row) return fail(res, "No encontrado", 404);
    if (row.user_id !== req.user.id) return fail(res, "Prohibido", 403);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=certificado-${row.id}.pdf`);
    const stream = generateCertificate({
      donorName: row.donor_name,
      date: row.date,
      centerName: row.center_name,
      bloodType: row.blood_type,
      volume: row.volume_ml,
      orgName: "Organismo Responsable"
    });
    stream.pipe(res);
  });
});

donationsRouter.get("/history.pdf", authRequired, (req, res) => {
  db.all(`SELECT date, blood_type, volume_ml FROM donations WHERE user_id=? ORDER BY date DESC`, [req.user.id], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=historial-donaciones.pdf`);
    const pdf = generateSimpleTablePDF("Historial de donaciones", rows.map(r => [r.date, r.blood_type, String(r.volume_ml)]), ["Fecha","Tipo","Volumen"]);
    pdf.pipe(res);
  });
});

export default donationsRouter;
