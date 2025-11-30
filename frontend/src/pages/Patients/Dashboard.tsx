import React, { useEffect, useState } from "react";
import DoctorSearchBar from "../../components/input/SearchBar";
import MedicationCard from "../../components/card/MedicationCard";
import UpcomingAppointmentCard from "../../components/card/UpcomingAppointmentCard";
import DoctorSearchResults from "../../components/dashboard/DoctorSearchResults";
import AppointmentBookingModal from "../../components/modal/BookingModal";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useRequireRole } from "hooks/useRequireRole";
import { useAuth } from "contexts/AuthContext";
import LongTextArea from "../../components/input/LongTextArea";
import ChatModal from "components/modal/ChatsModal";
import { MedorderResponse } from "api/types/medorder.types";
import { AvailableDoctorResult, TimeSlot } from "api/types/availability.types";
import toast from "react-hot-toast";
import { patientService, medorderService, availabilityService } from "api";
import { appointmentService } from "api/services/appointment.service";

const Dashboard: React.FC = () => {
  // ROLE ENFORCEMENT + AUTH
  const user = useRequireRole("Patient");
  const { user: authUser } = useAuth();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{
    doctorId: string;
    doctorName: string;
    timeSlot: TimeSlot;
    date: string;
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const [isBotTyping, setIsBotTyping] = useState(false);

  // State
  const [patientId, setPatientId] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [medications, setMedications] = useState<MedorderResponse[]>([]);
  const [loadingMedications, setLoadingMedications] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // PATIENT ID FETCH
  useEffect(() => {
    const loadPatient = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const userParsed = JSON.parse(stored);

          // The user object in localStorage should have the role-specific ID
          // For a patient user, the _id should be the patient ID
          // If not, we need to search for the patient by name

          try {
            // First try to get patient directly by the stored ID
            const patient = await patientService.getById(userParsed._id);
            setPatientId(patient._id);
            setPatientEmail(userParsed.email || "");
          } catch (err) {
            // If that fails, search for patient by name
            console.log("Direct patient fetch failed, searching by name...");
            const fullName = `${userParsed.firstName} ${userParsed.lastName}`;
            const searchResult = await patientService.searchByName(fullName);

            if (searchResult.patients && searchResult.patients.length > 0) {
              const patient = searchResult.patients[0];
              setPatientId(patient._id);
              setPatientEmail(userParsed.email || "");
            } else {
              throw new Error("Patient not found");
            }
          }
        }
      } catch (err) {
        console.error("Failed to load patient:", err);
        toast.error("Failed to load patient information");
      }
    };
    loadPatient();
  }, []);

  const patientName = authUser?.firstName || user?.firstName || "Patient";

  // UPCOMING APPOINTMENTS FETCH
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patientId) return;

      try {
        setLoadingAppointments(true);
        const appointments = (await appointmentService.getPatientAppointments(
          patientId
        )) as any[];
        setUpcomingAppointments(appointments);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load upcoming appointments");
      } finally {
        setLoadingAppointments(false);
      }
    };
    fetchAppointments();
  }, [patientId]);
  useEffect(() => {
    const fetchMedications = async () => {
      if (!patientId) return;

      try {
        setLoadingMedications(true);
        const response = await medorderService.getMedordersByPatient(patientId);
        setMedications(response.medorders);
      } catch (err) {
        console.error("Error fetching medications:", err);
        toast.error("Failed to load medications");
      } finally {
        setLoadingMedications(false);
      }
    };

    fetchMedications();
  }, [patientId]);

  // EMAIL TEST FUNCTION
  const testEmailService = async () => {
    setIsTestingEmail(true);

    try {
      const testData = {
        patientEmail: patientEmail || authUser?.email || "test@example.com",
        patientName: `${authUser?.firstName || "Test"} ${
          authUser?.lastName || "User"
        }`,
        doctorName: "Dr. Test Doctor",
        appointmentDate: new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        appointmentTime: "2:00 PM - 3:00 PM",
        appointmentId: "TEST-" + Date.now(),
        summary: "Test Appointment - Medical Consultation",
        notes:
          "This is a test email to verify the email service is working correctly.",
        symptoms: ["Test Symptom 1", "Test Symptom 2", "Test Symptom 3"],
      };

      console.log("Sending test email with data:", testData);

      const response = await fetch(
        "http://localhost:5001/api/appointments/test-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(testData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Test email sent to ${testData.patientEmail}! Check your inbox.`
        );
        console.log("Email sent successfully:", data);
      } else {
        toast.error("Failed to send test email. Check console for details.");
        console.error("Email error:", data);
      }
    } catch (error) {
      console.error("Test failed:", error);
      toast.error(
        "Email service test failed. Check your backend configuration."
      );
    } finally {
      setIsTestingEmail(false);
    }
  };

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
  const handleRefillRequest = async (medicationId: string) => {
    try {
      const medication = medications.find(
        (med) => med.orderID === medicationId
      );
      if (!medication) return;

      // Send refill request email
      await fetch("http://localhost:5050/api/medorders/refill-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicationName: medication.medicationName,
          patientName: `${medication.patientID.name}`,
          patientEmail: medication.patientID.email,
          quantity: medication.quantity,
          pharmacy: "Willow CRM Pharmacy",
          lastRefillDate: medication.lastRefillDate,
        }),
      });

      toast.success("Refill request sent successfully!");
    } catch (error) {
      console.error("Error requesting refill:", error);
      toast.error("Failed to request refill. Please try again.");
    }
  };
  // Updated handleBookAppointment function in Dashboard.tsx
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

    // Validate the time slot is 1 hour (60 minutes)
    console.log("Selected time slot:", slot);
    console.log("Slot start:", slot.startTime, "Slot end:", slot.endTime);

    const [startHour, startMin] = slot.startTime.split(":").map(Number);
    const [endHour, endMin] = slot.endTime.split(":").map(Number);
    const durationMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);

    // Allow slots between 30 and 90 minutes (to handle edge cases)
    if (durationMinutes > 90) {
      console.error(
        "ERROR: Time slot is too long:",
        durationMinutes,
        "minutes"
      );
      toast.error("Invalid time slot selected. Please select a 1-hour slot.");
      return;
    }

    setSelectedBooking({
      doctorId,
      doctorName,
      timeSlot: slot,
      date: searchDate,
    });
    setIsBookingModalOpen(true);
  };

  // Fixed handleBookingComplete function in Dashboard.tsx
  const handleBookingComplete = async (formData: any) => {
    if (!selectedBooking || !patientId) {
      toast.error("Missing booking information");
      return;
    }

    try {
      setIsBooking(true);

      const startTime = selectedBooking.timeSlot.startTime;

      // IMPORTANT: Calculate end time as 1 hour after start time
      const [startHour, startMin] = startTime.split(":").map(Number);
      let endHour = startHour + 1;
      let endMin = startMin;

      // Ensure we use the actual slot end time if it's provided and valid
      let endTime = selectedBooking.timeSlot.endTime;

      // Validate the slot is actually 1 hour
      const [slotEndHour, slotEndMin] = endTime.split(":").map(Number);
      const slotDuration =
        slotEndHour * 60 + slotEndMin - (startHour * 60 + startMin);

      // If the slot isn't 60 minutes, force it to be 1 hour
      if (slotDuration !== 60) {
        console.log(
          "Adjusting slot duration from",
          slotDuration,
          "to 60 minutes"
        );
        endTime = `${String(endHour).padStart(2, "0")}:${String(
          endMin
        ).padStart(2, "0")}`;
      }

      // Get patient email - prioritize the one from state/localStorage
      const storedUser = localStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      const finalPatientEmail =
        patientEmail || userData?.email || authUser?.email;

      // Get doctor email from search results
      let doctorEmail = undefined;
      const doctorData = searchResults.find(
        (r) => r.doctor._id === selectedBooking.doctorId
      );
      if (
        doctorData?.doctor?.user &&
        typeof doctorData.doctor.user === "object"
      ) {
        doctorEmail = doctorData.doctor.user.email;
      }

      // Build appointment data
      const appointmentData = {
        doctorId: selectedBooking.doctorId,
        patientId,
        date: selectedBooking.date,
        startTime,
        endTime, // This will now be exactly 1 hour after startTime
        summary: `${
          formData.newOrOngoing === "new" ? "New Condition" : "Follow-up"
        } - ${formData.symptoms?.join(", ") || "General Consultation"}`,
        notes: formData.notes || "",
        symptoms: formData.symptoms || [],
        duration: 60, // Always 60 minutes for 1-hour slots
        isEmergency: formData.isEmergency || false,
        patientEmail: finalPatientEmail, // Pass the patient email explicitly
        doctorEmail: doctorEmail,
      };

      console.log("Booking appointment with data:", appointmentData);
      console.log("Patient email being sent:", finalPatientEmail);

      const response = await appointmentService.book(appointmentData);

      toast.success(
        `Appointment booked successfully! Confirmation email sent to ${finalPatientEmail}.`
      );

      // Update search results to remove the booked slot
      setSearchResults((prev) =>
        prev.map((r) => {
          if (r.doctor._id === selectedBooking.doctorId) {
            // Filter out the booked slot or update the larger slot
            return {
              ...r,
              timeSlots: r.timeSlots.reduce(
                (slots: any, slot: { startTime: string; endTime: string }) => {
                  // If this is the exact slot that was booked, remove it
                  if (
                    slot.startTime === startTime &&
                    slot.endTime === endTime
                  ) {
                    return slots; // Don't include this slot
                  }

                  // If this is a larger slot containing the booked time
                  const [slotStartH, slotStartM] = slot.startTime
                    .split(":")
                    .map(Number);
                  const [slotEndH, slotEndM] = slot.endTime
                    .split(":")
                    .map(Number);
                  const [bookStartH, bookStartM] = startTime
                    .split(":")
                    .map(Number);
                  const [bookEndH, bookEndM] = endTime.split(":").map(Number);

                  const slotStartMin = slotStartH * 60 + slotStartM;
                  const slotEndMin = slotEndH * 60 + slotEndM;
                  const bookStartMin = bookStartH * 60 + bookStartM;
                  const bookEndMin = bookEndH * 60 + bookEndM;

                  // If the booked time is within this slot, split it
                  if (
                    bookStartMin >= slotStartMin &&
                    bookEndMin <= slotEndMin
                  ) {
                    const newSlots = [];

                    // Add slot before booked time if there's space
                    if (slotStartMin < bookStartMin) {
                      newSlots.push({
                        ...slot,
                        startTime: slot.startTime,
                        endTime: startTime,
                        isBooked: false,
                      });
                    }

                    // Add slot after booked time if there's space
                    if (bookEndMin < slotEndMin) {
                      newSlots.push({
                        ...slot,
                        startTime: endTime,
                        endTime: slot.endTime,
                        isBooked: false,
                      });
                    }

                    return [...slots, ...newSlots];
                  }

                  // Otherwise, keep the slot as is
                  return [...slots, slot];
                },
                [] as typeof r.timeSlots
              ),
            };
          }
          return r;
        })
      );

      // Refresh appointments list
      try {
        const appointments = (await appointmentService.getPatientAppointments(
          patientId
        )) as any[];
        setUpcomingAppointments(appointments);
      } catch (err) {
        console.log("Could not refresh appointments:", err);
      }

      setIsBookingModalOpen(false);
      setSelectedBooking(null);
    } catch (err: any) {
      console.error("Booking failed:", err);
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to book appointment. Please try again."
      );
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-2xl font-semibold text-primaryText">
                {patientName}'s Dashboard
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
              {/* LEFT SIDE */}
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

                {loadingMedications ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : medications.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                      {medications.slice(0, 3).map((medication) => (
                        <MedicationCard
                          key={medication.orderID}
                          medicationId={medication.orderID}
                          medicationName={medication.medicationName}
                          instruction={medication.instruction}
                          quantity={medication.quantity || "N/A"}
                          pharmacy="Willow CRM Pharmacy"
                          lastRefillDate={
                            medication.lastRefillDate
                              ? new Date(
                                  medication.lastRefillDate
                                ).toLocaleDateString()
                              : undefined
                          }
                          onRefillRequest={handleRefillRequest}
                        />
                      ))}
                    </div>

                    <div className="text-right text-sm font-sm mt-4">
                      {medications.length > 3 && (
                        <button
                          onClick={() =>
                            (window.location.href = "/medications")
                          }
                          className="text-secondaryText hover:text-primaryText transition-colors"
                        >
                          See {medications.length - 3} More
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-secondaryText">
                    <p>No medications prescribed yet</p>
                  </div>
                )}
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
                  {loadingAppointments ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : upcomingAppointments.length > 0 ? (
                    upcomingAppointments.slice(0, 3).map((appointment) => (
                      <UpcomingAppointmentCard
                        key={appointment._id}
                        date={new Date(
                          appointment.startTime
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        doctorName={
                          appointment.doctorID?.user?.firstName &&
                          appointment.doctorID?.user?.lastName
                            ? `Dr. ${appointment.doctorID.user.firstName} ${
                                appointment.doctorID.user.lastName
                              }${
                                appointment.doctorID.specialization
                                  ? ` - ${appointment.doctorID.specialization}`
                                  : ""
                              }`
                            : "Doctor"
                        }
                        appointmentType={
                          appointment.summary || "Medical Consultation"
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-secondaryText">
                      <p>No upcoming appointments</p>
                      <p className="text-sm mt-2">
                        Book an appointment to get started
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-right text-sm font-sm mt-4">
                  {upcomingAppointments.length > 3 && (
                    <button
                      onClick={() => (window.location.href = "/appointments")}
                      className="text-secondaryText hover:text-primaryText transition-colors"
                    >
                      See {upcomingAppointments.length - 3} More
                    </button>
                  )}
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
