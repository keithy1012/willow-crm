import AppointmentCard from "components/card/AppointmentCard";
import SmallInfoCard from "components/card/SmallInfoCard";
import Dropdown from "components/input/Dropdown";
import { Calendar } from "phosphor-react";
import { useState } from "react";
import { useRequireRole } from "hooks/useRequireRole";

const Appointments = () => {
  const [sortBy, setSortBy] = useState("upcoming");
  useRequireRole("Patient");

  const pastAppointments = {
    "Past 6 Months": [
      {
        date: new Date("2025-07-20"),
        doctor: "Lok Ye Young",
        username: "lokyeyoung",
        doctorId: "123",
        type: "Surgery",
        summaryId: "sum123",
        instructionId: "ins123",
      },
    ],
    "Past 1 Year": [
      {
        date: new Date("2025-07-20"),
        doctor: "Lok Ye Young",
        username: "lokyeyoung",
        doctorId: "124",
        type: "Surgery",
        summaryId: "sum124",
        instructionId: "ins124",
      },
      {
        date: new Date("2025-07-20"),
        doctor: "Lok Ye Young",
        username: "lokyeyoung",
        doctorId: "125",
        type: "Surgery",
        summaryId: "sum125",
        instructionId: "ins125",
      },
    ],
  };

  return (
    <div className="p-16">
      <h1 className="font-semibold text-2xl mb-4">My Appointments</h1>

      <div className="mb-8 w-64">
        <label className="text-sm text-secondaryText mb-2 block">Sort By</label>
        <Dropdown
          value={sortBy}
          onChange={setSortBy}
          options={["Upcoming", "Past", "All"]}
          placeholder="Select sort option"
        />
      </div>

      <div className="space-y-5 mb-12">
        <h2 className="font-semibold text-xl">Upcoming Appointments</h2>

        <AppointmentCard
          dateOfAppointment={new Date("2025-09-20")}
          doctorName={"Lok Ye Young"}
          doctorUsername={"lokyeyoung"}
          doctorId={"1234566"}
          appointmentType={"Surgery"}
          instructionId={"123345"}
          notes={
            "I feel sick because of these reasons, and these are the symptoms that I am feeling"
          }
          past={false}
        />

        <AppointmentCard
          dateOfAppointment={new Date("2025-09-20")}
          doctorName={"Lok Ye Young"}
          doctorUsername={"lokyeyoung"}
          doctorId={"1234567"}
          appointmentType={"Surgery"}
          instructionId={"123346"}
          notes={
            "I feel sick because of these reasons, and these are the symptoms that I am feeling"
          }
          past={false}
        />
      </div>

      <div className="space-y-5">
        <h2 className="font-semibold text-xl mb-6">Past Appointments</h2>

        <div className="relative">
          <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-primaryText"></div>
          {Object.entries(pastAppointments).map(
            ([period, appointments], periodIndex) => (
              <div key={period} className="mb-12 relative">
                <div className="absolute left-0 w-5 h-5 bg-primaryText rounded-full border-4 border-white shadow-sm"></div>
                <div className="ml-10 mb-6">
                  <h3 className="font-medium text-lg text-primaryText">
                    {period}
                  </h3>
                </div>
                <div className="ml-10 grid grid-cols-2 gap-6">
                  {appointments.map((appointment, index) => (
                    <AppointmentCard
                      key={`${periodIndex}-${index}`}
                      dateOfAppointment={appointment.date}
                      doctorName={appointment.doctor}
                      doctorUsername={appointment.username}
                      doctorId={appointment.doctorId}
                      appointmentType={appointment.type}
                      summaryId={appointment.summaryId}
                      instructionId={appointment.instructionId}
                      past={true}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
