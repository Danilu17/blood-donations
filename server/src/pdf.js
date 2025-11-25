// server/src/pdf.js
import PDFDocument from "pdfkit";
import fs from "fs";

export function generateCertificate({ donorName, date, centerName, bloodType, volume, orgName }) {
  const doc = new PDFDocument({ margin: 50 });
  doc.fontSize(20).text("Certificado de Donación", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Donante: ${donorName}`);
  doc.text(`Fecha: ${date}`);
  doc.text(`Centro: ${centerName}`);
  doc.text(`Tipo de sangre: ${bloodType}`);
  doc.text(`Cantidad extraída: ${volume} ml`);
  doc.moveDown().text(`Firma digital: ${orgName}`, { align: "right" });
  doc.end();
  return doc; // stream
}

export function generateSimpleTablePDF(title, rows, columns) {
  const doc = new PDFDocument({ margin: 40 });
  doc.fontSize(18).text(title, { align: "center" }).moveDown();
  doc.fontSize(10);
  doc.text(columns.join(" | "));
  doc.moveDown();
  rows.forEach(r => doc.text(r.join(" | ")));
  doc.end();
  return doc;
}
