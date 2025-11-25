// server/src/routes/reports.js
import express from "express";
import ExcelJS from "exceljs";
import { db } from "../db.js";
import { authRequired, requireRole } from "../middlewares.js";
import { ok, fail } from "../utils.js";
import { generateSimpleTablePDF } from "../pdf.js";

export const reportsRouter = express.Router();

reportsRouter.get("/inscriptions/:campaignId.pdf", authRequired, requireRole("Organizer"), (req, res) => {
  const id = req.params.campaignId;
  db.all(`SELECT u.name||' '||u.surname as name, u.dni, hf.blood_group||CASE hf.rh_factor WHEN 'Rh+' THEN '+' ELSE '-' END as blood, u.phone
          FROM enrollments e JOIN users u ON u.id=e.user_id
          LEFT JOIN health_forms hf ON hf.user_id=u.id
          WHERE e.campaign_id=?
          GROUP BY u.id`, [id], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=inscriptos-${id}.pdf`);
    const pdf = generateSimpleTablePDF("Inscriptos", rows.map(r => [r.name, r.dni, r.blood || '-', r.phone]), ["Nombre","DNI","Grupo","Contacto"]);
    pdf.pipe(res);
  });
});

reportsRouter.get("/inscriptions/:campaignId.xlsx", authRequired, requireRole("Organizer"), (req, res) => {
  const id = req.params.campaignId;
  db.all(`SELECT u.name||' '||u.surname as Nombre, u.dni as DNI, hf.blood_group||CASE hf.rh_factor WHEN 'Rh+' THEN '+' ELSE '-' END as Grupo, u.phone as Contacto
          FROM enrollments e JOIN users u ON u.id=e.user_id
          LEFT JOIN health_forms hf ON hf.user_id=u.id
          WHERE e.campaign_id=?
          GROUP BY u.id`, [id], async (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Inscriptos");
    ws.columns = Object.keys(rows[0] || {Nombre:"",DNI:"",Grupo:"",Contacto:""}).map(k => ({ header: k, key: k }));
    rows.forEach(r => ws.addRow(r));
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=inscriptos-${id}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  });
});

reportsRouter.get("/summary.pdf", authRequired, requireRole("Admin"), (req, res) => {
  db.all(`SELECT strftime('%m', date) as mes, COUNT(1) as donaciones FROM donations GROUP BY mes ORDER BY mes`, [], (err, rows) => {
    if (err) return fail(res, "DB error", 500);
    const pdf = generateSimpleTablePDF("Donaciones por mes", rows.map(r=>[r.mes, String(r.donaciones)]), ["Mes","Donaciones"]);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=reporte-donaciones.pdf`);
    pdf.pipe(res);
  });
});

export default reportsRouter;
