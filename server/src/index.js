import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initDb, db, seedIfEmpty } from "./lib/db.js";
import authRouter from "./routes/auth.js";
import campaignsRouter from "./routes/campaigns.js";
import registrationsRouter from "./routes/registrations.js";
import healthRouter from "./routes/health.js";
import donationsRouter from "./routes/donations.js";
import volunteersRouter from "./routes/volunteers.js";
import usersRouter from "./routes/users.js";
import centersRouter from "./routes/centers.js";
import adminRouter from "./routes/admin.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

await initDb();
await seedIfEmpty();

app.use("/api/auth", authRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/registrations", registrationsRouter);
app.use("/api/health", healthRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/volunteers", volunteersRouter);
app.use("/api/users", usersRouter);
app.use("/api/centers", centersRouter);
app.use("/api/admin", adminRouter);

// Certificados fake (PDF estático)
app.get("/api/certificates/:id", (req, res) => {
  res.setHeader("Content-Type", "application/pdf");
  res.send("%PDF-1.4\n% demo certificado\n"); // minimal stub
});

// Servir frontend build si existe
app.use(express.static(path.join(__dirname, "../../client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

const port = process.env.PORT || 4000;
if (process.argv[2] === "seed-only") process.exit(0);
app.listen(port, () => console.log(`API on http://localhost:${port}`));