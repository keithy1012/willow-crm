import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patientRoutes.js"
import doctorRoutes from "./routes/doctorRoutes.js"
import doctorTicketRoutes from "./routes/doctorTicketRoutes.js"
import patientRequestChangeTicketRoutes from "./routes/patientRequestChangeTicketRoutes.js";
import doctorRequestChangeTicketRoutes from "backend/routes/doctorRequestChangeTicketRoutes.js"

dotenv.config({ path: './backend/.env'});
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/doctortickets", doctorTicketRoutes) // used to create doctor entities
app.use("/api/patientrequestchangetickets", patientRequestChangeTicketRoutes) // for patients to request changes
app.use("/api/doctorrequestchangetickets", doctorRequestChangeTicketRoutes) // for doctors to request changes

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});