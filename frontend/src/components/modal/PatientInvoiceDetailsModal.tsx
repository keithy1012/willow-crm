import React from "react";
import { FileText } from "phosphor-react";
import PrimaryButton from "components/buttons/PrimaryButton";
import { Invoice } from "api/types/finance.types";

interface PatientInvoiceDetailsModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}

const PatientInvoiceDetailsModal: React.FC<PatientInvoiceDetailsModalProps> = ({
  isOpen,
  invoice,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full">
              <FileText size={20} weight="regular" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Invoice Details
            </h3>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Doctor</p>
            <p className="text-base text-gray-800">
              {invoice.doctorName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Appointment Date</p>
            <p className="text-base text-gray-800">
              {invoice.appointmentDate}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Amount</p>
            <p className="text-base text-gray-800">
              ${invoice.amount?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-base text-gray-800 capitalize">
              {invoice.status || "pending"}
            </p>
          </div>
          {invoice.description && (
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-base text-gray-800">
                {invoice.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <PrimaryButton
            text="Close"
            onClick={onClose}
            variant="primary"
            size="medium"
            toggleable={false}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default PatientInvoiceDetailsModal;