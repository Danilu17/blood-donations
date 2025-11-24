import { Router } from "express";
import { all, get, run } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();

router.get("/me", requireAuth(["DONOR","ORG","ADMIN"]), async (req, res) => {
  const me = await get(`SELECT id,name,surname,email,role,sex,birthdate,blood_group,rh_factor,phone,address FROM users WHERE id=?`, [req.user.id]);
  res.json(me);
});
router.put("/me", requireAuth(["DONOR","ORG","ADMIN"]), async (req, res) => {
  const { name,surname,phone,address } = req.body;
  await run(`UPDATE users SET name=?,surname=?,phone=?,address=? WHERE id=?`, [name,surname,phone,address,req.user.id]);
  res.json({ ok:true });
});
router.post("/request-role", requireAuth(["DONOR","ORG"]), async (req, res) => {
  const { target_role, reason } = req.body;
  const id = (await run(`INSERT INTO role_requests(user_id,target_role,reason) VALUES(?,?,?)`,
    [req.user.id, target_role, reason])).lastID;
  res.json({ id });
});

// Admin list users
router.get("/", requireAuth(["ADMIN"]), async (req, res) => {
  const rows = await all(`SELECT id,name,surname,dni,email,role,status FROM users ORDER BY id DESC`);
  res.json(rows);
});

export default router;