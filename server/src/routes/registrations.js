import { Router } from "express";
import { all, get, run } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();

router.get("/mine", requireAuth(["DONOR","ORG","ADMIN"]), async (req, res) => {
  const rows = await all(`
    SELECT r.*, c.title, c.start, c.end, c.address
    FROM registrations r JOIN campaigns c ON c.id = r.campaign_id
    WHERE r.user_id=? ORDER BY datetime(c.start) ASC`, [req.user.id]);
  res.json(rows);
});

router.post("/:campaignId", requireAuth(["DONOR"]), async (req, res) => {
  const cid = req.params.campaignId;
  const cap = await get(`SELECT capacity FROM campaigns WHERE id=?`, [cid]);
  if (!cap) return res.status(404).json({ error:"No existe" });
  const count = await get(`SELECT COUNT(*) as c FROM registrations WHERE campaign_id=? AND status IN ('PENDING','CONFIRMED')`,[cid]);
  const status = count.c >= cap.capacity ? "WAITLIST" : "CONFIRMED";
  const id = (await run(
    `INSERT INTO registrations(campaign_id,user_id,status) VALUES(?,?,?)`,
    [cid, req.user.id, status]
  )).lastID;
  res.json({ id, status });
});

router.put("/:id/confirm", requireAuth(["ORG","ADMIN"]), async (req, res) => {
  await run(`UPDATE registrations SET status='CONFIRMED' WHERE id=?`, [req.params.id]);
  res.json({ ok:true });
});
router.put("/:id/waitlist", requireAuth(["ORG","ADMIN"]), async (req, res) => {
  await run(`UPDATE registrations SET status='WAITLIST' WHERE id=?`, [req.params.id]);
  res.json({ ok:true });
});
router.delete("/:id", requireAuth(["DONOR","ORG","ADMIN"]), async (req, res) => {
  // Nota: donante sólo puede borrar si es suyo
  const r = await get(`SELECT * FROM registrations WHERE id=?`, [req.params.id]);
  if (!r) return res.status(404).json({ error:"No existe" });
  if (req.user.role === "DONOR" && r.user_id !== req.user.id) return res.status(403).json({ error:"Forbidden" });
  await run(`DELETE FROM registrations WHERE id=?`, [req.params.id]);
  res.json({ ok:true });
});

export default router;