import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patientRoutes.js"
import doctorRoutes from "./routes/doctorRoutes.js"
import doctorTicketRoutes from "./routes/doctorTicketRoutes.js"
import patientRequestChangeTicketRoutes from "./routes/patientRequestChangeTicketRoutes.js";
import doctorRequestChangeTicketRoutes from "./routes/doctorRequestChangeTicketRoutes.js"
import opsMemberRoutes from "./routes/opsMemberRoutes.js"
import itMemberRoutes from "./routes/itRoutes.js"
import availabilityRoutes from "./routes/availabilityRoutes.js"  

dotenv.config({ path: './backend/.env'});
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/doctortickets", doctorTicketRoutes)
app.use("/api/opsMembers", opsMemberRoutes)
app.use("/api/itMembers", itMemberRoutes)
app.use("/api/patientrequestchangetickets", patientRequestChangeTicketRoutes)
app.use("/api/doctorrequestchangetickets", doctorRequestChangeTicketRoutes)
app.use("/api/availability", availabilityRoutes);  

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});