import { Router } from "express";
import { all, get, run } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();

router.get("/", async (req, res) => {
  const rows = await all(`
    SELECT c.*, ce.name as center_name FROM campaigns c
    LEFT JOIN centers ce ON ce.id = c.center_id
    ORDER BY datetime(start) ASC`);
  // cupos calculados
  for (const r of rows) {
    const count = await get(`SELECT COUNT(*) as c FROM registrations WHERE campaign_id=? AND status IN ('PENDING','CONFIRMED')`,[r.id]);
    r.enrolled = count.c;
  }
  res.json(rows);
});

router.get("/:id", async (req, res) => {
  const c = await get(`SELECT * FROM campaigns WHERE id=?`, [req.params.id]);
  if (!c) return res.status(404).json({ error:"No existe" });
  const regs = await all(`SELECT * FROM registrations WHERE campaign_id=?`, [c.id]);
  res.json({ ...c, stats: { regs: regs.length } });
});

router.post("/", requireAuth(["ORG","ADMIN"]), async (req, res) => {
  const { title, center_id, address, start, end, capacity, requirements } = req.body;
  const id = (await run(
    `INSERT INTO campaigns(title,center_id,address,start,end,capacity,requirements,organizer_id)
     VALUES(?,?,?,?,?,?,?,?)`,
    [title,center_id,address,start,end,capacity,JSON.stringify(requirements||[]),req.user.id]
  )).lastID;
  res.json({ id });
});

router.put("/:id", requireAuth(["ORG","ADMIN"]), async (req, res) => {
  const { title, center_id, address, start, end, capacity, status, requirements } = req.body;
  await run(
    `UPDATE campaigns SET title=?,center_id=?,address=?,start=?,end=?,capacity=?,status=?,requirements=? WHERE id=?`,
    [title,center_id,address,start,end,capacity,status,JSON.stringify(requirements||[]),req.params.id]
  );
  res.json({ ok:true });
});

router.post("/:id/finalize", requireAuth(["ORG","ADMIN"]), async (req, res) => {
  await run(`UPDATE campaigns SET status='FINISHED' WHERE id=?`, [req.params.id]);
  res.json({ ok:true });
});

router.post("/:id/cancel", requireAuth(["ORG","ADMIN"]), async (req, res) => {
  await run(`UPDATE campaigns SET status='CANCELLED' WHERE id=?`, [req.params.id]);
  res.json({ ok:true });
});

export default router;