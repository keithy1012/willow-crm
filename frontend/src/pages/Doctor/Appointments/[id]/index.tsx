import {
  CaretLeft,
  Clock,
  ListBullets,
  Note,
  Pill,
  Warning,
} from "phosphor-react";
import { useEffect, useState } from "react";
import { patientService } from "api/services/patient.service";
import { appointmentService } from "api/services/appointment.service";
import { EnhancedAppointment } from "api/types/appointment.types";
import { User } from "api/types/user.types";
import { userService } from "api/services/user.service";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Patient } from "api/services/patient_expanded.service";
import ProfileAvatar from "components/avatar/Avatar";
import SmallInfoCard from "components/card/SmallInfoCard";
import {
  Heartbeat,
  Notepad,
  FileArrowUp,
  CheckCircle,
  XCircle,
} from "phosphor-react";
import PrimaryButton from "components/buttons/PrimaryButton";
import toast from "react-hot-toast";
import { medorderService } from "api/services/medorder.service";
import PrescribeMedicationModal from "components/modal/RefillModal";
import { doctorService } from "api/services/doctor.service";
import CancelAppointmentModal from "components/modal/CancelAppointmentModal";

const AppointmentDetails: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const [isLoading, setIsLoading] = useState(false);
  const [doctorId, setDoctorId] = useState<string>("");

  const [appointment, setAppointment] = useState<EnhancedAppointment | null>(
    null
  );
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PDF upload states
  const [afterVisitSummary, setAfterVisitSummary] = useState<File | null>(null);
  const [notesAndInstructions, setNotesAndInstructions] = useState<File | null>(
    null
  );
  const [afterVisitPreview, setAfterVisitPreview] = useState<string | null>(
    null
  );
  const [notesPreview, setNotesPreview] = useState<string | null>(null);
  const [uploadingAfterVisit, setUploadingAfterVisit] = useState(false);
  const [uploadingNotes, setUploadingNotes] = useState(false);
  const [afterVisitUploaded, setAfterVisitUploaded] = useState(false);
  const [notesUploaded, setNotesUploaded] = useState(false);
  const [isPrescribeModalOpen, setIsPrescribeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelType, setCancelType] = useState<"cancel" | "no-show">("cancel");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [processingCancel, setProcessingCancel] = useState(false);

  const navigate = useNavigate();
  const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData.user);

        // Fetch the doctor ID using the user ID
        if (userData.user._id) {
          const doctorData = await doctorService.getByUserId(userData.user._id);
          setDoctorId(doctorData._id);
          console.log("Doctor ID:", doctorData._id);
        }
      } catch (error) {
        console.error("Error fetching user/doctor data:", error);
      }
    };

    fetchUserData();
  }, []);
  useEffect(() => {
    if (!appointmentId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);

        const appointmentData = await appointmentService.getAppointmentById(
          appointmentId
        );
        setAppointment(appointmentData as EnhancedAppointment);

        // Check if PDFs already exist
        if ((appointmentData as any).afterVisitSummary) {
          setAfterVisitUploaded(true);
        }
        if ((appointmentData as any).notesAndInstructions) {
          setNotesUploaded(true);
        }

        const patientData = (appointmentData as any).patientID;
        setPatient(patientData as Patient);
        console.log("Fetched patient data:", patientData);
        console.log("Fetched appointment data:", appointmentData);
      } catch (err: any) {
        console.error("Error fetching details:", err);
        setError("Failed to fetch appointment or patient details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "File must be less than 16 MB";
    }
    if (file.type !== "application/pdf") {
      return "File must be a PDF";
    }
    return null;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "afterVisit" | "notes"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    if (type === "afterVisit") {
      setAfterVisitSummary(file);
      setAfterVisitPreview(file.name);
      setAfterVisitUploaded(false);
    } else {
      setNotesAndInstructions(file);
      setNotesPreview(file.name);
      setNotesUploaded(false);
    }
  };

  const handleRemoveFile = (type: "afterVisit" | "notes") => {
    if (type === "afterVisit") {
      setAfterVisitSummary(null);
      setAfterVisitPreview(null);
    } else {
      setNotesAndInstructions(null);
      setNotesPreview(null);
    }
  };

  const handleUploadAfterVisitSummary = async () => {
    if (!afterVisitSummary || !appointmentId) return;

    setUploadingAfterVisit(true);
    try {
      const base64PDF = await fileToBase64(afterVisitSummary);

      // Update appointment with after visit summary
      await appointmentService.updateAppointmentDocuments(appointmentId, {
        afterVisitSummary: base64PDF,
        afterVisitSummaryName: afterVisitSummary.name,
        afterVisitSummaryUploadDate: new Date().toISOString(),
      });

      setAfterVisitUploaded(true);
      toast.success(
        "After Visit Summary uploaded and sent to patient successfully!"
      );

      // Send notification email to patient
      await appointmentService.notifyPatientOfDocument(appointmentId, {
        documentType: "afterVisitSummary",
        patientEmail: patient?.user.email,
        patientName: `${patient?.user.firstName} ${patient?.user.lastName}`,
        doctorName: `Dr. ${user?.firstName} ${user?.lastName}`,
        appointmentDate: new Date(
          appointment?.startTime || ""
        ).toLocaleDateString(),
      });
    } catch (error) {
      console.error("Error uploading after visit summary:", error);
      toast.error("Failed to upload After Visit Summary");
    } finally {
      setUploadingAfterVisit(false);
    }
  };

  const handleUploadNotesAndInstructions = async () => {
    if (!notesAndInstructions || !appointmentId) return;

    setUploadingNotes(true);
    try {
      const base64PDF = await fileToBase64(notesAndInstructions);

      // Update appointment with notes and instructions
      await appointmentService.updateAppointmentDocuments(appointmentId, {
        notesAndInstructions: base64PDF,
        notesAndInstructionsName: notesAndInstructions.name,
        notesAndInstructionsUploadDate: new Date().toISOString(),
      });

      setNotesUploaded(true);
      toast.success(
        "Notes and Instructions uploaded and sent to patient successfully!"
      );

      // Send notification email to patient
      await appointmentService.notifyPatientOfDocument(appointmentId, {
        documentType: "notesAndInstructions",
        patientEmail: patient?.user.email,
        patientName: `${patient?.user.firstName} ${patient?.user.lastName}`,
        doctorName: `Dr. ${user?.firstName} ${user?.lastName}`,
        appointmentDate: new Date(
          appointment?.startTime || ""
        ).toLocaleDateString(),
      });
    } catch (error) {
      console.error("Error uploading notes and instructions:", error);
      toast.error("Failed to upload Notes and Instructions");
    } finally {
      setUploadingNotes(false);
    }
  };

  const handleMessagePatient = (patientId: string) => {
    navigate(`/doctormessages?patientId=${patientId}`);
  };

  const handleViewPatientProfile = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const handleViewSummary = (appointmentId: string) => {
    navigate(`/doctor/appointment/${appointmentId}`);
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus:
      | "Scheduled"
      | "In-Progress"
      | "Completed"
      | "Cancelled"
      | "No-Show"
  ) => {
    try {
      await appointmentService.updateStatus(appointmentId, newStatus);

      // Optimistically update state
      setAppointment((prev) => (prev ? { ...prev, status: newStatus } : prev));

      toast.success(`Appointment marked as ${newStatus}`);
    } catch (error) {
      console.error(`Failed to update appointment status:`, error);
      toast.error(`Failed to mark appointment as ${newStatus}`);
    }
  };

  // Specific handlers
  const handleStartAppointment = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, "In-Progress");
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, "Completed");
  };

  const handleMarkNoShow = (appointmentId: string) => {
    console.log("Opening no-show modal for:", appointmentId);
    setSelectedAppointment(appointment);
    setCancelType("no-show");
    setIsCancelModalOpen(true);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log("Opening cancel modal for:", appointmentId);
    setSelectedAppointment(appointment);
    setCancelType("cancel");
    setIsCancelModalOpen(true);
  };
  const handleConfirmCancellation = async (
    reason: string,
    type: "cancel" | "no-show"
  ) => {
    if (!appointmentId) return;

    setProcessingCancel(true);
    try {
      if (type === "cancel") {
        await appointmentService.cancelWithReason(
          appointmentId,
          reason,
          "doctor"
        );
        toast.success("Appointment cancelled and patient notified");
        setAppointment((prev) =>
          prev ? { ...prev, status: "Cancelled" } : prev
        );
      } else {
        // Handle no-show
        await appointmentService.markNoShowWithReason(appointmentId, reason);
        toast.success("Appointment marked as no-show and patient notified");
        setAppointment((prev) =>
          prev ? { ...prev, status: "No-Show" } : prev
        );
      }

      setIsCancelModalOpen(false);
    } catch (error) {
      console.error("Error processing appointment:", error);
      toast.error("Failed to process appointment. Please try again.");
    } finally {
      setProcessingCancel(false);
    }
  };

  const handlePrescribe = async (prescriptionData: any) => {
    setIsLoading(true);
    try {
      const response = await medorderService.createMedorder(prescriptionData);

      if (response.success) {
        console.log("Prescription created successfully:", response.medorder);
        toast.success("Prescription sent successfully!");
        setIsPrescribeModalOpen(false);

        // Optionally, you can send an email notification here
        // await appointmentService.notifyPatientOfPrescription(...)
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error("Failed to create prescription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-12 flex flex-col gap-8">
      <div
        className="flex flex-row items-center gap-2 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <CaretLeft size={24} className="text-primaryText" />
        <h1 className="text-2xl font-semibold text-primaryText">
          Appointment with {patient?.user.firstName} {patient?.user.lastName} -{" "}
          {new Date(appointment?.startTime || "").toLocaleDateString()}
        </h1>
      </div>
      <div className="flex flex-row gap-12">
        <div className="flex flex-col gap-4 w-3/5">
          <div className="flex flex-row md:flex-row gap-4">
            <ProfileAvatar
              name={`${patient?.user.firstName} ${patient?.user.lastName}`}
              size={60}
            />
            <div className="text-sm">
              <p>
                Patient: {patient?.user.firstName} {patient?.user.lastName}
              </p>
              <p>Gender: {patient?.user.gender}</p>
              <p>Email: {patient?.user.email}</p>
            </div>
          </div>
          <div className="flex flex-row gap-6">
            <SmallInfoCard
              icon={Heartbeat}
              title={"Appointment Symptoms"}
              value={
                appointment?.appointmentReason || appointment?.summary || ""
              }
              backgroundWhite={true}
              width="1/2"
            />
            <SmallInfoCard
              backgroundWhite={true}
              icon={Heartbeat}
              title={"Appointment Time"}
              value={
                appointment?.startTime
                  ? new Date(appointment.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
              width="1/2"
            />
          </div>
          <p>Patient Information</p>
          <div className="flex flex-col space-y-4 bg-foreground p-4 rounded-xl border border-stroke shadow-sm">
            <div className="flex items-start gap-2">
              <Notepad size={24} className="text-primaryText" />
              <div className="flex flex-col">
                <span className="font-semibold">Patient Allergies:</span>
                {patient?.allergies && patient.allergies.length > 0 ? (
                  <ul className="list-disc list-inside mt-1">
                    {patient.allergies.map((allergy, index) => (
                      <li key={index}>{allergy}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">No allergies reported.</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Notepad size={24} className="text-primaryText" />
              <div className="flex flex-col">
                <span className="font-semibold">Patient Conditions:</span>
                {patient?.medicalHistory &&
                patient.medicalHistory.length > 0 ? (
                  <ul className="list-disc list-inside mt-1">
                    {patient.medicalHistory.map((condition, index) => (
                      <li key={index}>{condition}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">No conditions reported.</p>
                )}
              </div>
            </div>
          </div>
          <p>Appointment Notes</p>
          <div className="flex flex-col space-y-4 bg-foreground p-4 rounded-xl border border-stroke shadow-sm">
            <div className="flex items-start gap-2">
              <Notepad size={24} className="text-primaryText" />
              <div className="flex flex-col">
                <span className="font-semibold">Patient Symptom Summary:</span>
                {appointment?.summary && appointment.summary.length > 0 ? (
                  <ul className="list-disc list-inside mt-1">
                    {appointment.summary.split(",").map((symptom, index) => (
                      <li key={index}>{symptom.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">No symptoms reported.</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Notepad size={24} className="text-primaryText" />
              <div className="flex flex-col">
                <span className="font-semibold">Additional Information:</span>
                {appointment?.notes && appointment.notes.length > 0 ? (
                  <p className="mt-1">{appointment.notes}</p>
                ) : (
                  <p className="mt-1">No additional information reported.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-2/5 flex flex-col gap-6">
          <div className="grid grid-cols-2 flex-row gap-3">
            <button
              onClick={() => handleStartAppointment(appointmentId!)}
              disabled={
                appointment?.status === "In-Progress" ||
                appointment?.status === "Completed"
              }
              className={`flex-1 text-xs py-2 px-3 rounded-lg border-[0.5px] flex items-center justify-center gap-1 transition-colors ${
                appointment?.status === "In-Progress" ||
                appointment?.status === "Completed"
                  ? "bg-green-50 text-green-400 border-green-200 cursor-not-allowed"
                  : "bg-green-50 text-green-600 border-success hover:bg-green-100"
              }`}
            >
              <Clock size={14} />
              Start Appointment
            </button>

            <button
              onClick={() => handleCompleteAppointment(appointmentId!)}
              disabled={appointment?.status !== "In-Progress"}
              className={`flex-1 text-xs py-2 px-3 rounded-lg border-[0.5px] flex items-center justify-center gap-1 transition-colors ${
                appointment?.status !== "In-Progress"
                  ? "bg-green-50 text-green-400 border-green-200 cursor-not-allowed"
                  : "bg-green-50 text-green-600 border-success hover:bg-green-100"
              }`}
            >
              <CheckCircle size={14} />
              Complete
            </button>

            <button
              onClick={() => handleCancelAppointment(appointmentId!)}
              disabled={
                appointment?.status === "Cancelled" ||
                appointment?.status === "Completed"
              }
              className={`flex-1 text-xs py-2 px-3 rounded-lg border-[0.5px] flex items-center justify-center gap-1 transition-colors ${
                appointment?.status === "Cancelled" ||
                appointment?.status === "Completed"
                  ? "bg-red-50 text-red-400 border-red-200 cursor-not-allowed"
                  : "bg-red-50 text-red-600 border-error hover:bg-red-100"
              }`}
            >
              <XCircle size={14} />
              Cancel Appointment
            </button>

            <button
              onClick={() => handleMarkNoShow(appointmentId!)}
              disabled={
                appointment?.status === "No-Show" ||
                appointment?.status === "Completed"
              }
              className={`flex-1 text-xs py-2 px-3 rounded-lg border-[0.5px] flex items-center justify-center gap-1 transition-colors ${
                appointment?.status === "No-Show" ||
                appointment?.status === "Completed"
                  ? "bg-yellow-50 text-yellow-400 border-yellow-200 cursor-not-allowed"
                  : "bg-yellow-50 text-yellow-600 border-yellow-600 hover:bg-yellow-100"
              }`}
            >
              <Warning size={14} />
              Mark No-Show
            </button>
          </div>
          <PrimaryButton
            onClick={() => setIsPrescribeModalOpen(true)}
            text="Prescribe Medications"
            variant="primary"
            size="medium"
          />

          <PrescribeMedicationModal
            isOpen={isPrescribeModalOpen}
            onClose={() => setIsPrescribeModalOpen(false)}
            patientName={`${patient?.user.firstName} ${patient?.user.lastName}`}
            patientID={patientId || patient?._id || ""}
            doctorID={doctorId} // <-- Use the state variable
            onComplete={handlePrescribe}
          />

          {/* After Visit Summary Upload */}
          <div
            className={`border-2 rounded-xl ${
              afterVisitUploaded
                ? "border-green-500 bg-green-50"
                : "border-darkerStroke border-dotted"
            } p-12 relative`}
          >
            {afterVisitUploaded && (
              <div className="absolute top-4 right-4">
                <CheckCircle size={24} className="text-green-500" />
              </div>
            )}
            {afterVisitPreview && !afterVisitUploaded ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-primaryText mb-2">
                  {afterVisitPreview}
                </p>
                <button
                  onClick={() => handleRemoveFile("afterVisit")}
                  className="text-red-500 text-sm hover:text-red-600 mb-4"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <FileArrowUp
                  className="w-12 h-12 text-primaryText mb-3"
                  size={48}
                  weight="thin"
                />
                <span className="text-sm text-primaryText">
                  {afterVisitUploaded
                    ? "After Visit Summary Uploaded"
                    : "Upload After Visit Summary Here"}
                </span>
                <span className="text-xs text-primaryText mt-1">
                  PDF (max 16 MB)
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "afterVisit")}
                  className="hidden"
                  disabled={afterVisitUploaded}
                />
              </label>
            )}
          </div>

          <PrimaryButton
            text={
              uploadingAfterVisit
                ? "Sending..."
                : afterVisitUploaded
                ? "After Visit Summary Sent"
                : "Send After Visit Summary to Patient"
            }
            variant={afterVisitUploaded ? "outline" : "primary"}
            size={"small"}
            onClick={handleUploadAfterVisitSummary}
            disabled={
              !afterVisitSummary || uploadingAfterVisit || afterVisitUploaded
            }
          />

          {/* Notes and Instructions Upload */}
          <div
            className={`border-2 rounded-xl ${
              notesUploaded
                ? "border-green-500 bg-green-50"
                : "border-darkerStroke border-dotted"
            } p-12 relative`}
          >
            {notesUploaded && (
              <div className="absolute top-4 right-4">
                <CheckCircle size={24} className="text-green-500" />
              </div>
            )}
            {notesPreview && !notesUploaded ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-primaryText mb-2">{notesPreview}</p>
                <button
                  onClick={() => handleRemoveFile("notes")}
                  className="text-red-500 text-sm hover:text-red-600 mb-4"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <FileArrowUp
                  className="w-12 h-12 text-primaryText mb-3"
                  size={48}
                  weight="thin"
                />
                <span className="text-sm text-primaryText">
                  {notesUploaded
                    ? "Notes & Instructions Uploaded"
                    : "Upload Your Notes and Instructions Here"}
                </span>
                <span className="text-xs text-primaryText mt-1">
                  PDF (max 16 MB)
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "notes")}
                  className="hidden"
                  disabled={notesUploaded}
                />
              </label>
            )}
          </div>

          <PrimaryButton
            text={
              uploadingNotes
                ? "Sending..."
                : notesUploaded
                ? "Notes and Instructions Sent"
                : "Send Notes and Instructions to Patient"
            }
            variant={notesUploaded ? "outline" : "primary"}
            size={"small"}
            onClick={handleUploadNotesAndInstructions}
            disabled={!notesAndInstructions || uploadingNotes || notesUploaded}
          />
        </div>
      </div>
      <CancelAppointmentModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          if (!processingCancel) {
            setIsCancelModalOpen(false);
          }
        }}
        onConfirm={handleConfirmCancellation}
        type={cancelType}
        appointmentDate={
          appointment
            ? new Date(appointment.startTime).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : ""
        }
        appointmentTime={
          appointment
            ? new Date(appointment.startTime).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })
            : ""
        }
        patientName={
          patient?.user?.firstName && patient?.user?.lastName
            ? `${patient.user.firstName} ${patient.user.lastName}`
            : "Patient"
        }
        isLoading={processingCancel}
      />
    </div>
  );
};

export default AppointmentDetails;
