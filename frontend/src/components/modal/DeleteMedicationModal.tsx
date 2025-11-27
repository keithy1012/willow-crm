import React from "react";
import { X, Pill } from "phosphor-react";
import PrimaryButton from "../buttons/PrimaryButton";

interface DeleteMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  medicationName: string;
  isLoading?: boolean;
}

const DeleteMedicationModal: React.FC<DeleteMedicationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  medicationName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
        <div className="border-b border-gray-200 p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X size={24} className="text-gray-500" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Pill size={28} className="text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primaryText text-left">
                Confirm Deletion
              </h1>
              <p className="text-secondaryText text-sm text-left">
                You're about to delete: {medicationName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-left text-primaryText">
            Are you sure you want to delete this medication?
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-800 mb-2">
              This will:
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Remove this medication from your active medications</li>
              <li>Cancel any pending refill reminders</li>
              <li>
                Archive your medication history (you can still access it in past
                records)
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              This won't:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Cancel any refill requests already sent to your pharmacy</li>
              <li>Delete your prescription from your provider's records</li>
              <li>
                Affect your ability to fill this prescription at a pharmacy
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <PrimaryButton
              onClick={onClose}
              text="Keep Medication"
              variant="outline"
              size="medium"
              className="w-full"
              disabled={isLoading}
            />
            <PrimaryButton
              onClick={onConfirm}
              text={isLoading ? "Deleting..." : "Delete"}
              variant="primary"
              size="medium"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMedicationModal;
