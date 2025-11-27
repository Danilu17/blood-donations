// server/src/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initDb } from "./db.js";

import authRouter from "./auth.js";
import healthRouter from "./routes/health.js";
import campaignsRouter from "./routes/campaigns.js";
import enrollRouter from "./routes/enrollments.js";
import donationsRouter from "./routes/donations.js";
import notifRouter from "./routes/notifications.js";
import centersRouter from "./routes/centers.js";
import rolesRouter from "./routes/roles.js";
import volunteersRouter from "./routes/volunteers.js";
import beneficiaryRouter from "./routes/beneficiaries.js";
import reportsRouter from "./routes/reports.js";

initDb();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));

app.get("/", (_, res) => res.send("OK"));

// Prefix API (todas las rutas aquí)
app.use("/api/auth", authRouter);
app.use("/api/health", healthRouter);
app.use("/api/campaigns", campaignsRouter);
app.use("/api/enroll", enrollRouter);
// …y agrego el alias que está usando el front:
app.use("/api/enrollments", enrollRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/notifications", notifRouter);   // <<<<<< AQUI ESTA MONTADA
app.use("/api/centers", centersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/volunteer", volunteersRouter);
app.use("/api/beneficiary", beneficiaryRouter);
app.use("/api/reports", reportsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API on http://localhost:${PORT}`));
