// server/src/routes/reports.js  (REEMPLAZA COMPLETO)
import express from "express";
import ExcelJS from "exceljs";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail } from "../utils.js"; // <-- necesario
import { generateSimpleTablePDF } from "../pdf.js";

export const reportsRouter = express.Router();

const qAll = (s, p = []) =>
  new Promise((res, rej) => db.all(s, p, (e, r) => (e ? rej(e) : res(r))));

// Healthcheck del router (debug de montaje)
reportsRouter.get("/ping", (_req, res) => ok(res, { pong: true }));

// Listado completo de campañas + donantes (Admin)
reportsRouter.get(
  "/campaigns",
  authRequired,
  requireRole("Admin"),
  async (_req, res) => {
    try {
      const campaigns = await qAll(
        `SELECT c.*, centers.name AS center_name, centers.address AS center_address
           FROM campaigns c
           JOIN centers ON centers.id = c.center_id
          ORDER BY c.date DESC, c.start_time DESC`
      );

      const enrollments = await qAll(
        `SELECT e.campaign_id, e.status AS enrollment_status,
                u.name, u.surname, u.email, u.phone
           FROM enrollments e
           JOIN users u ON u.id = e.user_id
          ORDER BY e.created_at DESC`
      );

      const grouped = campaigns.map((c) => ({
        ...c,
        enrollment_count: enrollments.filter((e) => e.campaign_id === c.id).length,
        enrollments: enrollments
          .filter((e) => e.campaign_id === c.id)
          .map((e) => ({
            name: `${e.name} ${e.surname}`.trim(),
            email: e.email,
            phone: e.phone,
            status: e.enrollment_status,
          })),
      }));

      ok(res, grouped);
    } catch (err) {
      console.error(err);
      fail(res, "DB error", 500);
    }
  }
);

// Descarga PDF de inscriptos (Organizer)
reportsRouter.get(
  "/inscriptions/:campaignId.pdf",
  authRequired,
  requireRole("Organizer"),
  async (req, res) => {
    try {
      const id = req.params.campaignId;
      const rows = await qAll(
        `SELECT u.name||' '||u.surname as name, u.dni,
                COALESCE(hf.blood_group||CASE hf.rh_factor WHEN 'Rh-' THEN '-' ELSE '+' END,'') as blood,
                u.phone
         FROM enrollments e JOIN users u ON u.id=e.user_id
         LEFT JOIN (
           SELECT h1.* FROM health_forms h1
           JOIN (SELECT user_id, MAX(created_at) mx FROM health_forms GROUP BY user_id) s
           ON s.user_id=h1.user_id AND s.mx=h1.created_at
         ) hf ON hf.user_id=u.id
         WHERE e.campaign_id=?
         GROUP BY u.id`,
        [id]
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=inscriptos-${id}.pdf`
      );
      const pdf = generateSimpleTablePDF(
        "Inscriptos",
        rows.map((r) => [r.name, r.dni, r.blood || "-", r.phone]),
        ["Nombre", "DNI", "Grupo", "Contacto"]
      );
      pdf.pipe(res);
    } catch {
      fail(res, "DB error", 500);
    }
  }
);

// Descarga XLSX de inscriptos (Organizer)
reportsRouter.get(
  "/inscriptions/:campaignId.xlsx",
  authRequired,
  requireRole("Organizer"),
  async (req, res) => {
    try {
      const id = req.params.campaignId;
      const rows = await qAll(
        `SELECT u.name||' '||u.surname as Nombre, u.dni as DNI,
                COALESCE(hf.blood_group||CASE hf.rh_factor WHEN 'Rh-' THEN '-' ELSE '+' END,'') as Grupo,
                u.phone as Contacto
         FROM enrollments e JOIN users u ON u.id=e.user_id
         LEFT JOIN (
           SELECT h1.* FROM health_forms h1
           JOIN (SELECT user_id, MAX(created_at) mx FROM health_forms GROUP BY user_id) s
           ON s.user_id=h1.user_id AND s.mx=h1.created_at
         ) hf ON hf.user_id=u.id
         WHERE e.campaign_id=?
         GROUP BY u.id`,
        [id]
      );
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Inscriptos");
      ws.columns = Object.keys(
        rows[0] || { Nombre: "", DNI: "", Grupo: "", Contacto: "" }
      ).map((k) => ({ header: k, key: k }));
      rows.forEach((r) => ws.addRow(r));
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=inscriptos-${id}.xlsx`
      );
      await wb.xlsx.write(res);
      res.end();
    } catch {
      fail(res, "DB error", 500);
    }
  }
);

export default reportsRouter;
