// server/src/routes/health.js
import express from "express";
import dayjs from "dayjs";
import { db } from "../db.js";
import { authRequired } from "../middlewares.js";
import { calcEligibility, ok, fail } from "../utils.js";

export const healthRouter = express.Router();

healthRouter.post("/", authRequired, (req, res) => {
  const userId = req.user.id;
  const { weight, diseases = [], medications = "", last_donation_date, blood_group, rh_factor } = req.body;
  const elig = calcEligibility({
    weight: Number(weight),
    lastDonation: last_donation_date,
    group: blood_group,
    rh: rh_factor
  });
  if (elig === "No apto") return fail(res, "No apto según validaciones médicas");
  db.run(
    `INSERT INTO health_forms(user_id, weight, diseases, medications, last_donation_date, blood_group, rh_factor, status)
     VALUES (?,?,?,?,?,?,?,?)`,
    [userId, weight, Array.isArray(diseases) ? diseases.join(",") : diseases, medications, last_donation_date, blood_group, rh_factor, elig],
    function (err) {
      if (err) return fail(res, "DB error", 500);
      ok(res, { id: this.lastID, status: elig });
    }
  );
});

healthRouter.get("/history", authRequired, (req, res) => {
  db.all(`SELECT * FROM health_forms WHERE user_id=? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

export default healthRouter;
