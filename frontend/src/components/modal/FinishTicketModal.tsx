import React from "react";
import {
  EnrichedTicket,
  EnrichedBugTicket,
  PatientTicket,
  DoctorTicket,
  DoctorAccountCreationTicket,
} from "../../api/types/ticket.types";

type AcceptedTicketTypes =
  | EnrichedTicket
  | EnrichedBugTicket
  | PatientTicket
  | DoctorTicket
  | DoctorAccountCreationTicket
  | (DoctorAccountCreationTicket & {
      ticketName: string;
      description: string;
      doctorName: string;
    }); 

interface FinishTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticket: AcceptedTicketTypes | null;
}

const FinishTicketModal: React.FC<FinishTicketModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  ticket,
}) => {
  if (!isOpen || !ticket) return null;

  const getTitle = () => {
    if ("title" in ticket) return ticket.title;
    if ("ticketName" in ticket) return ticket.ticketName;
    // For DoctorAccountCreationTicket
    if (
      "firstName" in ticket &&
      "lastName" in ticket &&
      !("ticketName" in ticket)
    ) {
      return `New Doctor Account: Dr. ${ticket.firstName} ${ticket.lastName}`;
    }
    return "Untitled Ticket";
  };

  const getDescription = () => {
    if ("description" in ticket && ticket.description)
      return ticket.description;
    if ("content" in ticket && ticket.content) return ticket.content;
    // For DoctorAccountCreationTicket
    if (
      "speciality" in ticket &&
      "education" in ticket &&
      !("description" in ticket)
    ) {
      const t = ticket as DoctorAccountCreationTicket;
      return `Speciality: ${t.speciality} | Education: ${t.education} | Email: ${t.email}`;
    }
    return "No description available";
  };

  const extractImageFromText = (text: string | null) => {
    if (!text) return null;
    const dataUrlMatch = text.match(
      /(data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+)/
    );
    if (dataUrlMatch) return dataUrlMatch[1];
    const urlMatch = text.match(
      /https?:\/\/[\w\-./?=&%#]+\.(?:png|jpe?g|gif|webp)/i
    );
    if (urlMatch) return urlMatch[0];
    return null;
  };

  const rawDescription = getDescription();
  const imageUrl = extractImageFromText(rawDescription);
  const descriptionText = imageUrl
    ? rawDescription.replace(imageUrl, "").trim()
    : rawDescription;

  const getDate = (): string | null => {
    const ticketAny = ticket as any;

    if (ticketAny.dateCreated) return ticketAny.dateCreated;
    if (ticketAny.createdAt) return ticketAny.createdAt;
    return null;
  };

  const getRequestedBy = () => {
    if ("patientName" in ticket && ticket.patientName)
      return ticket.patientName;
    if ("doctorName" in ticket && ticket.doctorName) return ticket.doctorName;
    // For DoctorAccountCreationTicket
    if (
      "firstName" in ticket &&
      "lastName" in ticket &&
      !("doctorName" in ticket)
    ) {
      return `${ticket.firstName} ${ticket.lastName}`;
    }
    return "Unknown";
  };

  const getRequestedByLabel = () => {
    // Determine the label based on ticket type
    if ("patientName" in ticket) return "Patient Name";
    if ("doctorName" in ticket) return "Doctor Name";
    if (
      "firstName" in ticket &&
      "lastName" in ticket &&
      !("doctorName" in ticket)
    ) {
      return "Applicant Name";
    }
    return "Requested By";
  };

  const isDoctorCreationTicket = () => {
    return (
      "firstName" in ticket &&
      "lastName" in ticket &&
      "speciality" in ticket &&
      "education" in ticket &&
      !("doctorName" in ticket && !("ticketName" in ticket))
    );
  };

  const getActionText = () => {
    return isDoctorCreationTicket() ? "approved" : "finished";
  };

  const getButtonText = () => {
    return isDoctorCreationTicket() ? "Approve" : "Finish";
  };

  const date = getDate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="flex items-center mb-4">
          <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-xl">
            ✓
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-900">
            Confirm Ticket Completion
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          You're about to mark this ticket as <strong>{getActionText()}</strong>.
        </p>

        <hr className="my-3" />

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>{getRequestedByLabel()}:</strong> {getRequestedBy()}
          </p>
          <p>
            <strong>Ticket Name:</strong> {getTitle()}
          </p>
          {date && (
            <p>
              <strong>Date Requested:</strong>{" "}
              {new Date(date).toLocaleDateString()}
            </p>
          )}
          <p className="mt-2 text-gray-700">{descriptionText}</p>
          {imageUrl && (
            <div className="my-3">
              <img
                src={imageUrl}
                alt="ticket-image-preview"
                className="w-full max-h-48 object-contain rounded-md border"
              />
            </div>
          )}
        </div>

        <hr className="my-4" />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-dark transition"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishTicketModal;