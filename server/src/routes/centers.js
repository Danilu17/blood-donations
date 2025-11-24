import { Router } from "express";
import { all, get, run } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();

router.get("/", requireAuth(["ORG","ADMIN","DONOR"]), async (req, res) => {
  const rows = await all(`SELECT * FROM centers ORDER BY name`);
  res.json(rows);
});
router.post("/", requireAuth(["ADMIN"]), async (req, res) => {
  const { name, address, hours } = req.body;
  const id = (await run(`INSERT INTO centers(name,address,hours) VALUES(?,?,?)`, [name,address,hours])).lastID;
  res.json({ id });
});
router.put("/:id", requireAuth(["ADMIN"]), async (req, res) => {
  const { name, address, hours } = req.body;
  await run(`UPDATE centers SET name=?,address=?,hours=? WHERE id=?`, [name,address,hours,req.params.id]);
  res.json({ ok:true });
});

export default router;