import React, { useState } from "react";
import { X, Warning, XCircle } from "phosphor-react";
import PrimaryButton from "../buttons/PrimaryButton";
import LongTextArea from "../input/LongTextArea";

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, type: "cancel" | "no-show") => void;
  type: "cancel" | "no-show";
  appointmentDate: string;
  appointmentTime: string;
  patientName?: string;
  doctorName?: string;
  isLoading?: boolean;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  appointmentDate,
  appointmentTime,
  patientName,
  doctorName,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState<string>("");

  const cancelReasons = [
    "Schedule conflict",
    "Feeling better / No longer needed",
    "Weather or transportation issues",
    "Financial reasons",
    "Found another provider",
    "Other",
  ];

  const noShowReasons = [
    "Patient did not arrive",
    "Patient arrived late (past window)",
    "Patient forgot appointment",
    "Unable to contact patient",
    "Other",
  ];

  const reasons = type === "cancel" ? cancelReasons : noShowReasons;

  const handleConfirm = () => {
    const finalReason = selectedReason === "Other" ? reason : selectedReason;
    if (finalReason.trim()) {
      onConfirm(finalReason, type);
      setReason("");
      setSelectedReason("");
    }
  };

  const isConfirmDisabled = () => {
    if (selectedReason === "Other") {
      return reason.trim() === "" || isLoading;
    }
    return selectedReason === "" || isLoading;
  };

  if (!isOpen) return null;

  const getTitle = () => {
    if (type === "cancel") {
      return patientName
        ? `Cancel Appointment for ${patientName}`
        : "Cancel Appointment";
    }
    return `Mark as No-Show`;
  };

  const getDescription = () => {
    if (type === "cancel") {
      return patientName
        ? `Are you sure you want to cancel this appointment? ${patientName} will be notified via email.`
        : `Are you sure you want to cancel this appointment? ${doctorName} will be notified via email.`;
    }
    return `Mark this appointment as a no-show. ${patientName} will be notified via email.`;
  };

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] overflow-hidden">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 relative z-[10000]">
        <div className="border-b border-gray-200 p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={24} className="text-gray-500" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 ${
                type === "cancel" ? "bg-red-100" : "bg-yellow-100"
              } rounded-lg flex items-center justify-center`}
            >
              {type === "cancel" ? (
                <XCircle size={28} className="text-red-600" />
              ) : (
                <Warning size={28} className="text-yellow-600" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primaryText text-left">
                {getTitle()}
              </h1>
              <p className="text-secondaryText text-sm text-left">
                {appointmentDate} at {appointmentTime}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-left text-primaryText">
            {getDescription()}
          </p>

          <div>
            <label className="block text-sm font-medium text-primaryText mb-3 text-left">
              {type === "cancel"
                ? "Reason for cancellation"
                : "Reason for no-show"}
              <span className="text-error ml-1">*</span>
            </label>
            <div className="space-y-2">
              {reasons.map((reasonOption) => (
                <label
                  key={reasonOption}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption}
                    checked={selectedReason === reasonOption}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="form-radio text-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-primaryText">
                    {reasonOption}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === "Other" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-primaryText mb-2 text-left">
                Please specify
                <span className="text-error ml-1">*</span>
              </label>
              <LongTextArea
                button={false}
                placeholder="Enter your reason..."
                buttonText=""
                value={reason}
                onChange={(text) => setReason(text)}
              />
            </div>
          )}

          {type === "cancel" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong>{" "}
                {patientName ? "The patient" : "Your doctor"} will receive an
                email notification about this cancellation. Please contact them
                if you need to reschedule.
              </p>
            </div>
          )}

          {type === "no-show" && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> This will mark the appointment as a
                no-show. The patient will be notified via email and this may
                affect their future appointment scheduling.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <PrimaryButton
              onClick={onClose}
              text="Keep Appointment"
              variant="outline"
              size="medium"
              className="w-full"
              disabled={isLoading}
            />
            <PrimaryButton
              onClick={handleConfirm}
              text={
                isLoading
                  ? "Processing..."
                  : type === "cancel"
                  ? "Cancel Appointment"
                  : "Mark as No-Show"
              }
              variant="primary"
              size="medium"
              className={`w-full ${
                type === "cancel"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
              disabled={isConfirmDisabled()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelAppointmentModal;
