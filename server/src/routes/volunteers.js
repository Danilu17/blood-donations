import { Router } from "express";
import { all, run } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();

router.get("/mine", requireAuth(["DONOR"]), async (req, res) => {
  const rows = await all(`SELECT * FROM volunteer_slots WHERE user_id=?`, [req.user.id]);
  res.json(rows);
});
router.post("/", requireAuth(["DONOR"]), async (req, res) => {
  const { days, time_from, time_to, task, note } = req.body;
  const id = (await run(
    `INSERT INTO volunteer_slots(user_id,days,time_from,time_to,task,note) VALUES(?,?,?,?,?,?)`,
    [req.user.id, days, time_from, time_to, task, note]
  )).lastID;
  res.json({ id });
});
router.delete("/:id", requireAuth(["DONOR"]), async (req, res) => {
  await run(`DELETE FROM volunteer_slots WHERE id=? AND user_id=?`, [req.params.id, req.user.id]);
  res.json({ ok:true });
});

// Listado para organizador
router.get("/all", requireAuth(["ORG","ADMIN"]), async (req, res) => {
  const rows = await all(`
    SELECT v.*, u.name || ' ' || u.surname as full_name FROM volunteer_slots v
    JOIN users u ON u.id = v.user_id ORDER BY u.name`);
  res.json(rows);
});

export default router;