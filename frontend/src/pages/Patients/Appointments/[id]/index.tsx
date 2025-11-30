import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CaretLeft,
  FileText,
  Download,
  Eye,
  FilePdf,
  Calendar,
  Clock,
  Heartbeat,
  Notepad,
  X,
} from "phosphor-react";
import { appointmentService } from "api/services/appointment.service";
import { EnhancedAppointment } from "api/types/appointment.types";
import PrimaryButton from "components/buttons/PrimaryButton";
import toast from "react-hot-toast";

const PatientAppointmentView: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const base64ToPdfUrl = (base64: string): string => {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:application\/pdf;base64,/, "");

    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob and URL
    const blob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };
  const [appointment, setAppointment] = useState<EnhancedAppointment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"afterVisit" | "notes">(
    "afterVisit"
  );
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Create blob URLs for embedded PDFs from base64 and clean them up on change/unmount.
  const afterVisitPdfUrl = useMemo(() => {
    const base64 = (appointment as any)?.afterVisitSummary;
    if (!base64) return null;
    return base64ToPdfUrl(base64);
  }, [appointment?.afterVisitSummary]);

  const notesPdfUrl = useMemo(() => {
    const base64 = (appointment as any)?.notesAndInstructions;
    if (!base64) return null;
    return base64ToPdfUrl(base64);
  }, [appointment?.notesAndInstructions]);

  useEffect(() => {
    return () => {
      if (afterVisitPdfUrl) {
        URL.revokeObjectURL(afterVisitPdfUrl);
      }
      if (notesPdfUrl) {
        URL.revokeObjectURL(notesPdfUrl);
      }
    };
  }, [afterVisitPdfUrl, notesPdfUrl]);
  useEffect(() => {
    console.log("Full appointment data:", appointment);
    console.log(
      "Has afterVisitSummary field:",
      !!(appointment as any)?.afterVisitSummary
    );
    console.log(
      "afterVisitSummary length:",
      (appointment as any)?.afterVisitSummary?.length
    );
  }, [appointment]);
  useEffect(() => {
    if (!appointmentId) return;

    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);
        const appointmentData = await appointmentService.getAppointmentById(
          appointmentId
        );
        setAppointment(appointmentData as EnhancedAppointment);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        toast.error("Failed to load appointment details");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);

  const handleViewPdf = (pdfBase64: string, documentType: string) => {
    try {
      const pdfUrl = base64ToPdfUrl(pdfBase64);
      setPdfViewerUrl(pdfUrl);
      setShowPdfViewer(true);
    } catch (error) {
      console.error("Error viewing PDF:", error);
      toast.error("Failed to open PDF viewer");
    }
  };

  const handleDownloadPdf = (pdfBase64: string, filename: string) => {
    try {
      const pdfUrl = base64ToPdfUrl(pdfBase64);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = filename || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  const formatAppointmentDate = (dateInput: string | Date | undefined) => {
    if (!dateInput) return "";
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAppointmentTime = (
    startTime: string | Date | undefined,
    endTime: string | Date | undefined
  ) => {
    if (!startTime || !endTime) return "";
    const start =
      typeof startTime === "string" ? new Date(startTime) : startTime;
    const end = typeof endTime === "string" ? new Date(endTime) : endTime;

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Appointment not found</p>
      </div>
    );
  }

  const hasAfterVisitSummary = !!(appointment as any).afterVisitSummary;
  const hasNotesAndInstructions = !!(appointment as any).notesAndInstructions;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-stroke">
        <div className="px-12 py-6">
          <div
            className="flex flex-row items-center gap-2 cursor-pointer mb-4"
            onClick={() => navigate("/appointments")}
          >
            <CaretLeft size={24} className="text-primaryText" />
            <span className="text-primaryText">
              Appointments and Office Visits
            </span>
          </div>

          <h1 className="text-3xl font-semibold text-primaryText mb-4">
            Appointment - {formatAppointmentDate(appointment.startTime)}
          </h1>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && pdfViewerUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-[90%] h-[90%] p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {activeTab === "afterVisit"
                  ? "After Visit Summary"
                  : "Notes and Instructions"}
              </h2>
              <button
                onClick={() => {
                  setShowPdfViewer(false);
                  URL.revokeObjectURL(pdfViewerUrl);
                  setPdfViewerUrl(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <iframe
              src={pdfViewerUrl}
              className="w-full h-[calc(100%-60px)] rounded border border-gray-200"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="px-12 py-6">
        <div className="flex gap-4 border-b border-stroke">
          <button
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "afterVisit"
                ? "text-primary border-b-2 border-primary"
                : "text-secondaryText hover:text-primaryText"
            }`}
            onClick={() => setActiveTab("afterVisit")}
          >
            After Visit Summary
          </button>
          <button
            className={`pb-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "notes"
                ? "text-primary border-b-2 border-primary"
                : "text-secondaryText hover:text-primaryText"
            }`}
            onClick={() => setActiveTab("notes")}
          >
            Notes and Instructions
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-12 pb-12">
        {activeTab === "afterVisit" ? (
          <div>
            <p className="text-sm text-secondaryText mb-6">
              After visit summary from your Doctor.
            </p>

            {hasAfterVisitSummary ? (
              <div className="bg-white rounded-lg border border-stroke">
                {/* Embedded PDF Viewer */}
                {afterVisitPdfUrl ? (
                  <div>
                    <div className="p-4 border-b border-stroke flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        After Visit Summary
                      </h3>
                      <div className="flex gap-2">
                        <PrimaryButton
                          text="Download PDF"
                          variant="outline"
                          size="small"
                          icon={<Download size={18} />}
                          onClick={() =>
                            handleDownloadPdf(
                              (appointment as any).afterVisitSummary,
                              `AfterVisitSummary_${formatAppointmentDate(
                                appointment.startTime
                              ).replace(/\s/g, "_")}.pdf`
                            )
                          }
                        />
                      </div>
                    </div>
                    <iframe
                      src={afterVisitPdfUrl}
                      className="w-full h-[600px] border-0"
                      title="After Visit Summary PDF"
                    />
                    {(appointment as any).afterVisitSummaryUploadDate && (
                      <p className="text-xs text-secondaryText p-4 border-t border-stroke">
                        Uploaded on:{" "}
                        {new Date(
                          (appointment as any).afterVisitSummaryUploadDate
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-secondaryText mt-2">
                      Loading PDF...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No After Visit Summary Available
                </h3>
                <p className="text-sm text-gray-500">
                  Your doctor hasn't uploaded an after visit summary for this
                  appointment yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-secondaryText mb-6">
              Notes and Instructions from Care Team
            </p>

            {hasNotesAndInstructions ? (
              <div className="bg-white rounded-lg border border-stroke">
                {/* Embedded PDF Viewer */}
                {notesPdfUrl ? (
                  <div>
                    <div className="p-4 border-b border-stroke flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Notes and Instructions
                      </h3>
                      <div className="flex gap-2">
                        <PrimaryButton
                          text="Download PDF"
                          variant="outline"
                          size="small"
                          icon={<Download size={18} />}
                          onClick={() =>
                            handleDownloadPdf(
                              (appointment as any).notesAndInstructions,
                              `NotesAndInstructions_${formatAppointmentDate(
                                appointment.startTime
                              ).replace(/\s/g, "_")}.pdf`
                            )
                          }
                        />
                      </div>
                    </div>
                    <iframe
                      src={notesPdfUrl}
                      className="w-full h-[600px] border-0"
                      title="Notes and Instructions PDF"
                    />
                    {(appointment as any).notesAndInstructionsUploadDate && (
                      <p className="text-xs text-secondaryText p-4 border-t border-stroke">
                        Uploaded on:{" "}
                        {new Date(
                          (appointment as any).notesAndInstructionsUploadDate
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-secondaryText mt-2">
                      Loading PDF...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                <FileText size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Notes and Instructions Available
                </h3>
                <p className="text-sm text-gray-500">
                  Your care team hasn't uploaded notes and instructions for this
                  appointment yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Appointment Details Summary */}
        <div className="mt-8 bg-white rounded-lg border border-stroke p-6">
          <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-secondaryText" />
              <div>
                <p className="text-xs text-secondaryText">Date</p>
                <p className="text-sm font-medium">
                  {formatAppointmentDate(appointment.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-secondaryText" />
              <div>
                <p className="text-xs text-secondaryText">Time</p>
                <p className="text-sm font-medium">
                  {formatAppointmentTime(
                    appointment.startTime,
                    appointment.endTime
                  )}
                </p>
              </div>
            </div>
            {appointment.doctorID && (
              <div className="flex items-center gap-2">
                <Heartbeat size={20} className="text-secondaryText" />
                <div>
                  <p className="text-xs text-secondaryText">Doctor</p>
                  <p className="text-sm font-medium">
                    Dr. {(appointment.doctorID as any).user?.firstName}{" "}
                    {(appointment.doctorID as any).user?.lastName}
                  </p>
                </div>
              </div>
            )}
            {appointment.summary && (
              <div className="flex items-center gap-2">
                <Notepad size={20} className="text-secondaryText" />
                <div>
                  <p className="text-xs text-secondaryText">Reason</p>
                  <p className="text-sm font-medium">{appointment.summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAppointmentView;
