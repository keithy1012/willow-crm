import React from "react";
import { FileText } from "phosphor-react";
import Field from "components/input/Field";
import LongTextArea from "components/input/LongTextArea";
import PrimaryButton from "components/buttons/PrimaryButton";
import { CreateInvoiceData } from "api/types/finance.types";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  invoiceData: CreateInvoiceData;
  onClose: () => void;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (text: string) => void;
  onCreate: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  invoiceData,
  onClose,
  onFieldChange,
  onDescriptionChange,
  onCreate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-primary bg-opacity-10 p-2 rounded-full">
              <FileText size={20} weight="regular" className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Create Invoice
            </h3>
          </div>
          <p className="text-sm text-gray-500">
            Enter details to create a new patient invoice
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <Field
              placeholder="John Doe"
              type="text"
              value={invoiceData.patientName}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: { ...e.target, name: "patientName" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFieldChange(event);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Name
            </label>
            <Field
              placeholder="Dr. Smith"
              type="text"
              value={invoiceData.doctorName}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: { ...e.target, name: "doctorName" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFieldChange(event);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date
            </label>
            <Field
              placeholder="2025-01-15"
              type="date"
              value={invoiceData.appointmentDate}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: { ...e.target, name: "appointmentDate" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFieldChange(event);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <Field
              placeholder="250.00"
              type="number"
              value={invoiceData.amount}
              onChange={(e) => {
                const event = {
                  ...e,
                  target: { ...e.target, name: "amount" },
                } as React.ChangeEvent<HTMLInputElement>;
                onFieldChange(event);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <LongTextArea
              placeholder="Additional notes or service details..."
              value={invoiceData.description}
              onChange={onDescriptionChange}
              button={false}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <PrimaryButton
            text="Cancel"
            onClick={onClose}
            variant="outline"
            size="medium"
            toggleable={false}
            className="flex-1"
          />
          <PrimaryButton
            text="Create"
            onClick={onCreate}
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

export default CreateInvoiceModal;