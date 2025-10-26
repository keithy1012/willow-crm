import React, { useState } from "react";
import PatientSidebar from "../components/sidebar/PatientSidebar.tsx";
import DoctorSearchBar from "../components/input/SearchBar.tsx";
import LongTextArea from "../components/input/LongTextArea.tsx";
import MedicationCard from "../components/card/MedicationCard.tsx";
import UpcomingAppointmentCard from "../components/card/UpcomingAppointmentCard.tsx";
import DoctorSearchResults from "../components/dashboard/DoctorSearchResults.tsx";
import DoctorResultCard from "../components/card/DoctorResultCard.tsx";

const Dashboard: React.FC = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const handleSearch = async (
    doctorQuery: string,
    availabilityQuery: string
  ) => {
    try {
      setIsSearching(true);
      let url = "/api/availability/search?";
      const params: string[] = [];

      // Store search parameters for display
      setSearchName(doctorQuery);
      setSearchDate(availabilityQuery);

      // Format date from calendar picker
      if (availabilityQuery) {
        const formattedDate = new Date(availabilityQuery)
          .toISOString()
          .split("T")[0];
        params.push(`date=${formattedDate}`);
      }

      // Add name search if provided
      if (doctorQuery) {
        params.push(`name=${encodeURIComponent(doctorQuery)}`);
      }

      // If no search params, don't search
      if (params.length === 0) {
        setIsSearching(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5050${url}${params.join("&")}`
      );
      const data = await response.json();

      console.log("Search results:", data);
      setSearchResults(data.doctors || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    }
  };

  const handleBackToDashboard = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchDate("");
    setSearchName("");
    setSpecialtyFilter("");
  };

  const handleAskQuestion = (question: string) => {
    console.log("Question:", question);
  };

  // NEED TO HANDLE BOOKING
  const handleBookAppointment = (doctorId: string, timeSlot: any) => {
    console.log("Booking appointment:", doctorId, timeSlot);
    alert(
      `Booking appointment for ${timeSlot.startTime} - ${timeSlot.endTime}`
    );
  };

  // NEED TO HANDLE MESSAGING
  const handleMessageDoctor = (doctorId: string) => {
    console.log("Messaging doctor:", doctorId);
  };

  // HANDLE SPECILATY FILTER CHANGE
  const handleSpecialtyChange = (specialty: string) => {
    setSpecialtyFilter(specialty);
  };

  return (
    <div className="flex w-full min-h-screen bg-background">
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

        {isSearching ? (
          <div>
            <div className="justify-start px-12 pt-6">
              <button
                onClick={handleBackToDashboard}
                className="text-primary hover:text-[#4A6B92] flex items-center gap-2 text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Dashboard
              </button>
            </div>

            <DoctorSearchResults
              searchDate={searchDate}
              searchName={searchName}
              results={searchResults}
              specialtyFilter={specialtyFilter}
              onSpecialtyChange={handleSpecialtyChange}
              onBookAppointment={handleBookAppointment}
              onMessageDoctor={handleMessageDoctor}
            />
          </div>
        ) : (
          <div className="p-12">
            <div className="mb-4">
              <h1 className="flex justify-start text-2xl font-semibold text-primaryText mb-6">
                Lok Ye's Dashboard
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
