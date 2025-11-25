import { Router } from "express";
import bcrypt from "bcryptjs";
import { get, run } from "../db.js";
import { authenticate } from "../auth.js";
const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const auth = await authenticate(email, password);
  if (!auth) return res.status(401).json({ error: "Credenciales inválidas" });
  res.json(auth);
});

router.post("/register", async (req, res) => {
  const {
    name, surname, dni, sex, birthdate, email, phone, address,
    blood_group, rh_factor, password
  } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan campos" });
  const hash = await bcrypt.hash(password, 10);
  try {
    const userId = (await run(
      `INSERT INTO users(name,surname,dni,sex,birthdate,email,phone,address,blood_group,rh_factor,password_hash,role)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name,surname,dni,sex,birthdate,email,phone,address,blood_group,rh_factor,hash,"DONOR"]
    )).lastID;
    res.json({ ok: true, id: userId });
  } catch (e) {
    res.status(400).json({ error: "Email ya registrado" });
  }
});

export default router;