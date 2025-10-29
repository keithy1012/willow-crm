import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from 'http';
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patients/patientRoutes.js";
import doctorRoutes from "./routes/doctors/doctorRoutes.js";
import opsMemberRoutes from "./routes/ops/opsMemberRoutes.js";
import itMemberRoutes from "./routes/its/itRoutes.js";
import financeMemberRoutes from "./routes/finance/financeRoutes.js"
import doctorAccountCreationRoutes from "./routes/tickets/doctorAccountCreationRoutes.js";
import patientRequestChangeRoutes from "./routes/tickets/patientRequestChangeRoutes.js";
import doctorRequestChangeRoutes from "./routes/tickets/doctorRequestChangeRoutes.js";
import availabilityRoutes from "./routes/doctors/availabilityRoutes.js";
import socketServer from "./websocket/socketServer.js";

// Load .env from absolute backend folder path reliably
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/opsMembers", opsMemberRoutes);
app.use("/api/itMembers", itMemberRoutes);
app.use("/api/financeMembers", financeMemberRoutes)
app.use("/api/tickets/doctorCreate", doctorAccountCreationRoutes);
app.use("/api/tickets/patientChange", patientRequestChangeRoutes);
app.use("/api/tickets/doctorChange", doctorRequestChangeRoutes);
app.use("/api/availability", availabilityRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
socketServer.initialize(server);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server (only use server.listen, not app.listen)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket ready on ws://localhost:${PORT}/ws`);
});