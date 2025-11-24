import { Router } from "express";
import { all } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();

router.get("/mine", requireAuth(["DONOR"]), async (req, res) => {
  const rows = await all(`
    SELECT d.*, c.name as center_name FROM donations d
    LEFT JOIN centers c ON c.id = d.center_id
    WHERE d.user_id=? ORDER BY datetime(d.date) DESC`, [req.user.id]);
  res.json(rows);
});

export default router;