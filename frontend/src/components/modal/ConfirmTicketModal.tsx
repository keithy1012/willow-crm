import React from "react";

interface Ticket {
  _id: string;
  title: string;
  doctorName: string;
  description: string;
  createdAt?: string;
}

interface ConfirmTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticket: Ticket | null;
}

const ConfirmTicketModal: React.FC<ConfirmTicketModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  ticket,
}) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full text-xl">
            ✓
          </div>
          <h2 className="ml-3 text-lg font-semibold text-gray-900">
            Confirm Ticket Completion
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          You’re about to mark this ticket as <strong>finished</strong>.
        </p>

        <hr className="my-3" />

        {/* Ticket Details */}
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Doctor Name:</strong> {ticket.doctorName}
          </p>
          <p>
            <strong>Ticket Name:</strong> {ticket.title}
          </p>
          {ticket.createdAt && (
            <p>
              <strong>Date Requested:</strong>{" "}
              {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          )}
          <p className="mt-2 text-gray-700">{ticket.description}</p>
        </div>

        <hr className="my-4" />

        {/* Action Buttons */}
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
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmTicketModal;
