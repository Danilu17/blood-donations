// server/src/routes/centers.js
import express from "express";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail } from "../utils.js";

export const centersRouter = express.Router();

centersRouter.get("/", authRequired, (req, res) => {
  db.all(`SELECT * FROM centers ORDER BY name`, [], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    ok(res, rows);
  });
});

centersRouter.post("/", authRequired, requireRole("Admin"), (req, res) => {
  const { name, address, hours, lat, lng, capacity } = req.body;
  if (!name || !address || !hours) return fail(res, "Campos requeridos");
  db.run(`INSERT INTO centers(name,address,hours,lat,lng,capacity) VALUES (?,?,?,?,?,?)`, [name, address, hours, lat, lng, capacity||50], function(err){
    if (err) return fail(res, "DB error", 500);
    ok(res, { id: this.lastID });
  });
});

centersRouter.put("/:id", authRequired, requireRole("Admin"), (req, res) => {
  const { name, address, hours, lat, lng, capacity } = req.body;
  db.run(`UPDATE centers SET name=?, address=?, hours=?, lat=?, lng=?, capacity=? WHERE id=?`, [name, address, hours, lat, lng, capacity, req.params.id], (err)=>{
    if (err) return fail(res, "DB error", 500);
    ok(res, { updated: true });
  });
});

export default centersRouter;
