import { Router } from "express";
import { all, get, run } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();

router.get("/stats", requireAuth(["ADMIN","ORG"]), async (req, res) => {
  const campaigns = await get(`SELECT COUNT(*) as c FROM campaigns WHERE status='ACTIVE'`);
  const donations = await get(`SELECT COUNT(*) as c FROM donations WHERE strftime('%Y-%m', date)=strftime('%Y-%m','now')`);
  const pending = await get(`SELECT COUNT(*) as c FROM role_requests WHERE status='PENDING'`);
  // serie mensual fake
  const months = Array.from({ length: 12 }, (_, i) => ({ month: i+1, activeDonors: 800 + i*50 }));
  res.json({ campaigns: campaigns.c, donations: donations.c, pending: pending.c, months });
});

router.get("/role-requests", requireAuth(["ADMIN"]), async (req, res) => {
  const rows = await all(`
    SELECT rr.*, u.name||' '||u.surname as requester FROM role_requests rr
    JOIN users u ON u.id = rr.user_id ORDER BY rr.created_at DESC`);
  res.json(rows);
});
router.post("/role-requests/:id/approve", requireAuth(["ADMIN"]), async (req, res) => {
  const rr = await get(`SELECT * FROM role_requests WHERE id=?`, [req.params.id]);
  if (!rr) return res.status(404).json({ error:"No existe" });
  await run(`UPDATE users SET role=? WHERE id=?`, [rr.target_role, rr.user_id]);
  await run(`UPDATE role_requests SET status='APPROVED' WHERE id=?`, [req.params.id]);
  res.json({ ok:true });
});
router.post("/role-requests/:id/reject", requireAuth(["ADMIN"]), async (req, res) => {
  await run(`UPDATE role_requests SET status='REJECTED' WHERE id=?`, [req.params.id]);
  res.json({ ok:true });
});

router.get("/campaigns", requireAuth(["ADMIN"]), async (req, res) => {
  const rows = await all(`
    SELECT c.*, ce.name as center_name FROM campaigns c
    LEFT JOIN centers ce ON ce.id = c.center_id ORDER BY datetime(c.start) DESC`);
  res.json(rows);
});

export default router;