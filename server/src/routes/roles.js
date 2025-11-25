// server/src/routes/roles.js
import express from "express";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail } from "../utils.js";

export const rolesRouter = express.Router();

rolesRouter.post("/request", authRequired, (req, res) => {
  const { requested_role, justification="" } = req.body;
  db.run(`INSERT INTO role_change_requests(user_id, requested_role, justification) VALUES (?,?,?)`, [req.user.id, requested_role, justification], function(err){
    if (err) return fail(res, "DB error", 500);
    ok(res, { id: this.lastID });
  });
});

rolesRouter.get("/requests", authRequired, requireRole("Admin"), (req, res) => {
  db.all(`SELECT rcr.*, u.name||' '||u.surname as user_name FROM role_change_requests rcr JOIN users u ON u.id=rcr.user_id WHERE status='Pending' ORDER BY created_at ASC`, [], (err, rows)=>{
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

rolesRouter.post("/requests/:id/approve", authRequired, requireRole("Admin"), (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM role_change_requests WHERE id=?`, [id], (err, row) => {
    if (err || !row) return fail(res, "No encontrado", 404);
    db.serialize(()=>{
      db.run(`UPDATE role_change_requests SET status='Approved', decided_at=strftime('%s','now'), decision_reason=? WHERE id=?`, [req.body.reason || '', id]);
      db.get(`SELECT id FROM roles WHERE name=?`, [row.requested_role], (e2, r) => {
        if (e2 || !r) return fail(res, "Rol inválido", 400);
        db.run(`INSERT OR IGNORE INTO user_roles(user_id, role_id) VALUES (?,?)`, [row.user_id, r.id]);
        ok(res, { approved: true });
      });
    });
  });
});

rolesRouter.post("/requests/:id/reject", authRequired, requireRole("Admin"), (req, res) => {
  db.run(`UPDATE role_change_requests SET status='Rejected', decided_at=strftime('%s','now'), decision_reason=? WHERE id=?`, [req.body.reason || '', req.params.id], (err)=>{
    if (err) return fail(res, "DB error", 500);
    ok(res, { rejected: true });
  });
});

export default rolesRouter;
