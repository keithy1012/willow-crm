import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Verify critical env vars are loaded
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("❌ Missing JWT_SECRET or MONGO_URI in .env file");
  process.exit(1);
}

console.log("✅ Environment variables loaded");

import express from "express";
import cors from "cors";
import http from "http";
import connectDB from "./config/db.js";
import socketServer from "./websocket/socketServer.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patients/patientRoutes.js";
import doctorRoutes from "./routes/doctors/doctorRoutes.js";
import opsMemberRoutes from "./routes/ops/opsMemberRoutes.js";
import itMemberRoutes from "./routes/its/itRoutes.js";
import financeMemberRoutes from "./routes/finance/financeRoutes.js";
import doctorAccountCreationRoutes from "./routes/tickets/doctorAccountCreationRoutes.js";
import patientRequestChangeRoutes from "./routes/tickets/patientRequestChangeRoutes.js";
import doctorRequestChangeRoutes from "./routes/tickets/doctorRequestChangeRoutes.js";
import bugTicketRoutes from "./routes/tickets/bugTicketRoutes.js";
import availabilityRoutes from "./routes/doctors/availabilityRoutes.js";
import appointmentRoutes from "./routes/appointments/appointmentRoutes.js";
import medOrderRoutes from "./routes/medications/medOrderRoutes.js";

import authRoutes from "./routes/auth/authRoutes.js";
import chatRoutes from "./routes/chat/chatRoutes.js";
// Setup Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/opsMembers", opsMemberRoutes);
app.use("/api/itMembers", itMemberRoutes);
app.use("/api/financeMembers", financeMemberRoutes);
app.use("/api/tickets/doctorCreate", doctorAccountCreationRoutes);
app.use("/api/tickets/patientChange", patientRequestChangeRoutes);
app.use("/api/tickets/doctorChange", doctorRequestChangeRoutes);
app.use("/api/tickets/bugTicket", bugTicketRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medorders", medOrderRoutes);
app.use("/api/chat", chatRoutes);

// Start server
const server = http.createServer(app);
socketServer.initialize(server);

const PORT = process.env.PORT || 5050;

// Connect to DB and start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket ready on ws://localhost:${PORT}/ws`);
  });
});
