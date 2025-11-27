// server/src/app.js  (FRAGMENTO: asegura montar rutas nuevas)
import organizerRouter from "./routes/organizer.js";
// ...
app.use("/api/organizer", organizerRouter);
