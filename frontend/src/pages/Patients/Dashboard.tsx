import React, { useEffect, useState } from "react";
import DoctorSearchBar from "../../components/input/SearchBar";
import LongTextArea from "../../components/input/LongTextArea";
import MedicationCard from "../../components/card/MedicationCard";
import UpcomingAppointmentCard from "../../components/card/UpcomingAppointmentCard";
import DoctorSearchResults from "../../components/dashboard/DoctorSearchResults";
import AppointmentBookingModal from "../../components/modal/BookingModal";

import { useRequireRole } from "hooks/useRequireRole";
import { useAuth } from "contexts/AuthContext";

import { availabilityService } from "api/services/availability.service";
import { appointmentService } from "api/services/appointment.service";
import { patientService } from "api/services/patient.service";

import toast from "react-hot-toast";
import { AvailableDoctorResult } from "api/types/availability.types";

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  _id?: string;
}

const Dashboard: React.FC = () => {
  // ROLE ENFORCEMENT + AUTH
  const user = useRequireRole("Patient");
  const { user: authUser } = useAuth();

  // State
  const [patientId, setPatientId] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const [searchResults, setSearchResults] = useState<AvailableDoctorResult[]>(
    []
  );
  const [searchError, setSearchError] = useState<string | null>(null);

  const [specialtyFilter, setSpecialtyFilter] = useState("");

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<{
    doctorId: string;
    doctorName: string;
    timeSlot: TimeSlot;
    date: string;
  } | null>(null);

  // PATIENT ID FETCH
  useEffect(() => {
    const loadPatient = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const userParsed = JSON.parse(stored);
          const patient = await patientService.getById(userParsed._id);
          setPatientId(patient._id);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load patient information");
      }
    };
    loadPatient();
  }, []);

  const patientName = authUser?.firstName || user?.firstName || "Patient";

  // ---------------------------------------------
  // SEARCH + BOOKING LOGIC (from first component)
  // ---------------------------------------------
  const handleSearch = async (doctorQuery: string, dateQuery: string) => {
    try {
      setIsSearching(true);
      setSearchError(null);

      setSearchName(doctorQuery);

      // AUTO-FORMAT DATE (YYYY-MM-DD)
      let formatted = "";
      if (dateQuery) {
        const date = new Date(dateQuery);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        formatted = `${year}-${month}-${day}`;
      } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        formatted = `${year}-${month}-${day}`;
      }

      setSearchDate(formatted);

      // SEARCH
      const params: any = {};
      if (doctorQuery) params.name = doctorQuery;
      if (formatted) params.date = formatted;

      const response = await availabilityService.searchByDateTime(params);
      setSearchResults(response.doctors || []);
    } catch (err) {
      console.error(err);
      setSearchError("Failed to search for doctors. Please try again.");
      setSearchResults([]);
    }
  };

  const handleBookAppointment = (doctorId: string, slot: TimeSlot) => {
    const doctorData = searchResults.find(
      (r) => r.doctor._id === doctorId
    )?.doctor;

    let doctorName = "Doctor";
    if (doctorData) {
      const u = doctorData.user;
      doctorName =
        typeof u === "string" ? `Dr. ${u}` : `Dr. ${u.firstName} ${u.lastName}`;
    }

    setSelectedBooking({
      doctorId,
      doctorName,
      timeSlot: slot,
      date: searchDate,
    });
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = async (formData: any) => {
    if (!selectedBooking || !patientId) {
      toast.error("Missing booking information");
      return;
    }

    setIsBooking(true);

    try {
      const appt = {
        doctorId: selectedBooking.doctorId,
        patientId,
        date: selectedBooking.date,
        startTime: selectedBooking.timeSlot.startTime,
        endTime: selectedBooking.timeSlot.endTime,
        summary: `${
          formData.newOrOngoing === "new" ? "New Condition" : "Follow-up"
        } - ${formData.symptoms.join(", ")}`,
        notes: formData.notes,
        symptoms: formData.symptoms,
        duration: formData.duration,
        isEmergency: formData.isEmergency,
      };

      await appointmentService.book(appt);

      toast.success("Appointment booked successfully!");

      // Remove booked slot from results
      const updated = searchResults.map((r) => {
        if (r.doctor._id === selectedBooking.doctorId) {
          return {
            ...r,
            timeSlots: r.timeSlots.filter(
              (s) =>
                !(
                  s.startTime === selectedBooking.timeSlot.startTime &&
                  s.endTime === selectedBooking.timeSlot.endTime
                )
            ),
          };
        }
        return r;
      });

      setSearchResults(updated);
      setIsBookingModalOpen(false);
      setSelectedBooking(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Booking failed");
    } finally {
      setIsBooking(false);
    }
  };

  const handleMessageDoctor = (doctorId: string) => {
    window.location.href = `/messages?doctorId=${doctorId}`;
  };

  const handleBackToDashboard = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchError(null);
    setSearchName("");
    setSearchDate("");
  };

  const handleAskQuestion = (q: string) => {
    console.log("AI Question:", q);
  };

  // Helpers
  const formatTime = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const formatDate = (d: string) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    const dateObj = new Date(+y, +m - 1, +day);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="flex w-full min-h-screen bg-background">
      <div className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <div className="bg-gradient-to-b from-primary to-[#6886AC] text-white py-8 px-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-sm mb-4">
              Book your next Doctor's Appointment
            </h2>
            <DoctorSearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* SEARCH MODE */}
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
              onSpecialtyChange={setSpecialtyFilter}
              onBookAppointment={handleBookAppointment}
              onMessageDoctor={handleMessageDoctor}
            />

            {selectedBooking && (
              <AppointmentBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => {
                  if (!isBooking) {
                    setIsBookingModalOpen(false);
                    setSelectedBooking(null);
                  }
                }}
                doctorName={selectedBooking.doctorName}
                appointmentTime={`${formatTime(
                  selectedBooking.timeSlot.startTime
                )} - ${formatTime(selectedBooking.timeSlot.endTime)}`}
                appointmentDate={formatDate(selectedBooking.date)}
                onComplete={handleBookingComplete}
              />
            )}
          </div>
        ) : (
          // DASHBOARD HOME
          <div className="p-12">
            <h1 className="text-2xl font-semibold text-primaryText mb-6">
              {patientName}'s Dashboard
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
              {/* LEFT SIDE */}
              <div className="lg:col-span-6">
                <h2 className="text-xl font-md text-primaryText mb-2">
                  Ask me a question
                </h2>
                <p className="text-sm text-secondaryText mb-4">
                  This is your AI chatbot to help answer questions on your
                  appointments.
                </p>

                <LongTextArea
                  placeholder="Ask a question here..."
                  buttonText="Send"
                  onSubmit={handleAskQuestion}
                  button={true}
                />

                {/* MEDICATIONS */}
                <h2 className="mt-10 text-xl font-md text-primaryText mb-2">
                  My Medications
                </h2>
                <p className="text-sm text-secondaryText mb-4">
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

              {/* RIGHT SIDE */}
              <div className="lg:col-span-3">
                <h2 className="text-xl font-md text-primaryText mb-2">
                  Upcoming Appointments
                </h2>
                <p className="text-sm text-secondaryText mb-4">
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
