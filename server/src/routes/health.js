import { Router } from "express";
import { all, run } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();

// Validaciones claves: peso >= 50; última donación >= 2/3 meses según sexo
router.post("/", requireAuth(["DONOR"]), async (req, res) => {
  const { weight, chronic = [], meds = "", last_donation, blood_group, rh_factor, sex } = req.body;
  const issues = [];
  if (weight < 50) issues.push("Peso menor a 50 kg");
  if (last_donation) {
    const months = (sex || "M") === "M" ? 2 : 3;
    const ms = 30 * 24 * 60 * 60 * 1000 * months;
    if (Date.now() - new Date(last_donation).getTime() < ms) {
      issues.push(`Última donación menor a ${months} meses`);
    }
  }
  const state = issues.length ? "OBSERVED" : "APPROVED";
  const id = (await run(
    `INSERT INTO health_forms(user_id,weight,chronic,meds,last_donation,blood_group,rh_factor,state)
     VALUES(?,?,?,?,?,?,?,?)`,
    [req.user.id, weight, JSON.stringify(chronic), meds, last_donation, blood_group, rh_factor, state]
  )).lastID;
  res.json({ id, state, issues });
});

router.get("/history", requireAuth(["DONOR"]), async (req, res) => {
  const rows = await all(`SELECT * FROM health_forms WHERE user_id=? ORDER BY created_at DESC`, [req.user.id]);
  res.json(rows);
});

export default router;