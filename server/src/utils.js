// server/src/utils.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";

const SALT_ROUNDS = 10;
export const TIERS = { bronze: 3, silver: 6, gold: 16 };

export function hashPassword(pwd) { return bcrypt.hashSync(pwd, SALT_ROUNDS); }
export function comparePassword(pwd, hash) { return bcrypt.compareSync(pwd, hash); }

export function signJWT(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "devsecret", { expiresIn: "8h" });
}

export function validatePasswordPolicy(pw) {
  return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && pw.length >= 8;
}

// 2 months rule
export function isTwoMonthsAgoOrMore(dateStr) {
  const d = dayjs(dateStr, "YYYY-MM-DD");
  return dayjs().diff(d, "month") >= 2;
}

export function calcEligibility({ weight, lastDonation, group, rh }) {
  if (weight < 50) return "No apto";
  if (!isTwoMonthsAgoOrMore(lastDonation)) return "No apto";
  if (!["A", "B", "AB", "O"].includes(group)) return "Requiere revision";
  if (!["Rh+", "Rh-"].includes(rh)) return "Requiere revision";
  return "Apto";
}

export function bloodCompatible(donor, recipient) {
  // donor, recipient like "O+" "A-"
  const [dg, drh] = [donor.slice(0, donor.length - 1), donor.slice(-1)];
  const [rg, rrh] = [recipient.slice(0, recipient.length - 1), recipient.slice(-1)];
  const rhOk = rrh === "-" ? drh === "-" : true;
  const map = {
    "O": ["O", "A", "B", "AB"],
    "A": ["A", "AB"],
    "B": ["B", "AB"],
    "AB": ["AB"]
  };
  return rhOk && map[dg].includes(rg);
}

export function toBloodType(group, rh) { return `${group}${rh === 'Rh+' ? '+' : '-'}`; }

export function ok(res, data) { return res.json({ ok: true, data }); }
export function fail(res, msg, code=400) { return res.status(code).json({ ok: false, error: msg }); }
