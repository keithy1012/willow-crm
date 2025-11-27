import React, { useEffect, useState } from "react";
import DoctorSearchBar from "../../components/input/SearchBar";
import MedicationCard from "../../components/card/MedicationCard";
import UpcomingAppointmentCard from "../../components/card/UpcomingAppointmentCard";
import DoctorSearchResults from "../../components/dashboard/DoctorSearchResults";
import AppointmentBookingModal from "../../components/modal/BookingModal";
import { useRequireRole } from "hooks/useRequireRole";
import { availabilityService } from "api/services/availability.service";
import { useAuth } from "contexts/AuthContext";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import LongTextArea from "../../components/input/LongTextArea";
import ChatModal from "components/modal/ChatsModal";

const Dashboard: React.FC = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    doctorId: string;
    doctorName: string;
    time: string;
    date: string;
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const [isBotTyping, setIsBotTyping] = useState(false);

  const user = useRequireRole("Patient");
  const { user: authUser } = useAuth();

  // Get patient name from auth context or localStorage
  const patientName = authUser?.firstName || user?.firstName || "Patient";

  const handleSearch = async (
    doctorQuery: string,
    availabilityQuery: string
  ) => {
    try {
      setIsSearching(true);
      setSearchError(null);

      // Store search parameters for display
      setSearchName(doctorQuery);
      setSearchDate(availabilityQuery);

      // Build search params
      const searchParams: { date?: string; name?: string } = {};

      // Format date from calendar picker
      if (availabilityQuery) {
        const formattedDate = new Date(availabilityQuery)
          .toISOString()
          .split("T")[0];
        searchParams.date = formattedDate;
      }

      // Add name search if provided
      if (doctorQuery) {
        searchParams.name = doctorQuery;
      }

      // If no search params, don't search
      if (Object.keys(searchParams).length === 0) {
        setIsSearching(false);
        return;
      }

      // Use the availability service
      const response = await availabilityService.searchByDateTime(searchParams);

      console.log("Search results:", response);
      setSearchResults(response.doctors || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError("Failed to search for doctors. Please try again.");
      setSearchResults([]);
    }
  };

  const handleBackToDashboard = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchDate("");
    setSearchName("");
    setSpecialtyFilter("");
    setSearchError(null);
  };

  const handleAskQuestion = async (newMessage: string) => {
    const updatedMessages: { sender: "user" | "bot"; text: string }[] = [
      ...chatMessages,
      { sender: "user", text: newMessage },
    ];

    setIsBotTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }), // send full context
      });

      const data = await res.json();
      setChatMessages([
        ...updatedMessages,
        { sender: "bot", text: data.answer },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSendChat = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || isBotTyping) return;
    // send and let handleAskQuestion update chatMessages
    await handleAskQuestion(trimmed);
    setChatInput("");
  };

  const handleBookAppointment = (doctorId: string, timeSlot: any) => {
    const doctor = searchResults.find((r) => r.doctor._id === doctorId)?.doctor;
    const doctorName = doctor
      ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`
      : "Doctor";

    setSelectedBooking({
      doctorId,
      doctorName,
      time: timeSlot.startTime,
      date: searchDate,
    });
    setShowBookingModal(true);
  };

  const handleMessageDoctor = (doctorId: string) => {
    console.log("Messaging doctor:", doctorId);
    // TODO: Navigate to messaging with doctor ID
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSpecialtyFilter(specialty);
  };

  return (
    <div className="flex w-full min-h-screen bg-background">
      <div className="flex-1 overflow-y-auto">
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

            {searchError && (
              <div className="mx-12 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {searchError}
              </div>
            )}

            <DoctorSearchResults
              searchDate={searchDate}
              searchName={searchName}
              results={searchResults}
              specialtyFilter={specialtyFilter}
              onSpecialtyChange={handleSpecialtyChange}
              onBookAppointment={handleBookAppointment}
              onMessageDoctor={handleMessageDoctor}
            />

            <AppointmentBookingModal
              isOpen={showBookingModal}
              onClose={() => setShowBookingModal(false)}
              doctorName={selectedBooking?.doctorName ?? ""}
              appointmentTime={selectedBooking?.time ?? ""}
              appointmentDate={selectedBooking?.date ?? ""}
              onComplete={async (data) => {
                console.log("Booking completed:", data);
                // TODO: Implement booking API call
                setShowBookingModal(false);
                // Show success message
              }}
            />
          </div>
        ) : (
          <div className="p-12">
            <div className="mb-4">
              <h1 className="flex justify-start text-2xl font-semibold text-primaryText mb-6">
                {patientName}'s Dashboard
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
              <div className="lg:col-span-6">
                <div className="mb-4">
                  <div className="mb-6">
                    <h2 className="flex justify-start text-xl font-md text-primaryText mb-2">
                      Ask me a question
                    </h2>
                    <p className="flex justify-start text-sm text-secondaryText mb-4">
                      This is your AI chatbot to help answer questions on your
                      appointments.
                    </p>

                    <div className="flex gap-3">
                      <LongTextArea
                        value={chatInput}
                        onChange={(text) => setChatInput(text)}
                        placeholder="Type your question here..."
                        className="flex-1"
                      />

                      <PrimaryButton
                        text={isBotTyping ? "Sending..." : "Submit"}
                        variant="primary"
                        size="small"
                        disabled={isBotTyping}
                        onClick={async () => {
                          if (!chatInput.trim()) return;

                          await handleSendChat();
                          setChatModalOpen(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <ChatModal
                  isOpen={chatModalOpen}
                  onClose={() => setChatModalOpen(false)}
                  chatMessages={chatMessages}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  onSend={handleSendChat}
                  isBotTyping={isBotTyping}
                />

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
