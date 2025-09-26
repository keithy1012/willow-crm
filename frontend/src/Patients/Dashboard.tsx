import React from "react";
import PatientSidebar from "../components/sidebar/PatientSidebar.tsx";
import DoctorSearchBar from "../components/input/SearchBar.tsx";
import LongTextArea from "../components/input/LongTextArea.tsx";
import MedicationCard from "../components/card/MedicationCard.tsx";
import UpcomingAppointmentCard from "../components/card/UpcomingAppointmentCard.tsx";

const Dashboard: React.FC = () => {
  const handleSearch = (doctorQuery: string, availabilityQuery: string) => {
    console.log("Search:", doctorQuery, availabilityQuery);
  };

  const handleAskQuestion = (question: string) => {
    console.log("Question:", question);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/*  make side bar sticky to the left */}
      <div className="fixed left-0 top-0 h-screen z-10">
        <PatientSidebar />
      </div>
      <div className="flex-1 ml-56 overflow-y-auto">
        <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-sm mb-4">
              Book your next Doctor's Appointment
            </h2>
            <DoctorSearchBar onSearch={handleSearch} />
          </div>
        </div>
        <div className="p-12">
          <div className="mb-4">
            <h1 className="flex justify-start text-2xl font-semibold text-primaryText mb-6">
              Lok Ye's Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
            {/* AI chatbot section - figure out how to display ansswer later */}
            <div className="lg:col-span-6">
              <div className="mb-4">
                <h2 className="flex justify-start text-xl font-md text-primaryText mb-2">
                  Ask me a question
                </h2>
                <p className="flex justify-start text-sm text-secondaryText mb-4">
                  This is your AI chatbot to help answer questions on your
                  appointments.
                </p>
                <LongTextArea
                  placeholder="Ask a question here..."
                  buttonText="Send"
                  onSubmit={handleAskQuestion}
                />
              </div>

              {/*Fill with data later - map to show only 3 and then see more goes to appointments page*/}
              <div>
                <h2 className="flex justify-start text-xl font-md text-primaryText mb-2">
                  My Medications
                </h2>
                <p className="flex justify-start text-sm text-secondaryText mb-4">
                  Preview your medications here.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  <MedicationCard
                    medication="Medication 1"
                    description="This is the instructions for the medication yess fjdfjfasdfasdf sklfsdf"
                  />
                  <MedicationCard
                    medication="Medication 1"
                    description="This is the instructions for the medication yess fjdfjfasdfasdf sklfsdf"
                  />
                  <MedicationCard
                    medication="Medication 1"
                    description="This is the instructions for the medication yess fjdfjfasdfasdf sklfsdf"
                  />
                </div>

                <div className="text-right text-sm font-sm mt-4">
                  <button className="text-secondaryText hover:text-primaryText transition-colors">
                    See More
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h2 className="flex justify-start text-xl font-md text-primaryText mb-2">
                Upcoming Appointments
              </h2>
              <p className="flex justify-start text-sm text-secondaryText mb-4">
                Look at your upcoming appointment details here.
              </p>
              {/*Fill with data later - map to show only 3 and then see more goes to appointments page*/}
              <div className="space-y-4 bg-foreground shadow-sm p-5 border border-stroke rounded-lg">
                <UpcomingAppointmentCard
                  date="September 20th, 2025"
                  doctorName="Dr. Lok Ye Young - Cardiologist"
                  appointmentType="Surgery"
                />
                <UpcomingAppointmentCard
                  date="September 20th, 2025"
                  doctorName="Dr. Lok Ye Young - Cardiologist"
                  appointmentType="Surgery"
                />
                <UpcomingAppointmentCard
                  date="September 20th, 2025"
                  doctorName="Dr. Lok Ye Young - Cardiologist"
                  appointmentType="Surgery"
                />
              </div>

              <div className="text-right text-sm font-sm mt-4">
                <button className="text-secondaryText hover:text-primaryText transition-colors">
                  See More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
