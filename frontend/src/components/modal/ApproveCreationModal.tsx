import React from "react";
import { DoctorAccountCreationTicket } from "../../api/types/ticket.types";

interface ApproveCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  ticket: DoctorAccountCreationTicket | null | any;
}

const ApproveCreationModal: React.FC<ApproveCreationModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  ticket,
}) => {
  if (!isOpen || !ticket) return null;

  const getRequestedBy = () => {
    if (ticket.firstName || ticket.lastName)
      return `${ticket.firstName || ""} ${ticket.lastName || ""}`.trim();
    if (ticket.requestedBy) return ticket.requestedBy;
    return "Unknown";
  };

  const getDate = (): string | null => {
    if (ticket.createdAt) return ticket.createdAt;
    if (ticket.dateCreated) return ticket.dateCreated;
    return null;
  };

  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString();
    } catch (e) {
      return String(d);
    }
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
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xl">
            ⚙️
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-900">
            Approve Account Creation
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          You're about to approve creation of a doctor account. This will create
          the account in the system.
        </p>

        <hr className="my-3" />

        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>First Name:</strong> {ticket.firstName || "N/A"}
          </p>
          <p>
            <strong>Last Name:</strong> {ticket.lastName || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {ticket.email || "N/A"}
          </p>
          <p>
            <strong>Phone Number:</strong> {ticket.phoneNumber || "N/A"}
          </p>
          <p>
            <strong>Gender:</strong> {ticket.gender || "N/A"}
          </p>
          <p>
            <strong>Bio:</strong> {ticket.bioContent || "N/A"}
          </p>
          <p>
            <strong>Education:</strong> {ticket.education || "N/A"}
          </p>
          <p>
            <strong>Graduation Date:</strong>{" "}
            {formatDate(ticket.graduationDate)}
          </p>
          <p>
            <strong>Speciality:</strong> {ticket.speciality || "N/A"}
          </p>
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
            onClick={onApprove}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary-dark transition"
          >
            Approve Creation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveCreationModal;
