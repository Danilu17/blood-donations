// server/src/routes/beneficiaries.js
import express from "express";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail, bloodCompatible } from "../utils.js";

export const beneficiaryRouter = express.Router();

beneficiaryRouter.post("/requests", authRequired, requireRole("Beneficiary"), (req, res) => {
  const { blood_group, rh_factor, units, center_id, urgency, estimated_date } = req.body;
  if (!blood_group || !rh_factor || !units || !center_id || !urgency || !estimated_date) return fail(res, "Campos requeridos");
  db.run(`INSERT INTO beneficiary_requests(user_id,blood_group,rh_factor,units,center_id,urgency,estimated_date) VALUES (?,?,?,?,?,?,?)`,
    [req.user.id, blood_group, rh_factor, units, center_id, urgency, estimated_date], function(err){
      if (err) return fail(res, "DB error", 500);
      ok(res, { id: this.lastID });
    });
});

beneficiaryRouter.get("/requests/mine", authRequired, requireRole("Beneficiary"), (req, res) => {
  db.all(`SELECT * FROM beneficiary_requests WHERE user_id=? ORDER BY created_at DESC`, [req.user.id], (err, rows)=>{
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

// Link candidates donors for a request (Organizer)
beneficiaryRouter.post("/assign", authRequired, requireRole("Organizer"), (req, res) => {
  const { request_id, donor_ids=[] } = req.body;
  db.get(`SELECT * FROM beneficiary_requests WHERE id=?`, [request_id], (err, br) => {
    if (err || !br) return fail(res, "Solicitud inválida", 400);
    const recipient = `${br.blood_group}${br.rh_factor==='Rh+'?'+':'-'}`;
    donor_ids.forEach(uid => {
      // check donor's latest blood type
      db.get(`SELECT blood_group,rh_factor FROM health_forms WHERE user_id=? ORDER BY created_at DESC LIMIT 1`, [uid], (e2, hf)=>{
        if (!hf) return;
        const donor = `${hf.blood_group}${hf.rh_factor==='Rh+'?'+':'-'}`;
        if (bloodCompatible(donor, recipient)) {
          db.run(`INSERT INTO notifications(user_id,title,body) VALUES (?,?,?)`,
            [uid, "Alerta de compatibilidad", `Se te requiere para una solicitud compatible (urgencia ${br.urgency}).`]);
        }
      });
    });
    db.run(`UPDATE beneficiary_requests SET status='in_campaign' WHERE id=?`, [request_id]);
    ok(res, { notified: donor_ids.length });
  });
});

// Beneficiary -> propose campaign
beneficiaryRouter.post("/proposals", authRequired, requireRole("Beneficiary"), (req, res) => {
  const { center_id, date, start_time, end_time, note } = req.body;
  db.run(`INSERT INTO campaign_proposals(beneficiary_id,center_id,date,start_time,end_time,note) VALUES (?,?,?,?,?,?)`,
    [req.user.id, center_id, date, start_time, end_time, note || ""], function(err){
      if (err) return fail(res, "DB error", 500);
      ok(res, { id: this.lastID });
    });
});

// Organizer validates proposal (approve|reject|publish)
beneficiaryRouter.put("/proposals/:id", authRequired, requireRole("Organizer"), (req, res) => {
  const { action } = req.body; // approve|reject|publish
  const id = req.params.id;
  db.get(`SELECT * FROM campaign_proposals WHERE id=?`, [id], (err, row) => {
    if (err || !row) return fail(res, "No encontrada", 404);
    if (action === "reject") {
      db.run(`UPDATE campaign_proposals SET status='rejected' WHERE id=?`, [id], ()=>ok(res,{rejected:true}));
    } else if (action === "approve") {
      db.run(`UPDATE campaign_proposals SET status='approved' WHERE id=?`, [id], ()=>ok(res,{approved:true}));
    } else if (action === "publish") {
      // publish as campaign
      db.run(
        `INSERT INTO campaigns(name, center_id, date, start_time, end_time, requirements, capacity, status, organizer_id)
         VALUES (?,?,?,?,?,?,?, 'active', ?)`,
        [`Campaña asociada a solicitud`, row.center_id, row.date, row.start_time, row.end_time, "{}", 40, req.user.id],
        function(e2){
          if (e2) return fail(res, "DB error", 500);
          db.run(`UPDATE campaign_proposals SET status='published', linked_campaign_id=? WHERE id=?`, [this.lastID, id], ()=>ok(res,{published:true, campaign_id:this.lastID}));
        }
      );
    } else return fail(res,"Acción inválida");
  });
});

export default beneficiaryRouter;
