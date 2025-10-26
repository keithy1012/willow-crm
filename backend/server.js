import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import patientRoutes from "./routes/patients/patientRoutes.js"
import doctorRoutes from "./routes/doctors/doctorRoutes.js"
import opsMemberRoutes from "./routes/ops/opsMemberRoutes.js"
import itMemberRoutes from "./routes/its/itRoutes.js"
import doctorAccountCreationRoutes from "./routes/tickets/doctorAccountCreationRoutes.js"
import patientRequestChangeRoutes from "./routes/tickets/patientRequestChangeRoutes.js";
import doctorRequestChangeRoutes from "./routes/tickets/doctorRequestChangeRoutes.js"
import availabilityRoutes from "./routes/availabilityRoutes.js"  

dotenv.config({ path: './backend/.env'});
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes)
app.use("/api/doctors", doctorRoutes)
app.use("/api/opsMembers", opsMemberRoutes)
app.use("/api/itMembers", itMemberRoutes)

app.use("/api/tickets/doctorCreate", doctorAccountCreationRoutes); // used to create doctor entities
app.use("/api/tickets/patientChange", patientRequestChangeRoutes); // for patients to request changes
app.use("/api/tickets/doctorChange", doctorRequestChangeRoutes); // for doctors to request changes
app.use("/api/availability", availabilityRoutes);  


app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});