import AppointmentCard from "components/card/AppointmentCard";
import SmallInfoCard from "components/card/SmallInfoCard";
import Dropdown from "components/input/Dropdown";
import { Calendar } from "phosphor-react";

const Appointments = () => (
  <div className="p-16">
    <h1 className="font-semibold text-2xl mb-8">My Appointments</h1>
    <div className="space-y-5 mb-12">
      <h2 className="font-semibold text-xl">Upcoming Appointments</h2>

      <AppointmentCard
        dateOfAppointment={new Date()}
        doctorName={"Lok Ye Young"}
        doctorUsername={"lokyeyoung"}
        doctorId={"1234566"}
        appointmentType={"Surgery"}
        instructionId={"123345"}
        notes={
          "I feel sick because of these reasons, and these are the symptoms that I am feeling"
        }
        past={false}
      ></AppointmentCard>
      <AppointmentCard
        dateOfAppointment={new Date()}
        doctorName={"Lok Ye Young"}
        doctorUsername={"lokyeyoung"}
        doctorId={"1234566"}
        appointmentType={"Surgery"}
        instructionId={"123345"}
        notes={
          "I feel sick because of these reasons, and these are the symptoms that I am feeling"
        }
        past={false}
      ></AppointmentCard>
    </div>
    <div className="space-y-5 mb-12">
      <h2 className="font-semibold text-xl">Past Appointments</h2>
      <AppointmentCard
        dateOfAppointment={new Date()}
        doctorName={"Lok Ye Young"}
        doctorUsername={"lokyeyoung"}
        doctorId={"1234566"}
        appointmentType={"Surgery"}
        instructionId={"123345"}
        notes={
          "I feel sick because of these reasons, and these are the symptoms that I am feeling"
        }
        past={true}
        width={"1/2"}
      ></AppointmentCard>
    </div>
  </div>
);
export default Appointments;
