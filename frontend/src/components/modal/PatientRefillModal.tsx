import React from "react";
import { X, Pill } from "phosphor-react";
import PrimaryButton from "../buttons/PrimaryButton";

interface RefillConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  medicationName: string;
  pharmacy: string;
  quantity: string;
  lastRefill: string;
  isLoading?: boolean;
}

const RefillConfirmationModal: React.FC<RefillConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  medicationName,
  pharmacy,
  quantity,
  lastRefill,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Pill size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primaryText text-left">
                Confirm Refill Request
              </h1>
              <p className="text-secondaryText text-sm text-left">
                You're about to request a refill for: {medicationName}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2 text-left">
            <p className="text-sm">
              <span className="font-semibold">Pharmacy:</span> {pharmacy}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Quantity:</span> {quantity}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Last Refill:</span> {lastRefill}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This request will be sent directly to your pharmacy. Refills are
              typically ready for pickup within 1-2 business days.
            </p>
          </div>

          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              • Make sure you have enough medication to last until your refill
              is ready
            </li>
            <li>
              • You'll receive a notification when your refill is ready for
              pickup
            </li>
          </ul>
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3">
            <PrimaryButton
              onClick={onClose}
              text="Cancel"
              variant="outline"
              size="medium"
              className="w-full"
              disabled={isLoading}
            />
            <PrimaryButton
              onClick={onConfirm}
              text={isLoading ? "Requesting..." : "Confirm"}
              variant="primary"
              size="medium"
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefillConfirmationModal;
