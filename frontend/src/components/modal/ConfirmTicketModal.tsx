import React from "react";
import {
  EnrichedTicket,
  EnrichedBugTicket,
  PatientTicket,
  DoctorTicket,
} from "../../api/types/ticket.types";

type AcceptedTicketTypes =
  | EnrichedTicket
  | EnrichedBugTicket
  | PatientTicket
  | DoctorTicket;

interface ConfirmTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticket: AcceptedTicketTypes | null;
}

const ConfirmTicketModal: React.FC<ConfirmTicketModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  ticket,
}) => {
  if (!isOpen || !ticket) return null;

  const getTitle = () => {
    if ("title" in ticket) return ticket.title;
    if ("ticketName" in ticket) return ticket.ticketName;
    return "Untitled Ticket";
  };

  const getDescription = () => {
    if ("description" in ticket && ticket.description)
      return ticket.description;
    if ("content" in ticket && ticket.content) return ticket.content;
    return "No description available";
  };

  // Try to extract an image URL or data URL from the description/content
  const extractImageFromText = (text: string | null) => {
    if (!text) return null;
    // data URL (base64) or direct image URL ending with common extensions
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
  const date = getDate();

  const getRequestedBy = () => {
    if ("patientName" in ticket && ticket.patientName)
      return ticket.patientName;
    if ("doctorName" in ticket && ticket.doctorName) return ticket.doctorName;
    if ("requestedBy" in ticket && ticket.requestedBy)
      return ticket.requestedBy;
    return "Unknown";
  };

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
            Confirm Ticket Claim
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          You're about to mark this ticket as <strong>in progress</strong>.
        </p>

        <hr className="my-3" />

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Requested By:</strong> {getRequestedBy()}
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
            Claim
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTicketModal;
